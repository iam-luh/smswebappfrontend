
import { pdfService } from "./pdfService";

export const addPDFExportToMonthlyReports = (
  filteredData: Record<string, unknown>[],
  startDate: string,
  endDate: string,
  reportType: 'sales' | 'stock'
) => {
  if (reportType === 'sales') {
    pdfService.generateSalesReport(
      filteredData,
      { from: startDate, to: endDate },
      'Monthly'
    );
  } else {
    pdfService.generateStockReport(
      filteredData,
      { from: startDate, to: endDate },
      'Monthly'
    );
  }
};
