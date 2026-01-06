import { eq, and } from "drizzle-orm";
import { wallets, balances, transactions, type Wallet, type Balance, type Transaction } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Wallet Service - Handles all wallet-related operations
 */

export async function createWallet(
  userId: number,
  walletAddress: string,
  walletType: "LBP_DIGITAL" | "USDT" | "HYBRID",
  publicKey: string,
  encryptedPrivateKey: string
): Promise<Wallet | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(wallets).values({
      userId,
      walletAddress,
      walletType,
      publicKey,
      encryptedPrivateKey,
      isActive: "true",
    });

    const walletId = (result as any).insertId as number;

    // Initialize balances for both currencies
    await db.insert(balances).values([
      {
        walletId,
        currency: "LBP",
        amount: "0",
        lockedAmount: "0",
      },
      {
        walletId,
        currency: "USDT",
        amount: "0",
        lockedAmount: "0",
      },
    ]);

    return await getWalletById(walletId);
  } catch (error) {
    console.error("[Wallet Service] Failed to create wallet:", error);
    throw error;
  }
}

export async function getWalletById(walletId: number): Promise<Wallet | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserWallets(userId: number): Promise<Wallet[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(wallets).where(eq(wallets.userId, userId));
}

export async function getWalletByAddress(walletAddress: string): Promise<Wallet | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(wallets).where(eq(wallets.walletAddress, walletAddress)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getWalletBalance(walletId: number, currency: "LBP" | "USDT"): Promise<Balance | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(balances)
    .where(and(eq(balances.walletId, walletId), eq(balances.currency, currency)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateWalletBalance(
  walletId: number,
  currency: "LBP" | "USDT",
  amount: string
): Promise<Balance | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(balances)
      .set({ amount })
      .where(and(eq(balances.walletId, walletId), eq(balances.currency, currency)));

    return await getWalletBalance(walletId, currency);
  } catch (error) {
    console.error("[Wallet Service] Failed to update balance:", error);
    throw error;
  }
}

export async function lockBalance(
  walletId: number,
  currency: "LBP" | "USDT",
  amount: string
): Promise<Balance | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const balance = await getWalletBalance(walletId, currency);
    if (!balance) throw new Error("Balance not found");

    const currentLocked = parseFloat(balance.lockedAmount.toString());
    const newLocked = (currentLocked + parseFloat(amount)).toString();

    await db
      .update(balances)
      .set({ lockedAmount: newLocked })
      .where(and(eq(balances.walletId, walletId), eq(balances.currency, currency)));

    return await getWalletBalance(walletId, currency);
  } catch (error) {
    console.error("[Wallet Service] Failed to lock balance:", error);
    throw error;
  }
}

export async function unlockBalance(
  walletId: number,
  currency: "LBP" | "USDT",
  amount: string
): Promise<Balance | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const balance = await getWalletBalance(walletId, currency);
    if (!balance) throw new Error("Balance not found");

    const currentLocked = parseFloat(balance.lockedAmount.toString());
    const newLocked = Math.max(0, currentLocked - parseFloat(amount)).toString();

    await db
      .update(balances)
      .set({ lockedAmount: newLocked })
      .where(and(eq(balances.walletId, walletId), eq(balances.currency, currency)));

    return await getWalletBalance(walletId, currency);
  } catch (error) {
    console.error("[Wallet Service] Failed to unlock balance:", error);
    throw error;
  }
}
