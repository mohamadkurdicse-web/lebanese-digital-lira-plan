import axios from "axios";
import { exchangeRates, transactions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Database instance (will be injected)
let db: any = null;

export function setDatabase(database: any) {
  db = database;
}

/**
 * Exchange Service - Handles currency exchange and rate management
 */

interface ExchangeRate {
  lbpToUsdt: number;
  usdtToLbp: number;
  timestamp: Date;
  source: string;
}

interface ExchangeTransaction {
  userId: number;
  fromCurrency: "LBP" | "USDT";
  toCurrency: "USDT" | "LBP";
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  status: "PENDING" | "CONFIRMED" | "FAILED";
}

export class ExchangeService {
  private static readonly COINGECKO_API = "https://api.coingecko.com/api/v3";
  private static readonly UPDATE_INTERVAL = 60000; // 1 minute
  private static readonly FEE_PERCENTAGE = 0.5; // 0.5% fee

  /**
   * Get current exchange rate from CoinGecko API
   */
  static async getCurrentRate(): Promise<ExchangeRate> {
    try {
      const response = await axios.get(`${this.COINGECKO_API}/simple/price`, {
        params: {
          ids: "usd-coin",
          vs_currencies: "usd",
          include_market_cap: false,
          include_24hr_vol: false,
          include_last_updated_at: true,
        },
      });

      // Assuming 1 USD = 1 USDT
      const usdtPrice = response.data["usd-coin"].usd;

      // Assuming LBP rate (this would be fetched from a real source)
      // For now, using a fixed rate of 1 USD = 1694.92 LBP (approximate)
      const lbpRate = 1694.92;

      const lbpToUsdt = 1 / lbpRate;
      const usdtToLbp = lbpRate;

      return {
        lbpToUsdt,
        usdtToLbp,
        timestamp: new Date(),
        source: "CoinGecko",
      };
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // Return fallback rate
      return {
        lbpToUsdt: 0.00059,
        usdtToLbp: 1694.92,
        timestamp: new Date(),
        source: "FALLBACK",
      };
    }
  }

  /**
   * Save exchange rate to database
   */
  static async saveExchangeRate(rate: ExchangeRate): Promise<void> {
    try {
      await db.insert(exchangeRates).values({
        lbpToUsdt: rate.lbpToUsdt,
        usdtToLbp: rate.usdtToLbp,
        timestamp: rate.timestamp,
        source: rate.source,
      });
    } catch (error) {
      console.error("Error saving exchange rate:", error);
    }
  }

  /**
   * Get latest exchange rate from database
   */
  static async getLatestRate(): Promise<ExchangeRate | null> {
    try {
      const result = await db
        .select()
        .from(exchangeRates)
        .orderBy((t: any) => t.timestamp)
        .limit(1);

      if (result.length === 0) return null;

      const rate = result[0];
      return {
        lbpToUsdt: parseFloat(rate.lbpToUsdt.toString()),
        usdtToLbp: parseFloat(rate.usdtToLbp.toString()),
        timestamp: rate.timestamp,
        source: rate.source,
      };
    } catch (error) {
      console.error("Error getting latest rate:", error);
      return null;
    }
  }

  /**
   * Calculate exchange amount with fees
   */
  static calculateExchange(
    amount: number,
    rate: number,
    feePercentage: number = this.FEE_PERCENTAGE
  ): { exchangedAmount: number; fee: number; finalAmount: number } {
    const exchangedAmount = amount * rate;
    const fee = exchangedAmount * (feePercentage / 100);
    const finalAmount = exchangedAmount - fee;

    return { exchangedAmount, fee, finalAmount };
  }

  /**
   * Create exchange transaction
   */
  static async createTransaction(
    transaction: ExchangeTransaction
  ): Promise<{ id: string; success: boolean }> {
    try {
      const result = await db.insert(transactions).values({
        userId: transaction.userId,
        type: "TRANSFER",
        amount: transaction.toAmount.toString(),
        currency: transaction.toCurrency,
        status: transaction.status,
        metadata: JSON.stringify({
          fromCurrency: transaction.fromCurrency,
          fromAmount: transaction.fromAmount,
          rate: transaction.rate,
          fee: transaction.fee,
        }),
      });

      return { id: result.toString(), success: true };
    } catch (error) {
      console.error("Error creating transaction:", error);
      return { id: "", success: false };
    }
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(
    userId: number,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(transactions)
        .limit(limit);

      return result.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        timestamp: tx.createdAt,
        metadata: JSON.parse(tx.metadata || "{}"),
      }));
    } catch (error) {
      console.error("Error getting transaction history:", error);
      return [];
    }
  }

  /**
   * Get rate history
   */
  static async getRateHistory(hours: number = 24): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(exchangeRates)
        .limit(100);

      return result.map((rate: any) => ({
        timestamp: rate.timestamp,
        lbpToUsdt: parseFloat(rate.lbpToUsdt.toString()),
        usdtToLbp: parseFloat(rate.usdtToLbp.toString()),
        source: rate.source,
      }));
    } catch (error) {
      console.error("Error getting rate history:", error);
      return [];
    }
  }

  /**
   * Validate exchange transaction
   */
  static validateTransaction(
    fromAmount: number,
    toAmount: number,
    rate: number,
    fee: number
  ): { valid: boolean; error?: string } {
    if (fromAmount <= 0) {
      return { valid: false, error: "المبلغ يجب أن يكون أكبر من صفر" };
    }

    if (toAmount <= 0) {
      return { valid: false, error: "المبلغ المستقبل يجب أن يكون أكبر من صفر" };
    }

    if (rate <= 0) {
      return { valid: false, error: "السعر غير صحيح" };
    }

    if (fee < 0) {
      return { valid: false, error: "الرسوم غير صحيحة" };
    }

    return { valid: true };
  }

  /**
   * Get exchange statistics
   */
  static async getStatistics(): Promise<{
    totalTransactions: number;
    totalVolume: number;
    averageRate: number;
  }> {
    try {
      // This would require aggregation queries
      // For now, returning placeholder data
      return {
        totalTransactions: 0,
        totalVolume: 0,
        averageRate: 0.00059,
      };
    } catch (error) {
      console.error("Error getting statistics:", error);
      return {
        totalTransactions: 0,
        totalVolume: 0,
        averageRate: 0.00059,
      };
    }
  }
}

// Initialize rate updates
export function initializeExchangeService(): void {
  // Update rates every minute
  setInterval(async () => {
    const rate = await ExchangeService.getCurrentRate();
    await ExchangeService.saveExchangeRate(rate);
    console.log("[Exchange] Rate updated:", rate);
  }, ExchangeService["UPDATE_INTERVAL"]);

  // Initial rate fetch
  ExchangeService.getCurrentRate()
    .then((rate) => ExchangeService.saveExchangeRate(rate))
    .catch((error) => console.error("Error initializing exchange service:", error));
}
