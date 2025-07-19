
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";
import { downloadCSV } from "../utils/csvUtils";
import { toast } from "sonner";
import CsvImportModal from "../components/modals/CsvImportModal";
import ActionContextMenu from "../components/ui/ActionContextMenu";
import DataPagination from "../components/common/DataPagination";
import { useLanguage } from "../context/LanguageContext";
import { stockAdjustmentService, StockAdjustment } from "../services/stockAdjustmentService";
import { productService, ProductStock } from "@/services/productService";
import { generateAdjustmentTemplate } from "../utils/csvTemplateUtils";
import { ActivityLogger } from "../services/activityLogger";

const InventoryAdjustments: React.FC = () => {
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustment[]>([]);
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 10;
  const { t } = useLanguage();

  // Filter data based on search query and date range
  const filteredData = adjustmentData.filter(item => {
    const matchesSearch = 
      !searchQuery || 
        item?.productName?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
        item?.adjustmentNo?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
        item?.reason?.toLowerCase?.().includes(searchQuery?.toLowerCase?.());

    const itemDate = new Date(item.adjustmentDate);
    const afterStartDate = !startDate || itemDate >= new Date(startDate);
    const beforeEndDate = !endDate || itemDate <= new Date(endDate);
    
    return matchesSearch && afterStartDate && beforeEndDate;
  });

  useEffect(() => {
    const fetchAdjustmentData = async () => {
      try {
        setLoading(true);
        const data = (await stockAdjustmentService.getAllAdjustments()).reverse();
        setAdjustmentData(data);
        toast.success("Adjustments data fetched successfully");
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch adjustments data"); 
        
      } finally {
        setLoading(false);
      }
    };

    fetchAdjustmentData();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle deleting adjustment
  const handleDeleteAdjustment = async (adjustmentId: number) => {
    try {
      // Find the adjustment to be deleted
      const adjustmentToDelete = adjustmentData.find(item => item.stockAdjustmentId === adjustmentId);
      if (!adjustmentToDelete) {
        toast.error("Adjustment not found");
        return;
      }

      // Delete the adjustment from the database
      await stockAdjustmentService.deleteAdjustment(adjustmentId);

      // Update the product's actual quantity
      try {
        // Find the related product
        let product = products.find(p => p.productId === adjustmentToDelete.productVariantId);

        // If not in state, fetch from API
        if (!product) {
          product = await productService.getProductById(adjustmentToDelete.productVariantId);
          if (!product) {
            toast.error("Related product not found");
          }
        }

        if (product) {
          // Reverse the adjustment
          const newQuantity = product.actualProductQuantity - adjustmentToDelete.productQuantity;
          await productService.updateProduct(product.productId, {
            ...product,
            actualProductQuantity: newQuantity
          });

          // Update local state for products
          setProducts(prev =>
            prev.map(p =>
              p.productId === product!.productId
                ? { ...p, actualProductQuantity: newQuantity }
                : p
            )
          );
        }
      } catch (productError) {
        console.error("Error updating product quantity after adjustment deletion:", productError);
        toast.error("Adjustment deleted, but failed to update product quantity");
      }

      // Remove the adjustment from local state
      setAdjustmentData(adjustmentData.filter(item => item.stockAdjustmentId !== adjustmentId));
      toast.success("Adjustment deleted successfully");
      ActivityLogger.logAdjustmentDelete(adjustmentId, `${adjustmentToDelete.productName} (${adjustmentToDelete.productColor}, ${adjustmentToDelete.productSize}) - Quantity: ${adjustmentToDelete.productQuantity}`);
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      toast.error("Failed to delete adjustment");
    }
  };

  // Handle CSV import with adjustment-specific validation
  const handleImport = async (data: Record<string, unknown>[]) => {
    try {
      const requiredFields = [
        "adjustmentNo",
        "productName",
        "productColor",
        "productSize",
        "currentQuantity",
        "adjustedQuantity",
        "reason",
        "description",
        "adjustmentDate"
      ];

      // Fetch latest products for validation
      let latestProducts: ProductStock[] = products;
      if (!products.length) {
        latestProducts = await productService.getAllProducts();
        setProducts(latestProducts);
      }

      let importedCount = 0;
      let failedCount = 0;

      for (const [index, item] of data.entries()) {
        // Check required fields
        const hasRequiredFields = requiredFields.every(field => field in item);
        if (!hasRequiredFields) {
          toast.error(
            `Row ${index + 1}: Missing required fields. Required: adjustmentNo, productName, productColor, productSize, currentQuantity, adjustedQuantity, reason, description, adjustmentDate. Skipped.`
          );
          failedCount++;
          continue;
        }

        // Find matching product with type safety
        const matchedProduct = latestProducts.find(
          p =>
            typeof item.productName === 'string' && typeof item.productColor === 'string' && typeof item.productSize === 'string' &&
            p?.productName?.toLowerCase?.() === item.productName?.toLowerCase?.() &&
            p?.productColor?.toLowerCase?.() === item.productColor?.toLowerCase?.() &&
            p?.productSize?.toLowerCase?.() === item.productSize?.toLowerCase?.()
        );

        if (!matchedProduct) {
          toast.error(
            `Row ${index + 1}: Product not found (${String(item.productName)}, ${String(item.productColor)}, ${String(item.productSize)}). Skipped.`
          );
          failedCount++;
          continue;
        }

        // Calculate adjustment with type safety
        const currentQty = parseInt(String(item.currentQuantity || '0'));
        const adjustedQty = parseInt(String(item.adjustedQuantity || '0'));
        const adjustmentQty = adjustedQty - currentQty;
        const adjustmentType = adjustmentQty > 0 ? "Addition" : "Reduction";
        const newProductQty = matchedProduct.actualProductQuantity + adjustmentQty;

        // Check for negative stock
        if (newProductQty < 0) {
          toast.error(
            `Row ${index + 1}: Adjustment would result in negative stock for ${String(item.productName)} (${String(item.productColor)}, ${String(item.productSize)}). Skipped.`
          );
          failedCount++;
          continue;
        }

        // Prepare adjustment object
        const adjustment: StockAdjustment = {
          stockAdjustmentId: Date.now() + index,
          adjustmentNo: String(item.adjustmentNo || `ADJ-${Date.now()}-${index}`),
          reason: String(item.reason || "Other"),
          description: String(item.description || ""),
          adjustmentDate: new Date(String(item.adjustmentDate || new Date().toISOString())),
          updatedDate: new Date(),
          adjustmentType,
          createdBy: "Imported",
          updatedBy: "Imported",
          productVariantId: matchedProduct.productId || 0,
          productName: matchedProduct.productName,
          productColor: matchedProduct.productColor,
          productSize: matchedProduct.productSize,
          productQuantity: adjustmentQty
        };

        // Save adjustment to DB
        try {
          await stockAdjustmentService.createAdjustment(adjustment);

          // Update product quantity in DB
          await productService.updateProduct(matchedProduct.productId, {
            ...matchedProduct,
            actualProductQuantity: newProductQty
          });

          // Update local state for UI
          setAdjustmentData(prev => [adjustment, ...prev]);
          setProducts(prev =>
            prev.map(p =>
              p.productId === matchedProduct.productId
                ? { ...p, actualProductQuantity: newProductQty }
                : p
            )
          );

          toast.success(
            `Row ${index + 1}: Adjustment imported for ${item.productName} (${item.productColor}, ${item.productSize})`
          );
          importedCount++;
        } catch (err) {
          toast.error(
            `Row ${index + 1}: Failed to save adjustment for ${item.productName} (${item.productColor}, ${item.productSize})`
          );
          failedCount++;
        }
      }

      if (importedCount > 0) {
        toast.success(`Successfully imported ${importedCount} adjustments`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} adjustments failed to import`);
      }
    } catch (error) {
      console.error("Error importing adjustments:", error);
      toast.error("Failed to import adjustments. Please check your CSV format.");
    }
  };

  // Handle CSV export
  const handleExport = () => {
    try {
      const exportData = filteredData.map(item => ({
        adjustmentNo: item.adjustmentNo,
        productName: item.productName,
        productColor: item.productColor,
        productSize: item.productSize,
        currentQuantity: '0', // This would need to be calculated from product current state
        adjustedQuantity: item.productQuantity?.toString?.(),
        reason: item.reason,
        description: item.description,
        adjustmentDate: formatDate(item.adjustmentDate?.toString?.())
      }));
      
      downloadCSV(exportData, 'inventory_adjustments_export');
      toast.success('Inventory adjustments exported successfully');
    } catch (error) {
      console.error('Error exporting adjustments:', error);
      toast.error('Failed to export adjustments');
    }
  };

  return (
    <div className="animate-fade-in my-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Adjustments</h1>
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
              onClick={handleExport}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {t("sales.exportCSV")}
            </button>
          </div>
      
          <Link to="/adjustments/add" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Adjustment
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Adjustments</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search adjustments..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("sales.fromDate")}</label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
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
                setCurrentPage(1);
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
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors self-end"
          >
            {t("sales.clearFilters")}
          </button>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Adjustment No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Color
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity Change
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.adjustmentNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.productColor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.productSize}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.productQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.productQuantity >= 0 ? `+${item.productQuantity}` : item.productQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.adjustmentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.reason } {item.description && `- ${item.description}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatDate(item?.adjustmentDate?.toString?.())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <ActionContextMenu
                      onDelete={() => handleDeleteAdjustment(item.stockAdjustmentId)}
                      deleteLabel="Delete Adjustment"
                      hideEdit={true}
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
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No adjustments found
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

      {/* Import Modal with Adjustment-specific template */}
      <CsvImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Import Inventory Adjustments"
        templateData={generateAdjustmentTemplate() as unknown as Record<string, unknown>[]}
      />
    </div>
  );
};

export default InventoryAdjustments;
