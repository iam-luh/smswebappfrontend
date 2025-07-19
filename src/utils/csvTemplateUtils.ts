
import { StockChange } from '@/services/stockChangeService';
import { StockAdjustment } from '@/services/stockAdjustmentService';
import { User } from '@/services/userService';

export interface ProductTemplate {
  productName: string;
  productColor: string;
  productSize: string;
  productUnit: string;
  actualProductQuantity: string;
  thresholdProductQuantity: string;
}

export interface SalesTemplate {
  productName: string;
  productColor: string;
  productSize: string;
  quantitySold: string;
  saleDate: string;
}

export interface StockTemplate {
  productName: string;
  productColor: string;
  productSize: string;
  quantity: string;
  date: string;
}

export interface AdjustmentTemplate {
  adjustmentNo: string;
  productName: string;
  productColor: string;
  productSize: string;
  currentQuantity: string;
  adjustedQuantity: string;
  reason: string;
  description: string;
  adjustmentDate: string;
}

export const generateProductsTemplate = (): ProductTemplate[] => {
  return [
    {
      productName: 'Sample T-Shirt',
      productColor: 'Blue',
      productSize: 'Medium',
      productUnit: 'Pieces',
      actualProductQuantity: '50',
      thresholdProductQuantity: '10'
    },
    {
      productName: 'Sample Shoes',
      productColor: 'Black',
      productSize: '42',
      productUnit: 'Pairs',
      actualProductQuantity: '25',
      thresholdProductQuantity: '5'
    }
  ];
};

export const generateSalesTemplate = (): SalesTemplate[] => {
  return [
    {
      productName: 'Sample T-Shirt',
      productColor: 'Blue',
      productSize: 'Medium',
      quantitySold: '5',
      saleDate: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    },
    {
      productName: 'Sample Shoes',
      productColor: 'Black',
      productSize: '42',
      quantitySold: '2',
      saleDate: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    }
  ];
};

export const generateStockTemplate = (): StockTemplate[] => {
  return [
    {
      productName: 'Sample T-Shirt',
      productColor: 'Blue',
      productSize: 'Medium',
      quantity: '20',
      date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    },
    {
      productName: 'Sample Shoes',
      productColor: 'Black',
      productSize: '42',
      quantity: '10',
      date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    }
  ];
};

export const generateAdjustmentTemplate = (): AdjustmentTemplate[] => {
  return [
    {
      adjustmentNo: 'ADJ-001',
      productName: 'Sample T-Shirt',
      productColor: 'Blue',
      productSize: 'Medium',
      currentQuantity: '50',
      adjustedQuantity: '48',
      reason: 'Damaged',
      description: '2 items damaged during inspection',
      adjustmentDate: new Date().toISOString().split('T')[0]
    },
    {
      adjustmentNo: 'ADJ-002',
      productName: 'Sample Shoes',
      productColor: 'Black',
      productSize: '42',
      currentQuantity: '25',
      adjustedQuantity: '27',
      reason: 'Found',
      description: '2 items found in storage',
      adjustmentDate: new Date().toISOString().split('T')[0]
    }
  ];
};
