
import React from "react";
import { ProductStock } from "@/services/productService";

interface ProductsStatsProps {
  products: ProductStock[];
}

const ProductsStats: React.FC<ProductsStatsProps> = ({ products }) => {
  const totalVariants = products.length;
  const totalQuantitySold = products.reduce((sum, product) => sum + product.actualProductQuantity, 0);
  const totalProducts = new Set(products.map(product => product.productName)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Products Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products in Store</p>
            <h3 className="text-2xl font-bold mt-1">{totalProducts?.toString?.()}</h3>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Total Variants Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Product Variants in Store</p>
            <h3 className="text-2xl font-bold mt-1">{totalVariants?.toString?.()}</h3>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="3" height="9"></rect>
              <rect x="14" y="7" width="3" height="5"></rect>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Total Sold Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Product Amount in Store</p>
            <h3 className="text-2xl font-bold mt-1">{`${totalQuantitySold} Pcs`}</h3>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsStats;
