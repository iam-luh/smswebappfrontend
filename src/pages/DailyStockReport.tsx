import React, { useState, useEffect } from "react";
import { generateStockTransactions } from "../utils/mockData";
import { formatDate, getDateRange } from "../utils/dateUtils";
import { Link } from "react-router-dom";
import DataPagination from "../components/common/DataPagination";
import { ArrowLeft, FileDown, Search } from "lucide-react";
import { stockChangeService, StockChange } from "@/services/stockChangeService";
import { toast } from "sonner";
import { pdfService } from "../services/pdfService";
import { ActivityLogger } from "../services/activityLogger";

const DailyStockReport: React.FC = () => {
  const defaultDateRange = getDateRange(7);
  const [startDate, setStartDate] = useState(defaultDateRange.start);
  const [endDate, setEndDate] = useState(defaultDateRange.end);
  const [stockData, setStockData] = useState<StockChange[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search query and date range
  const filteredData = stockData.filter(item => {
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(()=>{
    const fetchStockData = async () => {
      try {
        const data = await stockChangeService.getAllChanges();
        setStockData(data.filter(item => item.stockChangeType === 'Stock In'));
        toast.success("Stock data fetched successfully");
      } catch (error) {
        console.log(error);
        toast.error("Error fetching stock data");
      }
    };

    fetchStockData();
  },[]);

  return (
    <div className="animate-fade-in my-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DAILY STOCK ADDITIONS</h1>
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
                
                await pdfService.generateStockReport(
                  pdfData,
                  { from: startDate, to: endDate },
                  'Daily'
                );
                await ActivityLogger.logPDFExport('Daily Stock Report', filteredData.length);
                toast.success('PDF report exported successfully');
              } catch (error) {
                console.error('Error exporting PDF:', error);
                toast.error('Failed to export PDF report');
              }
            }}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </button>
          <button 
            onClick={async () => {
              try {
                // Create CSV content
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
                link.setAttribute('download', `stock_report_${new Date().toLocaleDateString()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                await ActivityLogger.logCSVExport('Daily Stock', filteredData.length);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Addition Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity Added
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
                    {formatDate(item?.addedDate?.toString?.())}  
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

        {/* Pagination */}
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

export default DailyStockReport;
