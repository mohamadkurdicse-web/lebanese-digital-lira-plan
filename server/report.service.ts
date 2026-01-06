import PDFDocument from "pdfkit";
import { createObjectCsvWriter } from "csv-writer";
import * as XLSX from "xlsx";
import { Readable } from "stream";

/**
 * Report Service - Handles report generation and export
 */

export interface ReportData {
  title: string;
  data: any[];
  columns: { key: string; label: string }[];
  dateRange?: { from: Date; to: Date };
  generatedAt?: Date;
}

export class ReportService {
  /**
   * Generate PDF report
   */
  static generatePDF(reportData: ReportData): Buffer {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: "A4",
          bufferPages: true,
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on("end", () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);

        // Header
        doc.fontSize(20).font("Helvetica-Bold").text(reportData.title, { align: "center" });
        doc.moveDown(0.5);

        // Date range
        if (reportData.dateRange) {
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(
              `من: ${reportData.dateRange.from.toLocaleDateString("ar-SA")} إلى: ${reportData.dateRange.to.toLocaleDateString("ar-SA")}`,
              { align: "center" }
            );
        }

        // Generated date
        doc.fontSize(10).text(`تم الإنشاء: ${new Date().toLocaleString("ar-SA")}`, { align: "center" });
        doc.moveDown(1);

        // Table header
        const columnWidths = this.calculateColumnWidths(reportData.columns, reportData.data);
        const startX = 50;
        let currentY = doc.y;

        // Draw table header
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#003366");

        let xPos = startX;
        for (const column of reportData.columns) {
          doc.text(column.label, xPos, currentY, {
            width: columnWidths[column.key],
            align: "center",
          });
          xPos += columnWidths[column.key];
        }

        doc.moveDown(0.8);
        currentY = doc.y;

        // Draw table rows
        doc.fontSize(10).font("Helvetica").fillColor("#000000");

        for (const row of reportData.data) {
          xPos = startX;
          for (const column of reportData.columns) {
            const value = row[column.key] || "-";
            doc.text(String(value), xPos, currentY, {
              width: columnWidths[column.key],
              align: "center",
            });
            xPos += columnWidths[column.key];
          }
          currentY += 20;
          doc.y = currentY;

          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage();
            currentY = 50;
            doc.y = currentY;
          }
        }

        // Footer
        doc.fontSize(9).fillColor("#999999").text("© الليرة الرقمية اللبنانية", 50, doc.page.height - 30, {
          align: "center",
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    }) as any;
  }

  /**
   * Generate CSV report
   */
  static async generateCSV(reportData: ReportData): Promise<string> {
    try {
      const csvWriter = createObjectCsvWriter({
        path: "/tmp/report.csv",
        header: reportData.columns.map((col) => ({
          id: col.key,
          title: col.label,
        })),
        encoding: "utf8",
      });

      await csvWriter.writeRecords(reportData.data);

      // Read the file
      const fs = await import("fs").then((m) => m.promises);
      const content = await fs.readFile("/tmp/report.csv", "utf8");

      // Clean up
      await fs.unlink("/tmp/report.csv");

      return content;
    } catch (error) {
      console.error("Error generating CSV:", error);
      throw error;
    }
  }

  /**
   * Generate Excel report
   */
  static generateExcel(reportData: ReportData): Buffer {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(reportData.data);

      // Set column widths
      const columnWidths = reportData.columns.map((col) => ({
        wch: Math.max(col.label.length, 15),
      }));
      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "التقرير");

      // Generate buffer
      return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    } catch (error) {
      console.error("Error generating Excel:", error);
      throw error;
    }
  }

  /**
   * Calculate column widths for PDF
   */
  private static calculateColumnWidths(
    columns: { key: string; label: string }[],
    data: any[]
  ): Record<string, number> {
    const widths: Record<string, number> = {};
    const pageWidth = 750; // A4 width minus margins
    const columnCount = columns.length;
    const baseWidth = pageWidth / columnCount;

    for (const column of columns) {
      widths[column.key] = baseWidth;
    }

    return widths;
  }

  /**
   * Get transaction report
   */
  static getTransactionReportData(transactions: any[]): ReportData {
    return {
      title: "تقرير المعاملات",
      data: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: `${tx.amount} ${tx.currency}`,
        status: tx.status,
        date: new Date(tx.createdAt).toLocaleDateString("ar-SA"),
        time: new Date(tx.createdAt).toLocaleTimeString("ar-SA"),
      })),
      columns: [
        { key: "id", label: "رقم المعاملة" },
        { key: "type", label: "النوع" },
        { key: "amount", label: "المبلغ" },
        { key: "status", label: "الحالة" },
        { key: "date", label: "التاريخ" },
        { key: "time", label: "الوقت" },
      ],
      generatedAt: new Date(),
    };
  }

  /**
   * Get exchange rate report
   */
  static getExchangeRateReportData(rates: any[]): ReportData {
    return {
      title: "تقرير أسعار الصرف",
      data: rates.map((rate) => ({
        lbpToUsdt: rate.lbpToUsdt.toFixed(6),
        usdtToLbp: rate.usdtToLbp.toFixed(2),
        date: new Date(rate.timestamp).toLocaleDateString("ar-SA"),
        time: new Date(rate.timestamp).toLocaleTimeString("ar-SA"),
        source: rate.source,
      })),
      columns: [
        { key: "lbpToUsdt", label: "LBP إلى USDT" },
        { key: "usdtToLbp", label: "USDT إلى LBP" },
        { key: "date", label: "التاريخ" },
        { key: "time", label: "الوقت" },
        { key: "source", label: "المصدر" },
      ],
      generatedAt: new Date(),
    };
  }

  /**
   * Get KYC report
   */
  static getKYCReportData(kycRequests: any[]): ReportData {
    return {
      title: "تقرير طلبات التحقق من الهوية",
      data: kycRequests.map((req) => ({
        id: req.id,
        userName: req.userName,
        email: req.email,
        status: req.status,
        submittedDate: new Date(req.submittedAt).toLocaleDateString("ar-SA"),
        reviewedDate: req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString("ar-SA") : "-",
      })),
      columns: [
        { key: "id", label: "رقم الطلب" },
        { key: "userName", label: "اسم المستخدم" },
        { key: "email", label: "البريد الإلكتروني" },
        { key: "status", label: "الحالة" },
        { key: "submittedDate", label: "تاريخ الإرسال" },
        { key: "reviewedDate", label: "تاريخ المراجعة" },
      ],
      generatedAt: new Date(),
    };
  }

  /**
   * Get user statistics report
   */
  static getUserStatisticsReportData(users: any[]): ReportData {
    return {
      title: "تقرير إحصائيات المستخدمين",
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        joinDate: new Date(user.createdAt).toLocaleDateString("ar-SA"),
        kycStatus: user.kycStatus || "-",
      })),
      columns: [
        { key: "id", label: "رقم المستخدم" },
        { key: "name", label: "الاسم" },
        { key: "email", label: "البريد الإلكتروني" },
        { key: "status", label: "الحالة" },
        { key: "joinDate", label: "تاريخ الانضمام" },
        { key: "kycStatus", label: "حالة KYC" },
      ],
      generatedAt: new Date(),
    };
  }
}
