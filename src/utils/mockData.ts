
import { getMonthName } from "./dateUtils";

// Generate random date within range
const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format date to YYYY-MM-DD
const formatDateToString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Generate random sales transactions
export const generateSalesTransactions = (count: number) => {
  const products = ["T-Shirt", "Jeans", "Sneakers", "Hoodie", "Hat", "Jacket", "Dress", "Skirt", "Shorts", "Socks"];
  const colors = ["Red", "Blue", "Green", "Black", "White", "Grey", "Purple", "Yellow", "Orange", "Pink"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    date: formatDateToString(getRandomDate(startDate, endDate)),
    productName: products[Math.floor(Math.random() * products.length)],
    productColor: colors[Math.floor(Math.random() * colors.length)],
    productSize: sizes[Math.floor(Math.random() * sizes.length)],
    quantity: Math.floor(Math.random() * 10) + 1,
  }));
};

// Generate random stock transactions
export const generateStockTransactions = (count: number) => {
  const products = ["T-Shirt", "Jeans", "Sneakers", "Hoodie", "Hat", "Jacket", "Dress", "Skirt", "Shorts", "Socks"];
  const colors = ["Red", "Blue", "Green", "Black", "White", "Grey", "Purple", "Yellow", "Orange", "Pink"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    date: formatDateToString(getRandomDate(startDate, endDate)),
    productName: products[Math.floor(Math.random() * products.length)],
    productColor: colors[Math.floor(Math.random() * colors.length)],
    productSize: sizes[Math.floor(Math.random() * sizes.length)],
    quantity: Math.floor(Math.random() * 50) + 10,
  }));
};

// Generate random inventory adjustments
export const generateInventoryAdjustments = (count: number) => {
  const products = ["T-Shirt", "Jeans", "Sneakers", "Hoodie", "Hat", "Jacket", "Dress", "Skirt", "Shorts", "Socks"];
  const colors = ["Red", "Blue", "Green", "Black", "White", "Grey", "Purple", "Yellow", "Orange", "Pink"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const adjustmentTypes = ["Stock In", "Stock Out", "Damaged", "Returned", "Correction"];
  const adjustmentReasons = ["Initial Count", "Damaged Goods", "Theft", "Correction", "Expired Products"];
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    adjustmentNumber: `ADJ-${String(10000 + i).padStart(5, '0')}`,
    date: formatDateToString(getRandomDate(startDate, endDate)),
    productName: products[Math.floor(Math.random() * products.length)],
    productColor: colors[Math.floor(Math.random() * colors.length)],
    productSize: sizes[Math.floor(Math.random() * sizes.length)],
    quantity: Math.floor(Math.random() * 20) - 10,
    type: adjustmentTypes[Math.floor(Math.random() * adjustmentTypes.length)],
    reason: adjustmentReasons[Math.floor(Math.random() * adjustmentReasons.length)]
  }));
};

// Generate random products
export const generateProducts = (count: number) => {
  const products = ["T-Shirt", "Jeans", "Sneakers", "Hoodie", "Hat", "Jacket", "Dress", "Skirt", "Shorts", "Socks"];
  const categories = ["Apparel", "Footwear", "Accessories", "Outerwear"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${products[Math.floor(Math.random() * products.length)]} ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    inStock: Math.floor(Math.random() * 100),
    totalSold: Math.floor(Math.random() * 500),
  }));
};

// Dashboard stats
export const dashboardStats = {
  totalProducts: 2890,
  totalProductsSold: 1234,
  totalProductsAdded: 456,
};

// Generate monthly chart data
export const generateMonthlyChartData = () => {
  const currentMonth = new Date().getMonth() + 1;
  
  return Array.from({ length: 6 }, (_, i) => {
    // Get month number, handling the case where we need to wrap around to previous year
    const monthNum = ((currentMonth - 5 + i) <= 0) 
      ? (currentMonth - 5 + i) + 12 
      : (currentMonth - 5 + i);
    
    return {
      name: getMonthName(monthNum),
      value: Math.floor(Math.random() * 500) + 200,
    };
  });
};

// Top selling products
export const topSellingProducts = [
  { name: "Black T-Shirt", quantity: 534 },
  { name: "Blue Jeans", quantity: 423 },
  { name: "White Sneakers", quantity: 389 },
  { name: "Grey Hoodie", quantity: 302 },
  { name: "Red Cap", quantity: 276 },
];

/**
 * Generate mock stock addition data
 */
export function generateStockAdditions(count: number) {
  const stockAdditions = [];
  const products = generateProducts(10);
  const suppliers = ["ABC Suppliers", "XYZ Distributors", "Global Imports", "Local Manufacturers", "Premier Wholesale"];

  for (let i = 0; i < count; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 50) + 10;
    const costPerUnit = Math.floor(Math.random() * 1000) + 100;
    
    stockAdditions.push({
      id: i + 1,
      date: new Date(2025, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1).toISOString(),
      product: randomProduct.name,
      quantity: quantity,
      costPerUnit: costPerUnit,
      totalCost: quantity * costPerUnit,
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      notes: Math.random() > 0.7 ? "Quality checked and approved" : ""
    });
  }

  return stockAdditions;
}
