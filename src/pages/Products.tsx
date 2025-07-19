
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { downloadCSV } from "../utils/csvUtils";
import { useLanguage } from "../context/LanguageContext";
import { productService, ProductStock } from "@/services/productService";
import { useDataFiltering } from "../hooks/useDataFiltering";
import { usePagination } from "../hooks/usePagination";
import PageHeader from "../components/common/PageHeader";
import SearchAndFilters from "../components/common/SearchAndFilters";
import ActionButtons from "../components/common/ActionButtons";
import DataPagination from "../components/common/DataPagination";
import ProductsTable from "../components/products/ProductsTable";
import ProductsStats from "../components/products/ProductsStats";

// Define the product status type as a union type
type ProductStatus = "In-Stock" | "Restock" | "Out-of-Stock";

interface ProductWithStatus extends ProductStock {
  status: ProductStatus;
}

const Products: React.FC = () => {
  const [productsData, setProductsData] = useState<ProductWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const filterFunction = (item: ProductWithStatus, options: { searchQuery: string }) => {
    return !options.searchQuery || 
      item?.productName?.toLowerCase?.().includes(options.searchQuery?.toLowerCase?.()) ||
      item?.productColor?.toLowerCase?.().includes(options.searchQuery?.toLowerCase?.()) ||
      item?.productSize?.toLowerCase?.().includes(options.searchQuery?.toLowerCase?.());
  };

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    clearFilters,
  } = useDataFiltering(productsData, filterFunction);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedProducts,
    resetPage,
  } = usePagination(filteredData, 10);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = (await productService.getAllProducts()).reverse();
        const productsWithStatus = products.map(product => ({
          ...product,
          status: product.actualProductQuantity > product.thresholdProductQuantity 
            ? "In-Stock" as ProductStatus
            : product.actualProductQuantity > 0 
              ? "Restock" as ProductStatus 
              : "Out-of-Stock" as ProductStatus
        }));
        setProductsData(productsWithStatus);
        toast.success('Products fetched successfully');
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleExport = () => {
    try {
      const exportData = filteredData.map(product => ({
        name: product.productName,
        color: product.productColor,
        size: product.productSize,
        quantity: product.actualProductQuantity,
        threshold: product.thresholdProductQuantity,
        unit: product.productUnit,
        status: product.status
      }));
      downloadCSV(exportData, 'products_export');
      toast.success('Products exported successfully');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Failed to export products');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    resetPage();
  };

  const handleClearFilters = () => {
    clearFilters();
    resetPage();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in my-6">
      <PageHeader title={t("products.title")}>
        <ActionButtons 
          showExport={true}
          onExport={handleExport}
        />
      </PageHeader>

      <ProductsStats products={productsData} />

      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
        searchPlaceholder={t("products.search")}
      />

      <ProductsTable products={paginatedProducts} />

      {filteredData.length > 0 && (
        <div className="mt-6">
          <div className="px-6 py-4">
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
        </div>
      )}
    </div>
  );
};

export default Products;
