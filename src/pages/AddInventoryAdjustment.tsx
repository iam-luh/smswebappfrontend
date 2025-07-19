
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search } from "lucide-react";
import DataPagination from "../components/common/DataPagination";
import { useLanguage } from "../context/LanguageContext";
import { productService, ProductStock } from "@/services/productService";
import { stockAdjustmentService, StockAdjustment } from "@/services/stockAdjustmentService";
import { ActivityLogger } from "../services/activityLogger";

interface AdjustmentItem extends ProductStock {
  adjustedQuantity: number;
  reason: string;
  description: string;
}

const AddInventoryAdjustment: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [adjustmentDate, setAdjustmentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [allProducts, setAllProducts] = useState<ProductStock[]>([]);
  const [adjustmentItems, setAdjustmentItems] = useState<Map<number, AdjustmentItem>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [globalReason, setGlobalReason] = useState("");
  const [globalDescription, setGlobalDescription] = useState("");
  const itemsPerPage = 10;

  const adjustmentReasons = [
    "Damaged",
    "Expired", 
    "Lost",
    "Found",
    "Recount",
    "Other"
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = (await productService.getAllProducts()).reverse();
        setAllProducts(products);
      } catch (error) {
        toast.error("Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? allProducts.filter(
        product =>
          product?.productName?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
          product?.productColor?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
          product?.productSize?.toLowerCase?.().includes(searchQuery?.toLowerCase?.())
      )
    : allProducts;

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update adjustment for a product
  const updateAdjustment = (productId: number, adjustedQuantity: number) => {
    const product = allProducts.find(p => p.productId === productId);
    if (!product) return;

    if (adjustedQuantity !== product.actualProductQuantity) {
      setAdjustmentItems(new Map(adjustmentItems).set(productId, {
        ...product,
        adjustedQuantity,
        reason: globalReason,
        description: globalDescription
      }));
    } else {
      // If quantity is same as current, remove from adjustments
      const newItems = new Map(adjustmentItems);
      newItems.delete(productId);
      setAdjustmentItems(newItems);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemsArray = Array.from(adjustmentItems.values());
    if (itemsArray.length === 0) {
      toast.error("Add at least one product adjustment");
      return;
    }

    if (!globalReason) {
      toast.error("Please select a reason for the adjustment");
      return;
    }

    try {
      setIsSubmitting(true);
      
      for (const item of adjustmentItems.values()) {
        try {
          const adjustmentData = {
            stockAdjustmentId: 0, // Assuming backend will assign ID
            adjustmentNo: `ADJ-${Date.now()}-${item.productId}`,
            reason: item.reason,
            description: item.description,
            adjustmentDate: new Date(adjustmentDate),
            updatedDate: new Date(),
            adjustmentType: item.adjustedQuantity > item.actualProductQuantity ? "Addition" : "Reduction",
            createdBy: "Current User",
            updatedBy: "Current User",
            productVariantId: item.productId,
            productName: item.productName,
            productColor: item.productColor,
            productSize: item.productSize,
            productQuantity: item.adjustedQuantity - item.actualProductQuantity
          };

          await stockAdjustmentService.createAdjustment(adjustmentData);
          toast.success(`Adjustment for ${item.productName}-${item.productColor}-${item.productSize} saved successfully`);
          ActivityLogger.logAdjustmentCreate( adjustmentData);        

          // Update product quantity
          const updatedProduct = {
            ...item,
            actualProductQuantity: item.adjustedQuantity
          };
          await productService.updateProduct(item.productId, updatedProduct);
          
        } catch (error) {
          toast.error(`Failed to save adjustment for ${item.productName}`);
        }
      }
      
      navigate("/adjustments");
    } catch (error) {
      toast.error("Failed to save adjustments");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in my-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("addAdjustment.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t("addAdjustment.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/adjustments" 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            {t("addAdjustment.backToAdjustments")}
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Adjustment Details */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">{t("addAdjustment.adjustmentDate")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="date"
                value={adjustmentDate}
                onChange={(e) => setAdjustmentDate(e.target.value)}
                className="input-field pr-10"
                required
              />
            </div>
            
            <div>
              <select
                value={globalReason}
                onChange={(e) => setGlobalReason(e.target.value)}
                className="input-field"
                required
              >
                <option value="">{t("addAdjustment.selectReason")}</option>
                {adjustmentReasons.map(reason => (
                  <option key={reason} value={reason}>
                    {t(`addAdjustment.reasons.${reason?.toLowerCase?.()}`)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <input
                type="text"
                placeholder={t("addAdjustment.enterDescription")}
                value={globalDescription}
                onChange={(e) => setGlobalDescription(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Product Items */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{t("addAdjustment.productItems")}</h3>
            <div className="relative w-64">
              <input
                type="text"
                placeholder={t("addAdjustment.searchProducts")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e?.target?.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* Item list */}
          <div className="overflow-x-auto mb-6">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>{t("addAdjustment.productName")}</th>
                  <th>{t("addAdjustment.productColor")}</th>
                  <th>{t("addAdjustment.productSize")}</th>
                  <th>{t("addAdjustment.currentQuantity")}</th>
                  <th>{t("addAdjustment.adjustedQuantity")}</th>
                  <th>{t("addAdjustment.difference")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  const adjustmentItem = adjustmentItems.get(product?.productId);
                  const adjustedQty = adjustmentItem?.adjustedQuantity ?? product?.actualProductQuantity;
                  const difference = adjustedQty - product?.actualProductQuantity;
                  
                  return (
                    <tr key={product?.productId}>
                      <td>{product?.productName}</td>
                      <td>{product?.productColor}</td>
                      <td>{product?.productSize}</td>
                      <td>{product?.actualProductQuantity}</td>
                      <td className="w-32">
                        <input
                          type="number"
                          min="0"
                          value={adjustedQty}
                          onChange={(e) => updateAdjustment(product?.productId, parseInt(e?.target?.value) || 0)}
                          className="input-field w-full text-center"
                        />
                      </td>
                      <td className={`text-center ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {difference > 0 ? `+${difference}` : difference}
                      </td>
                    </tr>
                  );
                })}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("addAdjustment.noProductsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Selected items summary */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">{t("addAdjustment.selectedItems")} ({Array.from(adjustmentItems.values()).length})</h3>
          {Array.from(adjustmentItems.values()).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Product</th>
                    <th className="text-left">Color</th>
                    <th className="text-left">Size</th>
                    <th className="text-right">Current</th>
                    <th className="text-right">Adjusted</th>
                    <th className="text-right">Difference</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(adjustmentItems.values()).map((item) => {
                    const difference = item.adjustedQuantity - item.actualProductQuantity;
                    return (
                      <tr key={item?.productId} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-2">{item?.productName}</td>
                        <td>{item?.productColor}</td>
                        <td>{item?.productSize}</td>
                        <td className="text-right">{item?.actualProductQuantity}</td>
                        <td className="text-right">{item?.adjustedQuantity}</td>
                        <td className={`text-right ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {difference > 0 ? `+${difference}` : difference}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = new Map(adjustmentItems);
                              newItems.delete(item?.productId);
                              setAdjustmentItems(newItems);
                            }}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            {t("addAdjustment.remove")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {t("addAdjustment.noProductsSelected")}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Link to="/adjustments" className="btn-outline">
            {t("addAdjustment.cancel")}
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting || Array.from(adjustmentItems.values()).length === 0 || !globalReason}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("addAdjustment.saving")}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {t("addAdjustment.saveAdjustment")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventoryAdjustment;
