
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

interface PDFReportOptions {
  title: string;
  dateRange?: {
    from: string;
    to: string;
  };
  headers: string[];
  data: (string | number)[][];
  filename: string;
  summary?: {
    totalItems: number;
    totalQuantity?: number;
    totalValue?: number;
  };
}

export class PDFService {
  private addHeader(doc: jsPDF, title: string, dateRange?: { from: string; to: string }) {
    // Add company logo/header background
    doc.setFillColor(59, 130, 246); // Blue color
    doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
    
    // Add title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const pageWidth = doc.internal.pageSize.width;
    doc.text(title, (pageWidth - titleWidth) / 2, 15);
    
    // Add subtitle/company name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const subtitle = 'Stock Management System';
    const subtitleWidth = doc.getTextWidth(subtitle);
    doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 25);
    
    // Add date range if provided
    if (dateRange) {
      doc.setFontSize(10);
      const dateText = `Period: ${dateRange.from} to ${dateRange.to}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, (pageWidth - dateWidth) / 2, 45);
    }
    
    // Add generation timestamp
    const timestamp = `Generated on: ${new Date().toLocaleString()}`;
    const timestampWidth = doc.getTextWidth(timestamp);
    doc.text(timestamp, (pageWidth - timestampWidth) / 2, dateRange ? 55 : 45);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
  }

  private addSummary(doc: jsPDF, summary: { totalItems: number; totalQuantity?: number; totalValue?: number }, startY: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 20, startY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let yPos = startY + 10;
    
    doc.text(`Total Items: ${summary.totalItems}`, 20, yPos);
    yPos += 8;
    
    if (summary.totalQuantity !== undefined) {
      doc.text(`Total Quantity: ${summary.totalQuantity}`, 20, yPos);
      yPos += 8;
    }
    
    if (summary.totalValue !== undefined) {
      doc.text(`Total Value: $${summary.totalValue.toFixed(2)}`, 20, yPos);
      yPos += 8;
    }
    
    return yPos + 10;
  }

  private addFooter(doc: jsPDF) {
    const pageCount = doc.internal.pages.length - 1;
    const pageSize = doc.internal.pageSize;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageSize.width - 30,
        pageSize.height - 10
      );
      doc.text(
        'Stock Management System',
        20,
        pageSize.height - 10
      );
    }
  }

  generateReport(options: PDFReportOptions): void {
    const doc = new jsPDF();
    
    // Add header
    this.addHeader(doc, options.title, options.dateRange);
    
    // Calculate start Y position
    let startY = options.dateRange ? 70 : 60;
    
    // Add summary if provided
    if (options.summary) {
      startY = this.addSummary(doc, options.summary, startY);
    }
    
    // Add table using autoTable
    autoTable(doc, {
      head: [options.headers],
      body: options.data,
      startY: startY,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 6,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Date column
        1: { cellWidth: 40 }, // Product name
        2: { cellWidth: 25 }, // Color
        3: { cellWidth: 25 }, // Size
        4: { cellWidth: 20, halign: 'center' }, // Quantity
      },
      margin: { left: 20, right: 20 },
      tableLineColor: [229, 231, 235],
      tableLineWidth: 0.1,
      theme: 'striped',
      didDrawPage: (data) => {
        // Add page numbers
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${data.pageNumber}`,
          data.settings.margin.left,
          pageHeight - 10
        );
        doc.text(
          'Stock Management System',
          pageSize.width - 60,
          pageHeight - 10
        );
      }
    });
    
    // Save the PDF
    doc.save(options.filename);
  }

  generateSalesReport(data: Record<string, unknown>[], dateRange: { from: string; to: string }, reportType: string): void {
    const headers = ['Date', 'Product Name', 'Color', 'Size', 'Qty Sold'];
    const formattedData: (string | number)[][] = data.map(item => [
      new Date(String(item.addedDate || new Date())).toLocaleDateString(),
      String(item.productName || 'N/A'),
      String(item.productColor || 'N/A'),
      String(item.productSize || 'N/A'),
      Number(item.productQuantity || 0)
    ]);

    // Calculate summary
    const totalQuantity = data.reduce((sum, item) => sum + Number(item.productQuantity || 0), 0);
    const summary = {
      totalItems: data.length,
      totalQuantity: totalQuantity
    };

    this.generateReport({
      title: `${reportType} Sales Report`,
      dateRange,
      headers,
      data: formattedData,
      filename: `${reportType?.toLowerCase?.()}-sales-report.pdf`,
      summary
    });
  }

  generateStockReport(data: Record<string, unknown>[], dateRange: { from: string; to: string }, reportType: string): void {
    const headers = ['Date', 'Product Name', 'Color', 'Size', 'Qty Added'];
    const formattedData: (string | number)[][] = data.map(item => [
      new Date(String(item.addedDate || new Date())).toLocaleDateString(),
      String(item.productName || 'N/A'),
      String(item.productColor || 'N/A'),
      String(item.productSize || 'N/A'),
      Number(item.productQuantity || 0)
    ]);

    // Calculate summary
    const totalQuantity = data.reduce((sum, item) => sum + Number(item.productQuantity || 0), 0);
    const summary = {
      totalItems: data.length,
      totalQuantity: totalQuantity
    };

    this.generateReport({
      title: `${reportType} Stock Report`,
      dateRange,
      headers,
      data: formattedData,
      filename: `${reportType?.toLowerCase?.()}-stock-report.pdf`,
      summary
    });
  }

  generateInventoryReport(data: Record<string, unknown>[], title: string = 'Inventory Report'): void {
    const headers = ['Product Name', 'Color', 'Size', 'Unit', 'Current Stock', 'Threshold', 'Status'];
    const formattedData: (string | number)[][] = data.map(item => [
      String(item.productName || 'N/A'),
      String(item.productColor || 'N/A'),
      String(item.productSize || 'N/A'),
      String(item.productUnit || 'N/A'),
      Number(item.actualProductQuantity || 0),
      Number(item.thresholdProductQuantity || 0),
      (Number(item.actualProductQuantity || 0) <= Number(item.thresholdProductQuantity || 0)) ? 'Low Stock' : 'In Stock'
    ]);

    // Calculate summary
    const totalItems = data.length;
    const lowStockItems = data.filter(item => Number(item.actualProductQuantity || 0) <= Number(item.thresholdProductQuantity || 0)).length;
    const totalStock = data.reduce((sum, item) => sum + Number(item.actualProductQuantity || 0), 0);

    const summary = {
      totalItems,
      totalQuantity: totalStock,
      lowStockItems
    };

    this.generateReport({
      title,
      headers,
      data: formattedData,
      filename: 'inventory-report.pdf',
      summary: {
        totalItems: summary.totalItems,
        totalQuantity: summary.totalQuantity
      }
    });
  }
}

export const pdfService = new PDFService();
