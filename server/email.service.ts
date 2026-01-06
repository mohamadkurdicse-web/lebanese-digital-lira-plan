import nodemailer from "nodemailer";

/**
 * Email Service - Handles email notifications
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static transporter: any = null;

  /**
   * Initialize email transporter
   */
  static initialize() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send email
   */
  static async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initialize();
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@lira-digital.com",
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`[Email] Sent to ${to}: ${template.subject}`);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send to ${to}:`, error);
      return false;
    }
  }

  /**
   * Get transfer confirmation template
   */
  static getTransferConfirmationTemplate(data: {
    userName: string;
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
    fee: number;
    rate: number;
    timestamp: string;
  }): EmailTemplate {
    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">تأكيد التحويل</h1>
        </div>
        <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>مرحباً ${data.userName},</p>
          <p>تم تنفيذ تحويلك بنجاح. إليك تفاصيل العملية:</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; text-align: right;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>المبلغ المرسل</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.fromAmount} ${data.fromCurrency}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>السعر</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">1 ${data.fromCurrency} = ${data.rate} ${data.toCurrency}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>الرسوم</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.fee} ${data.toCurrency}</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>المبلغ المستقبل</strong></td>
                <td style="padding: 10px; color: #10b981; font-weight: bold;">${data.toAmount} ${data.toCurrency}</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>الوقت</strong></td>
                <td style="padding: 10px;">${data.timestamp}</td>
              </tr>
            </table>
          </div>

          <p style="color: #666; font-size: 12px;">إذا لم تقم بهذه العملية، يرجى التواصل معنا فوراً.</p>
          <p style="color: #666; font-size: 12px;">مع أطيب التحيات،<br/>فريق الليرة الرقمية</p>
        </div>
      </div>
    `;

    const text = `
تأكيد التحويل

مرحباً ${data.userName},

تم تنفيذ تحويلك بنجاح. إليك تفاصيل العملية:

المبلغ المرسل: ${data.fromAmount} ${data.fromCurrency}
السعر: 1 ${data.fromCurrency} = ${data.rate} ${data.toCurrency}
الرسوم: ${data.fee} ${data.toCurrency}
المبلغ المستقبل: ${data.toAmount} ${data.toCurrency}
الوقت: ${data.timestamp}

إذا لم تقم بهذه العملية، يرجى التواصل معنا فوراً.

مع أطيب التحيات،
فريق الليرة الرقمية
    `;

    return {
      subject: "تأكيد التحويل - الليرة الرقمية",
      html,
      text,
    };
  }

  /**
   * Get security alert template
   */
  static getSecurityAlertTemplate(data: {
    userName: string;
    alertType: string;
    description: string;
    timestamp: string;
    ipAddress?: string;
  }): EmailTemplate {
    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">⚠️ تنبيه أمني</h1>
        </div>
        <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>مرحباً ${data.userName},</p>
          <p>تم اكتشاف نشاط غير عادي على حسابك:</p>
          
          <div style="background: #fee2e2; padding: 20px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #dc2626;">
            <p><strong>نوع التنبيه:</strong> ${data.alertType}</p>
            <p><strong>الوصف:</strong> ${data.description}</p>
            <p><strong>الوقت:</strong> ${data.timestamp}</p>
            ${data.ipAddress ? `<p><strong>عنوان IP:</strong> ${data.ipAddress}</p>` : ""}
          </div>

          <p style="color: #666;">إذا لم تقم بهذا النشاط، يرجى:</p>
          <ol style="color: #666;">
            <li>تغيير كلمة المرور الخاصة بك فوراً</li>
            <li>تفعيل المصادقة الثنائية</li>
            <li>التواصل مع فريق الدعم</li>
          </ol>

          <p style="color: #666; font-size: 12px;">مع أطيب التحيات،<br/>فريق الأمان - الليرة الرقمية</p>
        </div>
      </div>
    `;

    const text = `
تنبيه أمني

مرحباً ${data.userName},

تم اكتشاف نشاط غير عادي على حسابك:

نوع التنبيه: ${data.alertType}
الوصف: ${data.description}
الوقت: ${data.timestamp}
${data.ipAddress ? `عنوان IP: ${data.ipAddress}` : ""}

إذا لم تقم بهذا النشاط، يرجى:
1. تغيير كلمة المرور الخاصة بك فوراً
2. تفعيل المصادقة الثنائية
3. التواصل مع فريق الدعم

مع أطيب التحيات،
فريق الأمان - الليرة الرقمية
    `;

    return {
      subject: "تنبيه أمني - الليرة الرقمية",
      html,
      text,
    };
  }

  /**
   * Get KYC approval template
   */
  static getKYCApprovalTemplate(data: {
    userName: string;
    status: "APPROVED" | "REJECTED";
    message: string;
    timestamp: string;
  }): EmailTemplate {
    const isApproved = data.status === "APPROVED";
    const bgColor = isApproved ? "#10b981" : "#dc2626";
    const statusText = isApproved ? "تم الموافقة" : "تم الرفض";

    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 600px; margin: 0 auto;">
        <div style="background: ${bgColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">التحقق من الهوية - ${statusText}</h1>
        </div>
        <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>مرحباً ${data.userName},</p>
          <p>${isApproved ? "تم الموافقة على طلب التحقق من الهوية الخاص بك بنجاح!" : "لم يتم الموافقة على طلب التحقق من الهوية الخاص بك."}</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-right: 4px solid ${bgColor};">
            <p><strong>الحالة:</strong> ${statusText}</p>
            <p><strong>الملاحظات:</strong> ${data.message}</p>
            <p><strong>التاريخ:</strong> ${data.timestamp}</p>
          </div>

          ${isApproved ? `
            <p style="color: #666;">يمكنك الآن الوصول إلى جميع الميزات في التطبيق.</p>
          ` : `
            <p style="color: #666;">يرجى مراجعة الملاحظات أعلاه وإعادة محاولة التحقق.</p>
          `}

          <p style="color: #666; font-size: 12px;">مع أطيب التحيات،<br/>فريق الليرة الرقمية</p>
        </div>
      </div>
    `;

    const text = `
التحقق من الهوية - ${statusText}

مرحباً ${data.userName},

${isApproved ? "تم الموافقة على طلب التحقق من الهوية الخاص بك بنجاح!" : "لم يتم الموافقة على طلب التحقق من الهوية الخاص بك."}

الحالة: ${statusText}
الملاحظات: ${data.message}
التاريخ: ${data.timestamp}

${isApproved ? "يمكنك الآن الوصول إلى جميع الميزات في التطبيق." : "يرجى مراجعة الملاحظات أعلاه وإعادة محاولة التحقق."}

مع أطيب التحيات،
فريق الليرة الرقمية
    `;

    return {
      subject: `التحقق من الهوية - ${statusText} - الليرة الرقمية`,
      html,
      text,
    };
  }
}

// Initialize on import
EmailService.initialize();
