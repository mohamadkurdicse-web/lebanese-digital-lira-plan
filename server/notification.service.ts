import nodemailer from "nodemailer";
import { getDb } from "./db";
import { eq } from "drizzle-orm";

/**
 * Notification Service - Handles user notifications and alerts
 */

export enum NotificationType {
  TRANSACTION = "TRANSACTION",
  SECURITY = "SECURITY",
  ACCOUNT = "ACCOUNT",
  SYSTEM = "SYSTEM",
}

export enum NotificationChannel {
  EMAIL = "EMAIL",
  IN_APP = "IN_APP",
  BOTH = "BOTH",
}

interface Notification {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  data?: Record<string, any>;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor(emailConfig?: EmailConfig) {
    if (emailConfig) {
      this.emailTransporter = nodemailer.createTransport(emailConfig);
    } else {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "localhost",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      });
    }
  }

  /**
   * Send transaction notification
   */
  async notifyTransaction(
    userEmail: string,
    transactionType: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL",
    amount: string,
    currency: string,
    status: string,
    recipientAddress?: string
  ): Promise<boolean> {
    try {
      const titleAr = this.getTransactionTitleAr(transactionType);
      const statusAr = this.getStatusAr(status);

      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@digitallira.com",
        to: userEmail,
        subject: `${titleAr} - ${amount} ${currency}`,
        html: this.getTransactionEmailTemplate(
          titleAr,
          amount,
          currency,
          statusAr,
          recipientAddress
        ),
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("[Notification Service] Failed to send transaction notification:", error);
      return false;
    }
  }

  /**
   * Send security alert
   */
  async notifySecurityAlert(
    userEmail: string,
    alertType: string,
    description: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@digitallira.com",
        to: userEmail,
        subject: `تنبيه أمان - ${alertType}`,
        html: this.getSecurityAlertEmailTemplate(alertType, description),
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("[Notification Service] Failed to send security alert:", error);
      return false;
    }
  }

  /**
   * Send account notification
   */
  async notifyAccountUpdate(
    userEmail: string,
    updateType: string,
    details: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@digitallira.com",
        to: userEmail,
        subject: `تحديث الحساب - ${updateType}`,
        html: this.getAccountUpdateEmailTemplate(updateType, details),
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("[Notification Service] Failed to send account notification:", error);
      return false;
    }
  }

  /**
   * Send system notification
   */
  async notifySystemMessage(
    userEmail: string,
    title: string,
    message: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@digitallira.com",
        to: userEmail,
        subject: title,
        html: this.getSystemMessageEmailTemplate(title, message),
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("[Notification Service] Failed to send system notification:", error);
      return false;
    }
  }

  /**
   * Get transaction title in Arabic
   */
  private getTransactionTitleAr(type: string): string {
    const titles: Record<string, string> = {
      TRANSFER: "تحويل أموال",
      DEPOSIT: "إيداع",
      WITHDRAWAL: "سحب",
    };
    return titles[type] || "معاملة";
  }

  /**
   * Get status in Arabic
   */
  private getStatusAr(status: string): string {
    const statuses: Record<string, string> = {
      PENDING: "قيد الانتظار",
      CONFIRMED: "مؤكدة",
      FAILED: "فشلت",
    };
    return statuses[status] || status;
  }

  /**
   * Get transaction email template
   */
  private getTransactionEmailTemplate(
    title: string,
    amount: string,
    currency: string,
    status: string,
    recipientAddress?: string
  ): string {
    return `
      <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">${title}</h2>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #666;"><strong>المبلغ:</strong> ${amount} ${currency}</p>
            <p style="margin: 10px 0; color: #666;"><strong>الحالة:</strong> <span style="color: ${status === "مؤكدة" ? "#4caf50" : "#ff9800"};">${status}</span></p>
            ${recipientAddress ? `<p style="margin: 10px 0; color: #666;"><strong>المستقبل:</strong> ${recipientAddress}</p>` : ""}
            <p style="margin: 10px 0; color: #666;"><strong>الوقت:</strong> ${new Date().toLocaleString("ar-EG")}</p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">إذا لم تقم بهذه المعاملة، يرجى الاتصال بنا فوراً</p>
        </div>
      </div>
    `;
  }

  /**
   * Get security alert email template
   */
  private getSecurityAlertEmailTemplate(alertType: string, description: string): string {
    return `
      <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #d32f2f; text-align: center;">تنبيه أمان</h2>
          <div style="background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; border-right: 4px solid #d32f2f;">
            <p style="color: #c62828; margin: 0;"><strong>${alertType}</strong></p>
            <p style="color: #c62828; margin: 10px 0 0 0;">${description}</p>
          </div>
          <p style="color: #666; text-align: right;">إذا لم تكن أنت من قام بهذا الإجراء، يرجى تأمين حسابك فوراً بتغيير كلمة المرور.</p>
        </div>
      </div>
    `;
  }

  /**
   * Get account update email template
   */
  private getAccountUpdateEmailTemplate(updateType: string, details: string): string {
    return `
      <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">تحديث الحساب</h2>
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-right: 4px solid #2196f3;">
            <p style="color: #1565c0; margin: 0;"><strong>${updateType}</strong></p>
            <p style="color: #1565c0; margin: 10px 0 0 0;">${details}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get system message email template
   */
  private getSystemMessageEmailTemplate(title: string, message: string): string {
    return `
      <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">${title}</h2>
          <p style="color: #666; text-align: right; line-height: 1.6;">${message}</p>
        </div>
      </div>
    `;
  }
}

// Initialize notification service
export function initializeNotificationService(): NotificationService {
  return new NotificationService();
}
