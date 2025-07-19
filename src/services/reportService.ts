import { stockChangeService } from './stockChangeService';
import { 
  SalesReportData, 
  StockReportData, 
} from '../types/reportTypes';

class ReportService {
  async getSalesReport(): Promise<SalesReportData[]> {
    try {
      const response = await stockChangeService.getAllChanges();
      const salesData = response.filter(change => change.stockChangeType === 'Stock Out');
      
      // Group by product name
      const groupedData = salesData.reduce((acc: { [key: string]: SalesReportData }, curr) => {
        const productName = curr.productName || 'Unknown';
        if (!acc[productName]) {
          acc[productName] = {
            productName,
            totalQuantity: 0,
            transactions: []
          };
        }
        acc[productName].totalQuantity += curr.productQuantity;
        acc[productName].transactions.push({
          id: curr.stockChangeID?.toString?.(),
          productName: curr.productName,
          color: curr.productColor,
          size: curr.productSize,
          quantity: curr.productQuantity,
          date: new Date(curr.addedDate).toLocaleDateString()
        });
        return acc;
      }, {});

      return Object.values(groupedData);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
  }

  async getStockReport(): Promise<StockReportData[]> {
    try {
      const response = await stockChangeService.getAllChanges();
      const stockData = response.filter(change => change.stockChangeType === 'Stock In');
      
      // Group by product name
      const groupedData = stockData.reduce((acc: { [key: string]: StockReportData }, curr) => {
        const productName = curr.productName || 'Unknown';
        if (!acc[productName]) {
          acc[productName] = {
            productName,
            totalQuantity: 0,
            transactions: []
          };
        }
        acc[productName].totalQuantity += curr.productQuantity;
        acc[productName].transactions.push({
          id: curr.stockChangeID?.toString?.(),
          productName: curr.productName,
          color: curr.productColor,
          size: curr.productSize,
          quantity: curr.productQuantity,
          date: new Date(curr.addedDate).toLocaleDateString()
        });
        return acc;
      }, {});

      return Object.values(groupedData);
    } catch (error) {
      console.error('Error fetching stock report:', error);
      throw error;
    }
  }

 
  
}

export const reportService = new ReportService(); 