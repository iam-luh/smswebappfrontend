
import React, { useEffect, useState } from "react";
import { generateSalesTransactions } from "../utils/mockData";
import { formatDate } from "../utils/dateUtils";
import { Link } from "react-router-dom";
import { downloadCSV } from "../utils/csvUtils";
import CsvImportModal from "../components/modals/CsvImportModal";
import EditSaleModal from "../components/modals/EditSaleModal";
import ActionContextMenu from "../components/ui/ActionContextMenu";
import { toast } from "sonner";
import DataPagination from "../components/common/DataPagination";
import { Activity, Search } from "lucide-react";
import { stockChangeService, StockChange } from "../services/stockChangeService";
import { useLanguage } from "../context/LanguageContext";
import { generateSalesTemplate } from "../utils/csvTemplateUtils";
import { productService, ProductStock } from "@/services/productService";
import { ActivityLogger } from "../services/activityLogger";

const SalesTransactions: React.FC = () => {
  const [salesData, setSalesData] = useState<StockChange[]>([]);
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<StockChange | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Filter data based on search query and date range
  const filteredData = salesData.filter(item => {
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
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const data = (await stockChangeService.getAllChanges()).reverse();
        setSalesData(data.filter(item => item.stockChangeType === 'Stock Out'));
        toast.success(t("sales.dataFetched"));
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error(t("sales.failedToFetch"));
      } finally {
        setLoading(false);
      }
    };
    const fetchProducts = async () => {
      try {
        const productData = await productService.getAllProducts();
        setProducts(productData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error(t("sales.failedToFetchProducts"));
      }
    };

    fetchSalesData();
    fetchProducts();
  }, [t]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle editing sale
  const handleEditSale = (sale: StockChange) => {
    setEditingSale(sale);
    setIsEditModalOpen(true);
  };

  // Handle updating sale
  const handleUpdateSale = async (updatedSale: StockChange) => {
    try {
      const originalSale = salesData.find(item => item.stockChangeID === updatedSale.stockChangeID);
      if (originalSale) {
        // Find the corresponding product
        const product = products.find(p => p.productId === updatedSale.productVariantID);
        if (product) {
          // Calculate new quantity: current + old quantity - new quantity
          const newActualQuantity = product.actualProductQuantity + originalSale.productQuantity - updatedSale.productQuantity;
          
          // Update the product with the new quantity
          await productService.updateProduct(
            updatedSale.productVariantID,
            { ...product, actualProductQuantity: newActualQuantity }
          );
          
          // Update local products state
          setProducts(prev => prev.map(p => 
            p.productId === updatedSale.productVariantID 
              ? { ...p, actualProductQuantity: newActualQuantity }
              : p
          ));
        }
      }
      await stockChangeService.updateChange(updatedSale.stockChangeID, updatedSale);
      setSalesData(salesData.map(item => 
        item.stockChangeID === updatedSale.stockChangeID ? updatedSale : item
      ));
      toast.success(t("sales.saleUpdated"));
      ActivityLogger.logSaleUpdate(updatedSale.stockChangeID, updatedSale);

    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error(t("sales.failedToUpdate"));
    }
  };

  // Handle deleting sale
  const handleDeleteSale = async (saleId: number) => {
    try {
      // Find the sale to be deleted
      const saleToDelete = salesData.find(item => item.stockChangeID === saleId);
      if (!saleToDelete) {
        toast.error(t("sales.saleNotFound"));
        return;
      }

      // Delete the stock change (sale) from the database
      await stockChangeService.deleteChange(saleId);

      // Find the corresponding product
      const product = products.find(
        (p) =>        
          p?.productName === saleToDelete?.productName &&
          p?.productColor === saleToDelete?.productColor &&
          p?.productSize === saleToDelete?.productSize
      );

      if (product) {
        // Update the actual product quantity by adding back the sold quantity
        const updatedProduct: ProductStock = {
          ...product,
          actualProductQuantity: product?.actualProductQuantity + (saleToDelete?.productQuantity || 0),
        };

        try {
          await productService.updateProduct(product.productId, updatedProduct);
          setProducts((prev) =>
            prev.map((p) =>
              p?.productId === product?.productId
                ? { ...p, actualProductQuantity: updatedProduct?.actualProductQuantity }
                : p
            )
          );
        } catch (err) {
          console.error('Error updating product quantity after sale deletion:', err);
          toast.error(t("sales.failedToUpdateProductAfterDelete"));
        }
      }

      ActivityLogger.logSaleDelete(saleId, `${saleToDelete.productName} (${saleToDelete.productColor}, ${saleToDelete.productSize}) - Quantity: ${saleToDelete.productQuantity}`);

      // Update local sales data
      setSalesData(salesData.filter(item => item.stockChangeID !== saleId));
      toast.success(t("sales.saleDeleted"));
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error(t("sales.failedToDelete"));
    }
  };

  const handleImportCSV = async (importedData: Record<string, unknown>[]) => {
    try {
      const requiredFields = ["productName", "productColor", "productSize", "quantitySold", "saleDate"];
      const hasRequiredFields = importedData.every(item =>
        requiredFields.every(field => field in item)
      );

      if (!hasRequiredFields) {
        toast.error("Imported CSV has incorrect format. Required fields: productName, productColor, productSize, quantitySold, saleDate");
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const item of importedData) {
        // Find matching product with type safety
        const matchedProduct = products.find(
          (p) =>
            typeof item.productName === 'string' && typeof item.productColor === 'string' && typeof item.productSize === 'string' &&
            p.productName?.toLowerCase?.() === item.productName?.toLowerCase?.() &&
            p.productColor?.toLowerCase?.() === item.productColor?.toLowerCase?.() &&
            p.productSize?.toLowerCase?.() === item.productSize?.toLowerCase?.()
        );

        if (!matchedProduct) {
          toast.error(
            `Product not found: ${String(item.productName)} (${String(item.productColor)}, ${String(item.productSize)})`
          );
          errorCount++;
          continue;
        }

        const saleQty = parseInt(String(item.quantitySold || '0')) || 0;
        if (matchedProduct.actualProductQuantity < saleQty) {
          toast.error(
            `Insufficient stock for: ${String(item.productName)} (${String(item.productColor)}, ${String(item.productSize)}). Available: ${matchedProduct.actualProductQuantity}, Requested: ${saleQty}`
          );
          errorCount++;
          continue;
        }

        // Prepare StockChange entry
        const stockChange: StockChange = {
          stockChangeID: 0, // Will be set by backend
          productVariantID: matchedProduct.productId,
          productName: matchedProduct.productName,
          productColor: matchedProduct.productColor,
          productSize: matchedProduct.productSize,
          productQuantity: saleQty,
          productUnit: matchedProduct.productUnit || "Pcs",
          stockChangeType: "Stock Out",
          addedDate: new Date(String(item.saleDate || new Date().toISOString())),
        };

        try {
          // Save StockChange to DB
          const saved = await stockChangeService.createChange(stockChange);

          // Update product quantity in DB
          const updatedProduct: ProductStock = {
            ...matchedProduct,
            actualProductQuantity: matchedProduct.actualProductQuantity - saleQty,
          };
          await productService.updateProduct(matchedProduct.productId, updatedProduct);

          // Update local state for products and sales
          setProducts((prev) =>
            prev.map((p) =>
              p.productId === matchedProduct.productId
                ? { ...p, actualProductQuantity: p.actualProductQuantity - saleQty }
                : p
            )
          );
          setSalesData((prev) => [saved, ...prev]);
          successCount++;
        } catch (err) {
          toast.error(
            `Failed to save sale or update product for: ${item.productName} (${item.productColor}, ${item.productSize})`
          );
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} sales transaction${successCount > 1 ? "s" : ""}`);
      }
      if (errorCount > 0 && successCount === 0) {
        toast.error("No sales transactions were imported due to errors.");
      }
    } catch (error) {
      console.error("Error importing sales:", error);
      toast.error("Failed to import sales. Please check your CSV format.");
    }
  };

  const handleExportCSV = () => {
    try {
      const exportData = filteredData.map(item => ({
        productName: item.productName,
        productColor: item.productColor,
        productSize: item.productSize,
        quantitySold: item.productQuantity,
        saleDate: formatDate(item.addedDate?.toString?.())
      }));
      
      downloadCSV(exportData, 'sales_transactions_export');
      toast.success('Sales transactions exported successfully');
    } catch (error) {
      console.error('Error exporting sales:', error);
      toast.error('Failed to export sales');
    }
  };

  return (
    <div className="animate-fade-in my-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("sales.transactions.title")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-3">
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsImportModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3"></path>
              </svg>
              {t("sales.importCSV")}
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={handleExportCSV}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {t("sales.exportCSV")}
            </button>
          </div>
      
          <Link to="/sales/add" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t("sales.recordSale")}
          </Link>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("sales.searchSales")}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("sales.fromDate")}</label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1); // Reset to first page when changing dates
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("sales.toDate")}</label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1); // Reset to first page when changing dates
              }}
            />
          </div>
          
          <button 
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t("sales.clearFilters")}
          </button>
          
         
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                  {t("sales.productName")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("sales.productColor")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("sales.productSize")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("sales.quantitySold")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("sales.saleDate")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.productColor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.productSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.productQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatDate(item.addedDate?.toString?.())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <ActionContextMenu
                      onEdit={() => handleEditSale(item)}
                      onDelete={() => handleDeleteSale(item.stockChangeID)}
                      editLabel={t("sales.editSale")}
                      deleteLabel={t("sales.deleteSale")}
                    >
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>
                    </ActionContextMenu>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t("sales.noSales")}
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
              {t("sales.showing")} {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} {t("sales.to")} {Math.min(filteredData.length, currentPage * itemsPerPage)} {t("sales.of")} {filteredData.length} {t("sales.entries")}
            </div>
          </div>
        )}
      </div>

      {/* Import CSV Modal */}
      <CsvImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCSV}
        title="Import Sales Transactions"
        templateData={generateSalesTemplate() as unknown as Record<string, unknown>[]}
      />

      {/* Edit Sale Modal */}
      <EditSaleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateSale={handleUpdateSale}
        sale={editingSale}
      />
    </div>
  );
};

export default SalesTransactions;
