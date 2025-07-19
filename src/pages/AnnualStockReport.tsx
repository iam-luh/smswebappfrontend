import React, { useState, useEffect } from "react";
import DataTable from "../components/ui/DataTable";
import { generateStockTransactions } from "../utils/mockData";
import { formatDate, getDateRange } from "../utils/dateUtils";
import { Link } from "react-router-dom";
import { stockChangeService, StockChange } from "@/services/stockChangeService";
import { toast } from "sonner";
import { pdfService } from "../services/pdfService";
import { ActivityLogger } from "../services/activityLogger";

const AnnualStockReport: React.FC = () => {
  const defaultDateRange = getDateRange(365);
  const [startDate, setStartDate] = useState(defaultDateRange.start);
  const [endDate, setEndDate] = useState(defaultDateRange.end);
  const [stockData, setStockData] = useState<StockChange[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = stockData.filter(item => {
    const matchesSearch = 
      !searchQuery || 
        item?.productName?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
        item?.productColor?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
        item?.productSize?.toLowerCase?.().includes(searchQuery?.toLowerCase?.());

    const itemDate = new Date(item.addedDate);
    const afterStartDate = !startDate || itemDate >= new Date(startDate);
    const beforeEndDate = !endDate || itemDate <= new Date(endDate);
    
    return matchesSearch && afterStartDate && beforeEndDate;
  });

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const data = await stockChangeService.getAllChanges();
        const filteredInData = data.filter(item => item.stockChangeType === 'Stock In');
        
        // Group items by product details and year
        const groupedData = filteredInData.reduce((acc, item) => {
          const date = new Date(item.addedDate);
          const yearKey = `${date.getFullYear()}`; 
          const itemKey = `${item.productName}-${item.productSize}-${item.productColor}-${yearKey}`;
          
          if (!acc[itemKey]) {
            acc[itemKey] = {
              ...item,
              productQuantity: 0,
              addedDate: new Date(date.getFullYear(), 0, 1) // First day of year
            };
          }
          
          acc[itemKey].productQuantity += item.productQuantity;
          
          return acc;
        }, {} as Record<string, StockChange>);

        setStockData(Object.values(groupedData));
        toast.success("Stock data fetched successfully");
      } catch(error) {
        toast.error("Error fetching stock data");
      }
    };

    fetchStockData();
  }, []);
  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ANNUAL STOCK ADDITIONS</h1>
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
                'Annual'
              );
              await ActivityLogger.logPDFExport('Annual Stock Report', filteredData.length);
              toast.success('PDF report exported successfully');
            } catch (error) {
              console.error('Error exporting PDF:', error);
              toast.error('Failed to export PDF report');
            }
          }}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2"
        >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export PDF
        </button>
        <button 
        onClick={async () => {
          try {
            // Convert stock data to CSV format
            const headers = ['Product Name', 'Size', 'Color', 'Quantity', 'Year'];
            const csvData = filteredData.map(item => [
            item.productName,
            item.productSize,
            item.productColor,
            item.productQuantity,
            new Date(item.addedDate).getFullYear()
            ]);

            // Create CSV content
            const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
            ].join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'annual_stock_report.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            await ActivityLogger.logCSVExport('Annual Stock', filteredData.length);
            toast.success('CSV report exported successfully');
          } catch (error) {
            console.error('Error exporting CSV:', error);
            toast.error('Failed to export CSV report');
          }
        }}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2"
        >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export CSV
        </button>
        <Link to="/reports" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        Back To Reports
        </Link>
      </div>
      </div>

      <div className="bg-card rounded-lg border shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
          type="text"
          placeholder="Enter Text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          />
        </div>
        </div>
        
        <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Select Year Range</label>
        <div className="flex gap-3 items-center">
          <div className="relative">
          <input
            type="number"
            min="2000"
            max="2099"
            value={new Date(startDate).getFullYear()}
            onChange={(e) => setStartDate(`${e.target.value}-01-01`)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          </div>
          <span>To</span>
          <div className="relative">
          <input
            type="number"
            min="2000"
            max="2099"
            value={new Date(endDate).getFullYear()}
            onChange={(e) => setEndDate(`${e.target.value}-12-31`)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          </div>
        </div>
        </div>
      </div>
      </div>

      <DataTable
      data={filteredData}
      columns={[
        { 
        header: "Year", 
        accessor: "addedDate",
        render: (item) => new Date(item.addedDate).getFullYear(),
        sortable: true
        },
        { 
        header: "Product Name", 
        accessor: "productName",
        sortable: true
        },
        { 
        header: "Product Color", 
        accessor: "productColor" 
        },
        { 
        header: "Product Size", 
        accessor: "productSize" 
        },
        { 
        header: "Quantity Added", 
        accessor: "productQuantity",
        sortable: true
        },
      ]}
      />
    </div>
  );
};

export default AnnualStockReport;
