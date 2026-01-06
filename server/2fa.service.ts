import speakeasy from "speakeasy";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * 2FA Service - Handles two-factor authentication
 */

interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
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

export class TwoFactorService {
  private emailTransporter: nodemailer.Transporter;

  constructor(emailConfig?: EmailConfig) {
    if (emailConfig) {
      this.emailTransporter = nodemailer.createTransport(emailConfig);
    } else {
      // Default configuration for testing
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
   * Generate 2FA secret and QR code
   */
  async generateSecret(userEmail: string, appName: string = "Digital Lira"): Promise<TwoFactorSecret> {
    try {
      const secret = speakeasy.generateSecret({
        name: `${appName} (${userEmail})`,
        issuer: appName,
        length: 32,
      });

      if (!secret.otpauth_url) {
        throw new Error("Failed to generate OTP auth URL");
      }

      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      console.error("[2FA Service] Failed to generate secret:", error);
      throw error;
    }
  }

  /**
   * Verify OTP token
   */
  verifyToken(secret: string, token: string, window: number = 2): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window,
      });

      return verified;
    } catch (error) {
      console.error("[2FA Service] Failed to verify token:", error);
      return false;
    }
  }

  /**
   * Send OTP via email
   */
  async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@digitallira.com",
        to: email,
        subject: "رمز التحقق الخاص بك - Digital Lira",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">رمز التحقق الخاص بك</h2>
              <p style="color: #666; text-align: center; font-size: 16px;">
                استخدم الرمز التالي للتحقق من هويتك:
              </p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
                <h1 style="color: #3b82f6; letter-spacing: 5px; margin: 0;">${otp}</h1>
              </div>
              <p style="color: #999; font-size: 12px; text-align: center;">
                هذا الرمز صالح لمدة 10 دقائق فقط
              </p>
              <p style="color: #999; font-size: 12px; text-align: center;">
                إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني
              </p>
            </div>
          </div>
        `,
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("[2FA Service] Failed to send OTP email:", error);
      return false;
    }
  }

  /**
   * Generate random OTP (6 digits)
   */
  generateRandomOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send 2FA setup confirmation email
   */
  async sendSetupConfirmationEmail(email: string, appName: string = "Digital Lira"): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@digitallira.com",
        to: email,
        subject: "تم تفعيل المصادقة الثنائية - Digital Lira",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">تم تفعيل المصادقة الثنائية</h2>
              <p style="color: #666; text-align: right; font-size: 16px;">
                تم تفعيل المصادقة الثنائية على حسابك بنجاح. سيتم طلب رمز التحقق في كل مرة تقوم بتسجيل الدخول.
              </p>
              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin: 20px 0; border-right: 4px solid #4caf50;">
                <p style="color: #2e7d32; margin: 0;">
                  <strong>ملاحظة مهمة:</strong> احفظ رموز النسخ الاحتياطية في مكان آمن. يمكنك استخدامها للوصول إلى حسابك إذا فقدت جهازك.
                </p>
              </div>
              <p style="color: #999; font-size: 12px; text-align: center;">
                إذا لم تقم بهذا الإجراء، يرجى تأمين حسابك فوراً
              </p>
            </div>
          </div>
        `,
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("[2FA Service] Failed to send setup confirmation email:", error);
      return false;
    }
  }

  /**
   * Send backup codes email
   */
  async sendBackupCodesEmail(email: string, backupCodes: string[]): Promise<boolean> {
    try {
      const codesHtml = backupCodes
        .map((code, index) => `<div style="padding: 5px;">${index + 1}. <code>${code}</code></div>`)
        .join("");

      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@digitallira.com",
        to: email,
        subject: "رموز النسخ الاحتياطية - Digital Lira",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">رموز النسخ الاحتياطية</h2>
              <p style="color: #666; text-align: right; font-size: 16px;">
                احفظ هذه الرموز في مكان آمن. يمكنك استخدام أي من هذه الرموز للوصول إلى حسابك إذا فقدت جهازك.
              </p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; font-family: monospace;">
                ${codesHtml}
              </div>
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-right: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0;">
                  <strong>تحذير:</strong> لا تشارك هذه الرموز مع أي شخص آخر. كل رمز يمكن استخدامه مرة واحدة فقط.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("[2FA Service] Failed to send backup codes email:", error);
      return false;
    }
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(backupCode: string, storedCodes: string[]): boolean {
    return storedCodes.includes(backupCode.toUpperCase());
  }

  /**
   * Remove used backup code
   */
  removeUsedBackupCode(backupCode: string, storedCodes: string[]): string[] {
    return storedCodes.filter((code) => code !== backupCode.toUpperCase());
  }
}

// Initialize 2FA service
export function initialize2FAService(): TwoFactorService {
  return new TwoFactorService();
}
