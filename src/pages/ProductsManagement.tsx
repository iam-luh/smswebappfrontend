
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { downloadCSV } from "../utils/csvUtils";
import { toast } from "sonner";
import CsvImportModal from "../components/modals/CsvImportModal";
import EnhancedActionContextMenu from "../components/ui/EnhancedActionContextMenu";
import DataPagination from "../components/common/DataPagination";
import { useLanguage } from "../context/LanguageContext";
import { productService, ProductStock } from "../services/productService";
import { generateProductsTemplate } from "../utils/csvTemplateUtils";
import ActivityLogger from "../services/activityLogger";
import { ArrowLeft } from "lucide-react";

const ProductsManagement: React.FC = () => {
  const [productData, setProductData] = useState<ProductStock[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 10;
  const { t } = useLanguage();

  // Filter data based on search query
  const filteredData = productData.filter(item => {
    const matchesSearch = 
      !searchQuery || 
      item?.productName?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
      item?.productColor?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
      item?.productSize?.toLowerCase?.().includes(searchQuery?.toLowerCase?.());

    return matchesSearch;
  });

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const data = (await productService.getAllProducts()).reverse();
        setProductData(data);
        toast.success(t("products.productsFetched"));
        await ActivityLogger.logReportGeneration('Products List');
      } catch (error) {
        console.log(error);
        toast.error(t("products.failedToFetch")); 
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [t]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle deleting product
  const handleDeleteProduct = async (productId: number) => {
    try {
      const productToDelete = productData.find(item => item.productId === productId);
      if (!productToDelete) {
        toast.error("Product not found");
        return;
      }

      await productService.deleteProduct(productId);
      setProductData(productData.filter(item => item.productId !== productId));
      toast.success(t("products.productDeleted"));
      
      // Log the deletion
      await ActivityLogger.logProductDelete(productId, `${productToDelete.productName} (${productToDelete.productColor}, ${productToDelete.productSize})`);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t("products.failedToDelete"));
    }
  };

  // Handle deleting all products with the same name
  const handleDeleteSameProducts = async (productName: string) => {
    try {
      const sameProducts = productData.filter(item => item.productName === productName);
      if (sameProducts.length === 0) {
        toast.error("No products found with this name");
        return;
      }

      const confirmDelete = window.confirm(
        `Are you sure you want to delete all ${sameProducts.length} variants of "${productName}"? This action cannot be undone.`
      );

      if (!confirmDelete) {
        return;
      }

      let deletedCount = 0;
      let failedCount = 0;

      for (const product of sameProducts) {
        try {
          await productService.deleteProduct(product.productId);
          deletedCount++;
        } catch (error) {
          console.error('Error deleting product:', product.productId, error);
          failedCount++;
        }
      }

      // Update the state to remove deleted products
      setProductData(productData.filter(item => item.productName !== productName));
      
      if (deletedCount > 0) {
        toast.success(`Successfully deleted ${deletedCount} product variants of "${productName}"`);
        await ActivityLogger.logBulkProductDelete(productName, deletedCount);
      }
      
      if (failedCount > 0) {
        toast.error(`Failed to delete ${failedCount} product variants`);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error("Failed to delete products");
    }
  };

  // Handle CSV import with product-specific validation
  const handleImport = async (data: Record<string, unknown>[]) => {
    try {
      const requiredFields = ["productName", "productColor", "productSize", "productUnit", "actualProductQuantity", "thresholdProductQuantity"];
      const hasRequiredFields = data.every(item =>
        requiredFields.every(field => field in item)
      );

      if (!hasRequiredFields) {
        toast.error("Imported CSV has incorrect format. Required fields: productName, productColor, productSize, productUnit, actualProductQuantity, thresholdProductQuantity");
        return;
      }

      // Process imported data
      const processedData = data.map((item, index) => ({
        productName: String(item.productName || ''),
        productColor: String(item.productColor || ''),
        productSize: String(item.productSize || ''),
        productUnit: String(item.productUnit || ''),
        actualProductQuantity: parseInt(String(item.actualProductQuantity || '0')) || 0,
        thresholdProductQuantity: parseInt(String(item.thresholdProductQuantity || '0')) || 0,
        productVariantId: Date.now() + index,
        productId: 0,
        category: String(item.category || ''),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdDate: new Date(),
        updatedDate: new Date()
      }));

      let successCount = 0;
      let failedCount = 0;

      for (const item of processedData) {
        try {
          const createdProduct = await productService.createProduct(item);
          await ActivityLogger.logProductCreate(createdProduct as unknown as Record<string, unknown>);
          successCount++;
        } catch (error) {
          console.error('Error saving product:', item, error);
          failedCount++;
        }
      }

      if (successCount > 0) {
        // Refresh product data from backend
        const updatedData = await productService.getAllProducts();
        setProductData(updatedData);
        toast.success(`Successfully imported ${successCount} products.`);
        await ActivityLogger.logCSVImport('products', successCount, failedCount);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} products failed to import. Please check your CSV and try again.`);
      }
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error('Failed to import products. Please check your CSV format.');
    }
  };

  // Handle CSV export
  const handleExport = () => {
    try {
      const exportData = filteredData.map(item => ({
        productName: item.productName,
        productColor: item.productColor,
        productSize: item.productSize,
        productUnit: item.productUnit,
        actualProductQuantity: item.actualProductQuantity,
        thresholdProductQuantity: item.thresholdProductQuantity
      }));
      
      downloadCSV(exportData, 'products_export');
      toast.success('Products exported successfully');
      ActivityLogger.logCSVExport('products', exportData.length);
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Failed to export products');
    }
  };

  if(loading) {
    return (
       <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in my-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
       
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Link to="/settings" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your product catalog and inventory</p>
                  </div>
                </div>
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
      
          <Link to="/products/add" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t("products.addProduct")}
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("products.search")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder={t("products.search")}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          <button 
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors self-end"
          >
            {t("sales.clearFilters")}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("products.name")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("products.color")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("products.size")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("products.unit")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("products.quantity")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("products.threshold")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("products.status")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((item, index) => {
                const isLowStock = item.actualProductQuantity <= item.thresholdProductQuantity;
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.productColor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.productSize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.productUnit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.actualProductQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.thresholdProductQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isLowStock 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <EnhancedActionContextMenu
                        onDelete={() => handleDeleteProduct(item.productId)}
                        deleteLabel={t("products.deleteProduct")}
                        hideEdit={true} 
                        showBulkDelete={true}
                        onBulkDelete={() => handleDeleteSameProducts(item.productName)}
                      >
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </button>
                      </EnhancedActionContextMenu>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t("products.noProducts")}
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

      {/* Import Modal with Products-specific template */}
      <CsvImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Import Products"
        templateData={generateProductsTemplate() as unknown as Record<string, unknown>[]}
      />
    </div>
  );
};

export default ProductsManagement;
