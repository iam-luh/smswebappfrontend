import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";
import { downloadCSV } from "../utils/csvUtils";
import { toast } from "sonner";
import CsvImportModal from "../components/modals/CsvImportModal";
import EditStockModal from "../components/modals/EditStockModal";
import { useLanguage } from "../context/LanguageContext";
import { stockChangeService, StockChange } from "../services/stockChangeService";
import { productService, ProductStock } from "@/services/productService";
import { generateStockTemplate } from "../utils/csvTemplateUtils";
import { useDataFiltering } from "../hooks/useDataFiltering";
import { usePagination } from "../hooks/usePagination";
import PageHeader from "../components/common/PageHeader";
import SearchAndFilters from "../components/common/SearchAndFilters";
import ActionButtons from "../components/common/ActionButtons";
import StockTable from "../components/stock/StockTable";
import DataPagination from "../components/common/DataPagination";
import { ActivityLogger } from "../services/activityLogger";

const StockAdditions: React.FC = () => {
  const [stockData, setStockData] = useState<StockChange[]>([]);
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockChange | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useLanguage();

  const filterFunction = (item: StockChange, options: { searchQuery: string; startDate?: string; endDate?: string }) => {
    const matchesSearch = 
      !options.searchQuery || 
      item?.productName?.toLowerCase?.().includes(options.searchQuery?.toLowerCase?.()) ||
      item?.productColor?.toLowerCase?.().includes(options.searchQuery?.toLowerCase?.()) ||
      item?.productSize?.toLowerCase?.().includes(options.searchQuery?.toLowerCase?.());

    const itemDate = new Date(item.addedDate);
    const afterStartDate = !options.startDate || itemDate >= new Date(options.startDate);
    const beforeEndDate = !options.endDate || itemDate <= new Date(options.endDate);
    
    return matchesSearch && afterStartDate && beforeEndDate;
  };

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
  } = useDataFiltering(stockData, filterFunction);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    resetPage,
  } = usePagination(filteredData, 10);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const data = (await stockChangeService.getAllChanges()).reverse();
        setStockData(data.filter(item => item.stockChangeType === 'Stock In'));
        toast.success(t("stock.dataFetched"));
      } catch (error) {
        console.log(error);
        toast.error(t("stock.errorFetching")); 
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const productList = await productService.getAllProducts();
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error(t("stock.errorFetchingProducts"));
      }
    };

    fetchStockData();
    fetchProducts();
  }, [t]);

  // Handle editing stock
  const handleEditStock = (stock: StockChange) => {
    setEditingStock(stock);
    setIsEditModalOpen(true);
  };

  // Handle updating stock
  const handleUpdateStock = async (updatedStock: StockChange) => {
    try {
            const originalSale = stockData.find(item => item.stockChangeID === updatedStock.stockChangeID);
            if (originalSale) {
              // Find the corresponding product
              const product = products.find(p => p.productId === updatedStock.productVariantID);
              if (product) {
                // Calculate new quantity: current + old quantity - new quantity
                const newActualQuantity = product.actualProductQuantity + originalSale.productQuantity - updatedStock.productQuantity;

                // Update the product with the new quantity
                await productService.updateProduct(
                  updatedStock.productVariantID,
                  { ...product, actualProductQuantity: newActualQuantity }
                );
                
                // Update local products state
                setProducts(prev => prev.map(p => 
                  p.productId === updatedStock.productVariantID 
                    ? { ...p, actualProductQuantity: newActualQuantity }
                    : p
                ));
              }
            }
      await stockChangeService.updateChange(updatedStock.stockChangeID, updatedStock);
      ActivityLogger.logStockUpdate(updatedStock.stockChangeID, updatedStock);
      setStockData(stockData.map(item => 
        item.stockChangeID === updatedStock.stockChangeID ? updatedStock : item
      ));
      toast.success(t("stock.stockUpdated"));
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(t("stock.failedToUpdate"));
    }
  };

  // Handle deleting stock
  const handleDeleteStock = async (stockId: number) => {
    try {
      // Find the stock change to be deleted
      const stockToDelete = stockData.find(item => item.stockChangeID === stockId);
      if (!stockToDelete) {
        toast.error(t("stock.notFound"));
        return;
      }

      // Find the corresponding product
      const matchedProduct = products.find(
        p =>
          p?.productName?.toLowerCase?.() === (stockToDelete.productName || '')?.toLowerCase?.() &&
          p?.productColor?.toLowerCase?.() === (stockToDelete.productColor || '')?.toLowerCase?.() &&
          p?.productSize?.toLowerCase?.() === (stockToDelete.productSize || '')?.toLowerCase?.()
      );

      // Delete the stock change
      await stockChangeService.deleteChange(stockId);
      setStockData(stockData.filter(item => item.stockChangeID !== stockId));
      toast.success(t("stock.stockDeleted"));
      ActivityLogger.logStockDelete(stockId, `${stockToDelete.productName} (${stockToDelete.productColor}, ${stockToDelete.productSize}) - Quantity: ${stockToDelete.productQuantity}`);

      // If product found, update its actual quantity
      if (matchedProduct) {
        try {
          const updatedQuantity = Math.max(
            (matchedProduct.actualProductQuantity || 0)  - (stockToDelete.productQuantity || 0),
            0
          );
          await productService.updateProduct(matchedProduct.productId, {
            ...matchedProduct,
            actualProductQuantity: updatedQuantity,
          });
          setProducts(prev =>
            prev.map(p =>
              p.productId === matchedProduct.productId
                ? { ...p, actualProductQuantity: updatedQuantity }
                : p
            )
          );
        } catch (productUpdateError) {
          console.error('Error updating product quantity after stock deletion:', productUpdateError);
          toast.error(t("stock.failedToUpdateProductQuantity"));
        }
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error(t("stock.failedToDelete"));
    }
  };

  // Handle CSV import with stock-specific validation
  const handleImport = async (data: Record<string, unknown>[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      toast.error("No data found in the imported CSV.");
      return;
    }

    const requiredFields = ["productName", "productColor", "productSize", "quantity", "date"];
    const hasRequiredFields = data.every(item =>
      requiredFields.every(field => field in item)
    );

    if (!hasRequiredFields) {
      toast.error("Imported CSV has incorrect format. Required fields: productName, productColor, productSize, quantity, date");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const [index, item] of data.entries()) {
      // Find matching product
      const productName = String(item.productName || '');
      const productColor = String(item.productColor || '');
      const productSize = String(item.productSize || '');
      
      const matchedProduct = products.find(
        p =>
          p.productName?.toLowerCase?.() === productName?.toLowerCase?.() &&
          p.productColor?.toLowerCase?.() === productColor?.toLowerCase?.() &&
          p.productSize?.toLowerCase?.() === productSize?.toLowerCase?.()
      );

      if (!matchedProduct) {
        toast.error(
          `Row ${index + 1}: No matching product found for "${productName}" (${productColor}, ${productSize})`
        );
        errorCount++;
        continue;
      }

      const quantityToAdd = parseInt(String(item.quantity || '0')) || 0;
      const dateValue = String(item.date || '');

      const stockChange: StockChange = {
        stockChangeID: 0, // Will be set by backend
        productName: matchedProduct.productName,
        productColor: matchedProduct.productColor,
        productSize: matchedProduct.productSize,
        productQuantity: quantityToAdd,
        addedDate: dateValue ? new Date(dateValue) : new Date(),
        productVariantID: matchedProduct.productId,
        productUnit: matchedProduct.productUnit || 'Pcs',
        stockChangeType: 'Stock In', // Ensure this is always "Stock In"
      };

      try {
        // Save stock change
        const saved = await stockChangeService.createChange(stockChange);
        setStockData(prev => [saved, ...prev]);
        successCount++;

        // Update the actual product quantity
        const updatedQuantity = (matchedProduct.actualProductQuantity || 0) + quantityToAdd;
        await productService.updateProduct(matchedProduct.productId, {
          ...matchedProduct,
          actualProductQuantity: updatedQuantity,
        });

        // Update products state so UI reflects new quantity
        setProducts(prev =>
          prev.map(p =>
            p.productId === matchedProduct.productId
              ? { ...p, actualProductQuantity: updatedQuantity }
              : p
          )
        );
      } catch (error) {
        toast.error(
          `Row ${index + 1}: Failed to save stock for "${item.productName}" (${item.productColor}, ${item.productSize})`
        );
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} stock addition${successCount > 1 ? 's' : ''}`);
    }
    if (errorCount > 0 && successCount === 0) {
      toast.error("No stock additions were imported. Please check your CSV and try again.");
    }
  };

  // Handle CSV export
  const handleExport = () => {
    try {
      const exportData = filteredData.map(item => ({
        productName: item.productName,
        productColor: item.productColor,
        productSize: item.productSize,
        quantity: item.productQuantity,
        date: formatDate(item.addedDate?.toString?.())
      }));
      
      downloadCSV(exportData, 'stock_additions_export');
      toast.success('Stock additions exported successfully');
    } catch (error) {
      console.error('Error exporting stock:', error);
      toast.error('Failed to export stock');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    resetPage();
  };

  const handleDateFilterChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    resetPage();
  };

  const handleClearFilters = () => {
    clearFilters();
    resetPage();
  };

  return (
    <div className="animate-fade-in my-6">
      <PageHeader title={t("stock.title")}>
        <ActionButtons 
          showImport={true}
          showExport={true}
          onImport={() => setIsImportModalOpen(true)}
          onExport={handleExport}
        >
          <Link to="/stock/add" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t("stock.addStock")}
          </Link>
        </ActionButtons>
      </PageHeader>

      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(date) => handleDateFilterChange('start', date)}
        onEndDateChange={(date) => handleDateFilterChange('end', date)}
        onClearFilters={handleClearFilters}
        searchPlaceholder={t("stock.search")}
        showDateFilters={true}
      />

      <StockTable 
        stockData={paginatedData}
        onEditStock={handleEditStock}
        onDeleteStock={handleDeleteStock}
      />

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
            {t("sales.showing")} {Math.min(filteredData.length, (currentPage - 1) * 10 + 1)} {t("sales.to")} {Math.min(filteredData.length, currentPage * 10)} {t("sales.of")} {filteredData.length} {t("sales.entries")}
          </div>
        </div>
      )}

      {/* Import Modal with Stock-specific template */}
      <CsvImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Import Stock Additions"
        templateData={generateStockTemplate() as unknown as Record<string, unknown>[]}
      />

      {/* Edit Stock Modal */}
      <EditStockModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateStock={handleUpdateStock}
        stock={editingStock}
      />
    </div>
  );
};

export default StockAdditions;
