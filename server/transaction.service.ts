import { eq, and } from "drizzle-orm";
import { transactions, type Transaction, type InsertTransaction } from "../drizzle/schema";
import { getDb } from "./db";
import { getWalletBalance, updateWalletBalance, lockBalance, unlockBalance } from "./wallet.service";

/**
 * Transaction Service - Handles payment processing and transfers
 */

export async function createTransaction(
  fromWalletId: number,
  toWalletId: number,
  amount: string,
  currency: "LBP" | "USDT",
  transactionType: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "EXCHANGE",
  fee: string = "0",
  description?: string
): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Validate sufficient balance
    const fromBalance = await getWalletBalance(fromWalletId, currency);
    if (!fromBalance) throw new Error("Source wallet balance not found");

    const availableBalance = parseFloat(fromBalance.amount.toString()) - parseFloat(fromBalance.lockedAmount.toString());
    const totalAmount = parseFloat(amount) + parseFloat(fee);

    if (availableBalance < totalAmount) {
      throw new Error("Insufficient balance");
    }

    // Lock the amount
    await lockBalance(fromWalletId, currency, totalAmount.toString());

    // Create transaction record
    const result = await db.insert(transactions).values({
      fromWalletId,
      toWalletId,
      amount,
      currency,
      fee,
      status: "PENDING",
      transactionType,
      description,
      blockchainConfirmations: 0,
    });

    const transactionId = (result as any).insertId as number;
    return await getTransactionById(transactionId);
  } catch (error) {
    console.error("[Transaction Service] Failed to create transaction:", error);
    throw error;
  }
}

export async function getTransactionById(transactionId: number): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getWalletTransactions(walletId: number, limit: number = 50): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.fromWalletId, walletId),
        eq(transactions.status, "CONFIRMED")
      )
    )
    .orderBy(transactions.createdAt)
    .limit(limit);
}

export async function confirmTransaction(transactionId: number): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const transaction = await getTransactionById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    // Update from wallet balance
    const fromBalance = await getWalletBalance(transaction.fromWalletId, transaction.currency);
    if (!fromBalance) throw new Error("Source balance not found");

    const newFromAmount = (parseFloat(fromBalance.amount.toString()) - parseFloat(transaction.amount.toString()) - parseFloat(transaction.fee.toString())).toString();
    await updateWalletBalance(transaction.fromWalletId, transaction.currency, newFromAmount);

    // Update to wallet balance
    const toBalance = await getWalletBalance(transaction.toWalletId, transaction.currency);
    if (!toBalance) throw new Error("Destination balance not found");

    const newToAmount = (parseFloat(toBalance.amount.toString()) + parseFloat(transaction.amount.toString())).toString();
    await updateWalletBalance(transaction.toWalletId, transaction.currency, newToAmount);

    // Unlock the amount from source wallet
    await unlockBalance(transaction.fromWalletId, transaction.currency, (parseFloat(transaction.amount.toString()) + parseFloat(transaction.fee.toString())).toString());

    // Update transaction status
    await db.update(transactions).set({ status: "CONFIRMED", blockchainConfirmations: 1 }).where(eq(transactions.id, transactionId));

    return await getTransactionById(transactionId);
  } catch (error) {
    console.error("[Transaction Service] Failed to confirm transaction:", error);
    throw error;
  }
}

export async function failTransaction(transactionId: number, reason?: string): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const transaction = await getTransactionById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    // Unlock the amount
    await unlockBalance(transaction.fromWalletId, transaction.currency, (parseFloat(transaction.amount.toString()) + parseFloat(transaction.fee.toString())).toString());

    // Update transaction status
    await db
      .update(transactions)
      .set({ status: "FAILED", description: reason || "Transaction failed" })
      .where(eq(transactions.id, transactionId));

    return await getTransactionById(transactionId);
  } catch (error) {
    console.error("[Transaction Service] Failed to fail transaction:", error);
    throw error;
  }
}

export async function getTransactionByHash(transactionHash: string): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(transactions).where(eq(transactions.transactionHash, transactionHash)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTransactionHash(transactionId: number, transactionHash: string): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(transactions).set({ transactionHash }).where(eq(transactions.id, transactionId));
    return await getTransactionById(transactionId);
  } catch (error) {
    console.error("[Transaction Service] Failed to update transaction hash:", error);
    throw error;
  }
}

export async function incrementBlockchainConfirmations(transactionId: number): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const transaction = await getTransactionById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    const newConfirmations = (transaction.blockchainConfirmations || 0) + 1;
    await db.update(transactions).set({ blockchainConfirmations: newConfirmations }).where(eq(transactions.id, transactionId));

    return await getTransactionById(transactionId);
  } catch (error) {
    console.error("[Transaction Service] Failed to increment confirmations:", error);
    throw error;
  }
}
