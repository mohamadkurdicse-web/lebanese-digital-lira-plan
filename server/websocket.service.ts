import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

/**
 * WebSocket Service - Handles real-time updates
 */

interface UserSession {
  userId: number;
  socketId: string;
  connectedAt: Date;
}

interface BalanceUpdate {
  userId: number;
  lbp: number;
  usdt: number;
  timestamp: Date;
}

interface TransactionUpdate {
  id: string;
  userId: number;
  type: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  amount: string;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  timestamp: Date;
}

export class WebSocketService {
  private io: SocketIOServer;
  private userSessions: Map<number, UserSession[]> = new Map();
  private activeConnections: Set<string> = new Set();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`[WebSocket] User connected: ${socket.id}`);
      this.activeConnections.add(socket.id);

      // User authentication and session setup
      socket.on("authenticate", (userId: number) => {
        this.registerUserSession(userId, socket.id);
        socket.join(`user-${userId}`);
        console.log(`[WebSocket] User ${userId} authenticated`);
      });

      // Listen for balance updates
      socket.on("request-balance-update", (userId: number) => {
        this.emitBalanceUpdate(userId);
      });

      // Listen for transaction updates
      socket.on("request-transaction-update", (userId: number) => {
        this.emitTransactionUpdate(userId);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        this.handleDisconnect(socket.id);
        console.log(`[WebSocket] User disconnected: ${socket.id}`);
      });

      // Error handling
      socket.on("error", (error) => {
        console.error(`[WebSocket] Error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Register user session
   */
  private registerUserSession(userId: number, socketId: string) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, []);
    }

    const sessions = this.userSessions.get(userId)!;
    sessions.push({
      userId,
      socketId,
      connectedAt: new Date(),
    });
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socketId: string) {
    this.activeConnections.delete(socketId);

    // Remove from user sessions
    const userIdsToDelete: number[] = [];
    this.userSessions.forEach((sessions: UserSession[], userId: number) => {
      const filtered = sessions.filter((s: UserSession) => s.socketId !== socketId);
      if (filtered.length === 0) {
        userIdsToDelete.push(userId);
      } else {
        this.userSessions.set(userId, filtered);
      }
    });

    userIdsToDelete.forEach((userId) => {
      this.userSessions.delete(userId);
    });
  }

  /**
   * Emit balance update to user
   */
  emitBalanceUpdate(userId: number, balance?: BalanceUpdate) {
    const defaultBalance: BalanceUpdate = {
      userId,
      lbp: 125000,
      usdt: 500,
      timestamp: new Date(),
    };

    this.io.to(`user-${userId}`).emit("balance-updated", balance || defaultBalance);
  }

  /**
   * Emit transaction update to user
   */
  emitTransactionUpdate(userId: number, transaction?: TransactionUpdate) {
    const defaultTransaction: TransactionUpdate = {
      id: `tx-${Date.now()}`,
      userId,
      type: "TRANSFER",
      amount: "1000",
      currency: "LBP",
      status: "CONFIRMED",
      timestamp: new Date(),
    };

    this.io.to(`user-${userId}`).emit("transaction-updated", transaction || defaultTransaction);
  }

  /**
   * Broadcast balance update to all connected users
   */
  broadcastBalanceUpdate(userId: number, balance: BalanceUpdate) {
    this.io.to(`user-${userId}`).emit("balance-updated", balance);
  }

  /**
   * Broadcast transaction update to all connected users
   */
  broadcastTransactionUpdate(userId: number, transaction: TransactionUpdate) {
    this.io.to(`user-${userId}`).emit("transaction-updated", transaction);
  }

  /**
   * Broadcast notification to user
   */
  notifyUser(userId: number, notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) {
    this.io.to(`user-${userId}`).emit("notification", notification);
  }

  /**
   * Broadcast system-wide notification
   */
  broadcastSystemNotification(notification: {
    type: string;
    title: string;
    message: string;
  }) {
    this.io.emit("system-notification", notification);
  }

  /**
   * Get active user count
   */
  getActiveUserCount(): number {
    return this.userSessions.size;
  }

  /**
   * Get total connections
   */
  getTotalConnections(): number {
    return this.activeConnections.size;
  }

  /**
   * Get user sessions
   */
  getUserSessions(userId: number): UserSession[] {
    return this.userSessions.get(userId) || [];
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId: number, event: string, data: any) {
    this.io.to(`user-${userId}`).emit(event, data);
  }

  /**
   * Emit event to all users
   */
  emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  /**
   * Get Socket.io instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Close WebSocket server
   */
  close() {
    this.io.close();
  }
}

// Initialize WebSocket service
export function initializeWebSocketService(httpServer: HTTPServer): WebSocketService {
  return new WebSocketService(httpServer);
}
