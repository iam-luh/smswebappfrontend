
import React, { useState, useMemo, useEffect } from "react";
import { generateStockTransactions } from "../utils/mockData";
import { formatDate, getDateRange } from "../utils/dateUtils";
import { Link } from "react-router-dom";
import DataPagination from "../components/common/DataPagination";
import { ArrowLeft, FileDown, Search } from "lucide-react";
import { stockChangeService, StockChange } from "@/services/stockChangeService";
import { toast } from "sonner";
import { pdfService } from "../services/pdfService";
import { ActivityLogger } from "../services/activityLogger";

const MonthlySalesReport: React.FC = () => {
  const defaultDateRange = getDateRange(30);
  const [startDate, setStartDate] = useState(defaultDateRange.start);
  const [endDate, setEndDate] = useState(defaultDateRange.end);
  const [salesData, setSalesData] = useState<StockChange[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search query and date range
  const filteredData = salesData.filter(item => {
    const matchesSearch = 
      !searchQuery || 
      item?.productName?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
      item?.productColor?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
      item?.productSize?.toLowerCase?.().includes(searchQuery?.toLowerCase?.());

    const itemDate = new Date(item?.addedDate);
    const afterStartDate = !startDate || itemDate >= new Date(startDate);
    const beforeEndDate = !endDate || itemDate <= new Date(endDate);
    
    return matchesSearch && afterStartDate && beforeEndDate;
  });

  useEffect(()=>{
    const fetchSalesData = async () => {
      try {
        const data = await stockChangeService.getAllChanges();
        const filteredOutData = data.filter(item => item.stockChangeType === 'Stock Out');
        
        // Group items by product details and month
        const groupedData = filteredOutData.reduce((acc, item) => {
          const date = new Date(item.addedDate);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`; 
          const itemKey = `${item.productName}-${item.productSize}-${item.productColor}-${monthKey}`;
          
          if (!acc[itemKey]) {
            acc[itemKey] = {
              ...item,
              productQuantity: 0,
              addedDate: new Date(date.getFullYear(), date.getMonth(), 1) // First day of month
            };
          }
          
          acc[itemKey].productQuantity += item.productQuantity;
          
          return acc;
        }, {} as Record<string, StockChange>);

        setSalesData(Object.values(groupedData));
        toast.success("Sales data fetched successfully");
      } catch(error) {
        console.log(error);
        toast.error("Error fetching sales data");
      }
    };

    fetchSalesData();
  },[]);

  // Sort the filtered data
  const sortedData = React.useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a: StockChange, b: StockChange) => {
        const aValue = a[sortConfig.key as keyof StockChange];
        const bValue = b[sortConfig.key as keyof StockChange];
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MONTHLY SALES</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              try {
                // Convert StockChange[] to Record<string, unknown>[] for PDF service
                const pdfData = filteredData.map(item => ({
                  addedDate: item.addedDate,
                  productName: item.productName,
                  productColor: item.productColor,
                  productSize: item.productSize,
                  productQuantity: item.productQuantity,
                  stockChangeType: item.stockChangeType,
                  productUnit: item.productUnit
                }));
                
                await pdfService.generateSalesReport(
                  pdfData,
                  { from: startDate, to: endDate },
                  'Monthly'
                );
                await ActivityLogger.logPDFExport('Monthly Sales Report', filteredData.length);
                toast.success('PDF report exported successfully');
              } catch (error) {
                console.error('Error exporting PDF:', error);
                toast.error('Failed to export PDF report');
              }
            }}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2">
            <FileDown className="h-4 w-4" />
            Export PDF
          </button>
          <button 
            onClick={async () => {
              try {
                const headers = ['Product Name', 'Product Color', 'Product Size', 'Quantity', 'Added Date'];
                const csvContent = [
                  headers.join(','),
                  ...filteredData.map(item => [
                    item.productName,
                    item.productColor, 
                    item.productSize,
                    item.productQuantity,
                    new Date(item.addedDate).toLocaleDateString()
                  ].join(','))
                ].join('\n');

                // Create blob and download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `monthly_sales_report_${new Date().toLocaleDateString()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                await ActivityLogger.logCSVExport('Monthly Sales Report', filteredData.length);
                toast.success('CSV report exported successfully');
              } catch (error) {
                console.error('Error exporting CSV:', error);
                toast.error('Failed to export CSV report');
              }
            }}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2"
          >
            <FileDown className="h-4 w-4" />
            Export CSV
          </button>
          <Link to="/reports" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2">
            <ArrowLeft className="h-4 w-4" />
            Back To Reports
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e?.target?.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Date Range */}
          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
            <input
              id="startDate"
              type="date"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={startDate}
              onChange={(e) => {
                setStartDate(e?.target?.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
            <input
              id="endDate"
              type="date"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={endDate}
              onChange={(e) => {
                setEndDate(e?.target?.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <button 
            onClick={() => {
              setStartDate(defaultDateRange.start);
              setEndDate(defaultDateRange.end);
              setSearchQuery('');
              setSortConfig({ key: null, direction: 'ascending' });
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  onClick={() => requestSort('date')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    Sale Date
                    {sortConfig.key === 'date' && (
                      <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort('productName')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    Product Name
                    {sortConfig.key === 'productName' && (
                      <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product Size
                </th>
                <th 
                  onClick={() => requestSort('quantity')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    Quantity Sold
                    {sortConfig.key === 'quantity' && (
                      <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(item?.addedDate).toLocaleString('en-US', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item?.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item?.productColor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item?.productSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item?.productQuantity}
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td 
                    colSpan={5} 
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - using DataPagination component */}
        {filteredData.length > 0 && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlySalesReport;
