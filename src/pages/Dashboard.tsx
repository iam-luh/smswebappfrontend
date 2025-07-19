import React, { useEffect, useState } from "react";
import BarChart from "../components/BarChart";
import { Calendar, TrendingUp, Box, Package, ShoppingBag, Crown } from "lucide-react";
import { productService, ProductStock } from "../services/productService";
import { stockChangeService, StockChange } from "../services/stockChangeService";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [stockChanges, setStockChanges] = useState<StockChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setHasConnectionError(false);
        const [productsData, stockChangesData] = await Promise.all([
          productService.getAllProducts(),
          stockChangeService.getAllChanges()
        ]);
        setProducts(productsData);
        setStockChanges(stockChangesData);
        console.log('Dashboard data loaded successfully');
      } catch (error: unknown) {
        console.error("Error fetching dashboard data:", error);
        const isNetworkError = error instanceof Error && 'code' in error && (error as { code: string }).code === 'ERR_NETWORK';
        if (isNetworkError) {
          setHasConnectionError(true);
          toast.error("Cannot connect to server. Please check if the backend is running.");
        } else {
          toast.error("Failed to load dashboard data");
        }
        // Don't clear authentication state on API failures
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate dashboard stats
  const totalProductsSold = stockChanges
    .filter(change => change.stockChangeType === "Stock Out")
    .reduce((sum, change) => sum + change.productQuantity, 0);

  const totalProductsAdded = stockChanges
    .filter(change => change.stockChangeType === "Stock In")
    .reduce((sum, change) => sum + change.productQuantity, 0);

  const totalProductsInStore = products
    .reduce((sum, product) => sum + product.actualProductQuantity, 0);

  // Generate monthly chart data
  const generateMonthlyChartData = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    const monthlyData = months.map(month => {
      const monthChanges = stockChanges.filter(change => {
        const changeDate = new Date(change.addedDate);
        return changeDate.toLocaleString('default', { month: 'short' }) === month;
      });

      return {
        name: month,
        value: monthChanges
          .filter(change => change.stockChangeType === "Stock Out")
          .reduce((sum, change) => sum + change.productQuantity, 0)
      };
    });

    return monthlyData;
  };

  // Get top selling products
  const getTopSellingProducts = () => {
    const productSales = stockChanges
      .filter(change => change.stockChangeType === "Stock Out")
      .reduce((acc, change) => {
        const key = change.productName; // Only use product name as key
        acc[key] = (acc[key] || 0) + change.productQuantity;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(productSales)
      .map(([name, quantity]) => {
        return { name, quantity };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  // Get recent transactions
  const getRecentTransactions = () => {
    return stockChanges
      .filter(change => change.stockChangeType === "Stock Out")
      .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
      .slice(0, 5)
      .map(change => ({
        productName: change.productName,
        productColor: change.productColor,
        productSize: change.productSize,
        date: new Date(change.addedDate).toLocaleDateString()
      }));
  };

  const chartData = generateMonthlyChartData();
  const topSellingProducts = getTopSellingProducts();
  const recentTransactions = getRecentTransactions();
  const { t } = useLanguage();

  

  return (
    <div className="animate-fade-in my-6 space-y-6">
      {hasConnectionError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Connection Error:</strong> Cannot connect to the backend server. Some features may not work properly.
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.title")}</h1>
        </div>
        {/* <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-md text-sm">
            <Calendar className="h-4 w-4" />
            <span>{t("dashboard.last7days")}</span>
          </div>
        </div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Products Sold Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              12.5%
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("dashboard.totalProductsSold")}</h3>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{totalProductsSold}</p>
          </div>
        </div>

        {/* Total Products Added Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                <polyline points="16 17 22 17 22 11"></polyline>
              </svg>
              8.2%
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("dashboard.totalProductsAdded")}</h3>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{totalProductsAdded}</p>
          </div>
        </div>

        {/* Total Products In-Store Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              15.3%
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("dashboard.totalProductsInStore")}</h3>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{totalProductsInStore}</p>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Overview Chart */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm lg:col-span-2 p-5">
          <BarChart 
            data={chartData}
            title={t("dashboard.monthlySalesOverview")}
            xAxisLabel="Month"
            yAxisLabel="Sales"
          />
        </div>

        {/* Top Selling Products Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5 transition-all hover:shadow-md h-full">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-medium">{t("dashboard.topSellingProducts")}</h3>
          </div>
          <div className="space-y-6 relative">
            {topSellingProducts.map((product, index) => (
              <div 
                key={index} 
                className="relative"
              >
                <div className="flex items-center justify-between mb-2 relative">
                  <span className="font-medium truncate pr-12 max-w-[calc(100%-80px)]">{product.name}</span>
                  <span className="text-sm text-muted-foreground absolute right-0">
                    {product.quantity.toLocaleString()} Pcs
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-700" 
                    style={{ 
                      width: `${(product.quantity / Math.max(...topSellingProducts.map(p => p.quantity))) * 100}%`,
                      transition: 'width 1s ease-in-out'
                    }}
                  />
                </div>
                {index === 0 && (
                  <span className="absolute -top-1 -right-2 z-10 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {t("dashboard.bestSeller")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t("dashboard.recentTransactions")}</h3>
          <span className="text-sm text-muted-foreground">{t("dashboard.last5transactions")}</span>
        </div>
        <div className="w-full overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("sales.productName")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("sales.productColor")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("sales.productSize")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("sales.saleDate")}
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {transaction.productName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {transaction.productColor}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {transaction.productSize}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {transaction.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
