import { Router, Request, Response } from "express";
import { createWallet, getUserWallets, getWalletBalance, updateWalletBalance } from "./wallet.service";
import { createTransaction, getWalletTransactions, confirmTransaction, getTransactionById } from "./transaction.service";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Middleware to verify user authentication
 */
const verifyAuth = async (req: Request, res: Response, next: Function) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

/**
 * Wallet Routes
 */

// Create a new wallet
router.post("/api/wallets", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { walletAddress, walletType, publicKey, encryptedPrivateKey } = req.body;
    const userId = (req as any).userId;

    if (!walletAddress || !walletType || !publicKey || !encryptedPrivateKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const wallet = await createWallet(userId, walletAddress, walletType, publicKey, encryptedPrivateKey);
    res.json({ success: true, wallet });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Failed to create wallet" });
  }
});

// Get user wallets
router.get("/api/wallets", verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const userWallets = await getUserWallets(userId);
    res.json({ success: true, wallets: userWallets });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({ error: "Failed to fetch wallets" });
  }
});

// Get wallet balance
router.get("/api/wallets/:walletId/balance/:currency", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { walletId, currency } = req.params;
    const balance = await getWalletBalance(parseInt(walletId), currency as "LBP" | "USDT");
    res.json({ success: true, balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

/**
 * Transaction Routes
 */

// Create a transfer transaction
router.post("/api/transactions/transfer", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { fromWalletId, toWalletId, amount, currency, description } = req.body;

    if (!fromWalletId || !toWalletId || !amount || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate fee (0.5% of amount)
    const fee = (parseFloat(amount) * 0.005).toString();

    const transaction = await createTransaction(
      fromWalletId,
      toWalletId,
      amount,
      currency,
      "TRANSFER",
      fee,
      description
    );

    res.json({ success: true, transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: (error as Error).message || "Failed to create transaction" });
  }
});

// Get wallet transactions
router.get("/api/wallets/:walletId/transactions", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;
    const limit = parseInt((req.query.limit as string) || "50");

    const transactions = await getWalletTransactions(parseInt(walletId), limit);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get transaction details
router.get("/api/transactions/:transactionId", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const transaction = await getTransactionById(parseInt(transactionId));

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// Confirm transaction (webhook from blockchain)
router.post("/api/transactions/:transactionId/confirm", async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const transaction = await confirmTransaction(parseInt(transactionId));

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error("Error confirming transaction:", error);
    res.status(500).json({ error: "Failed to confirm transaction" });
  }
});

/**
 * User Routes
 */

// Get current user profile
router.get("/api/user/profile", verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await getDb();

    if (!db) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = result.length > 0 ? result[0] : null;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

/**
 * 2FA Routes
 */

// Generate 2FA secret
router.post("/api/2fa/generate", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { TwoFactorService } = await import("./2fa.service");
    const twoFactorService = new TwoFactorService();
    const userId = (req as any).userId;
    const db = await getDb();

    if (!db) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult.length > 0 ? userResult[0] : null;

    if (!user || !user.email) {
      return res.status(400).json({ error: "User email not found" });
    }

    const secret = await twoFactorService.generateSecret(user.email);
    res.json({ success: true, secret });
  } catch (error) {
    console.error("Error generating 2FA secret:", error);
    res.status(500).json({ error: "Failed to generate 2FA secret" });
  }
});

// Verify 2FA token
router.post("/api/2fa/verify", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { token, secret } = req.body;
    const { TwoFactorService } = await import("./2fa.service");
    const twoFactorService = new TwoFactorService();

    if (!token || !secret) {
      return res.status(400).json({ error: "Missing token or secret" });
    }

    const verified = twoFactorService.verifyToken(secret, token);
    res.json({ success: true, verified });
  } catch (error) {
    console.error("Error verifying 2FA token:", error);
    res.status(500).json({ error: "Failed to verify token" });
  }
});

/**
 * Notification Routes
 */

// Send transaction notification
router.post("/api/notifications/transaction", async (req: Request, res: Response) => {
  try {
    const { userEmail, transactionType, amount, currency, status, recipientAddress } = req.body;
    const { NotificationService } = await import("./notification.service");
    const notificationService = new NotificationService();

    const sent = await notificationService.notifyTransaction(
      userEmail,
      transactionType,
      amount,
      currency,
      status,
      recipientAddress
    );

    res.json({ success: true, sent });
  } catch (error) {
    console.error("Error sending transaction notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Send security alert
router.post("/api/notifications/security", async (req: Request, res: Response) => {
  try {
    const { userEmail, alertType, description } = req.body;
    const { NotificationService } = await import("./notification.service");
    const notificationService = new NotificationService();

    const sent = await notificationService.notifySecurityAlert(userEmail, alertType, description);
    res.json({ success: true, sent });
  } catch (error) {
    console.error("Error sending security alert:", error);
    res.status(500).json({ error: "Failed to send alert" });
  }
});

// Health check endpoint
router.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
