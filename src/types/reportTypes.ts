export interface SalesReportData {
  productName: string;
  totalQuantity: number;
  transactions: {
    id: string;
    productName: string;
    color: string;
    size: string;
    quantity: number;
    date: string;
  }[];
}

export interface StockReportData {
  productName: string;
  totalQuantity: number;
  transactions: {
    id: string;
    productName: string;
    color: string;
    size: string;
    quantity: number;
    date: string;
  }[];
}


