import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Digital Wallets table for storing user cryptocurrency wallets
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletAddress: varchar("walletAddress", { length: 255 }).notNull().unique(),
  walletType: mysqlEnum("walletType", ["LBP_DIGITAL", "USDT", "HYBRID"]).default("HYBRID").notNull(),
  publicKey: text("publicKey").notNull(),
  encryptedPrivateKey: text("encryptedPrivateKey").notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Balances table for tracking user account balances
 */
export const balances = mysqlTable("balances", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  currency: mysqlEnum("currency", ["LBP", "USDT"]).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull().default("0"),
  lockedAmount: decimal("lockedAmount", { precision: 20, scale: 8 }).notNull().default("0"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Balance = typeof balances.$inferSelect;
export type InsertBalance = typeof balances.$inferInsert;

/**
 * Transactions table for recording all financial transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionHash: varchar("transactionHash", { length: 255 }).unique(),
  fromWalletId: int("fromWalletId").notNull(),
  toWalletId: int("toWalletId").notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: mysqlEnum("currency", ["LBP", "USDT"]).notNull(),
  fee: decimal("fee", { precision: 20, scale: 8 }).notNull().default("0"),
  status: mysqlEnum("status", ["PENDING", "CONFIRMED", "FAILED"]).default("PENDING").notNull(),
  transactionType: mysqlEnum("transactionType", ["TRANSFER", "DEPOSIT", "WITHDRAWAL", "EXCHANGE"]).notNull(),
  description: text("description"),
  blockchainConfirmations: int("blockchainConfirmations").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Exchange Rates table for tracking currency conversion rates
 */
export const exchangeRates = mysqlTable("exchangeRates", {
  id: int("id").autoincrement().primaryKey(),
  fromCurrency: mysqlEnum("fromCurrency", ["LBP", "USDT"]).notNull(),
  toCurrency: mysqlEnum("toCurrency", ["LBP", "USDT"]).notNull(),
  rate: decimal("rate", { precision: 20, scale: 8 }).notNull(),
  source: varchar("source", { length: 100 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = typeof exchangeRates.$inferInsert;

/**
 * Audit Logs table for security and compliance
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }),
  resourceId: varchar("resourceId", { length: 255 }),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;