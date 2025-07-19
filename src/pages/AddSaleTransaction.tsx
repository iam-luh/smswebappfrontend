
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search } from "lucide-react";
import DataPagination from "../components/common/DataPagination";
import { useLanguage } from "../context/LanguageContext";
import { stockChangeService, StockChange } from "@/services/stockChangeService";
import { productService, ProductStock } from "@/services/productService";
import { ActivityLogger } from "../services/activityLogger";


const AddSaleTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [saleDate, setSaleDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [allProducts, setAllProducts] = useState<ProductStock[]>([]);
  const [saleItems, setSaleItems] = useState<Map<number, StockChange>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = (await productService.getAllProducts()).reverse();
        setAllProducts(products);
        toast.success("Products fetched successfully");
      } catch (error) {
        toast.error("Failed to fetch products");
        console.error(error);
      } finally {
        setLoading(false);
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

  // Update quantity for a product
  const updateQuantity = (productId: number, quantity: number) => {
    const product = allProducts.find(p => p.productId === productId);
    if (!product) return;

    if (quantity < 0 || quantity > product.actualProductQuantity) {
      toast.error(`Invalid quantity for ${product.productName}-${product.productColor}-${product.productSize}`);
      return;
    }

    // If quantity is greater than 0, add or update the item in saleItems


    if (quantity > 0) {
      setSaleItems(new Map(saleItems).set(productId, {
        stockChangeID: 0,
        productVariantID: productId,
        productName: product.productName,
        productColor: product.productColor,
        productSize: product.productSize,
        productQuantity: quantity,
        addedDate: new Date(),
        productUnit: product.productUnit,
        stockChangeType: "Stock Out",
      }));
    } else {
      // If quantity is 0 or less, remove from items
      const newItems = new Map(saleItems);
      newItems.delete(productId);
      setSaleItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemsArray = Array.from(saleItems.values());
    if (itemsArray.length === 0) {
      toast.error("Add at least one product to the sale");
      return;
    }

    try {
      setIsSubmitting(true);
      // Here you would save the transaction to your backend
      // Simulating API call
      for (const item of saleItems.values()) {
        try{
            const response = await stockChangeService.createChange({
          ...item,
          addedDate: new Date(saleDate),
          stockChangeType: "Stock Out",          
        });
        toast.success(`Sale for ${item.productName}-${item.productColor}-${item.productSize}-${item.productQuantity} saved successfully`);
        ActivityLogger.logSaleCreate({
          ...item,
          addedDate: new Date(saleDate),
          stockChangeType: "Stock Out",
        });
        try{
          const product = allProducts.find(p => p.productId === item.productVariantID);
          if (product) {
            const updatedProduct = {
              ...product,
              actualProductQuantity: product.actualProductQuantity - item.productQuantity,
            };
          const response =  await productService.updateProduct(product.productId, updatedProduct);
          toast.success(`Product ${item.productName} updated successfully`);
          }
        }
        catch(error){
          toast.error(`Failed to update the product for ${item.productName}-${item.productColor}-${item.productSize}-${item.productQuantity}`);
          console.error(error);
        }
       }
        catch (error) {
          toast.error(`Failed to save sale for ${item.productName}-${item.productColor}-${item.productSize}-${item.productQuantity}`);
          console.error(error);
        }

      }
      
      toast.success("Sale transaction saved successfully");
      navigate("/sales");
    } catch (error) {
      toast.error("Failed to save transaction");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in my-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("addSale.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t("addSale.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/sales" 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            {t("addSale.backToSales")}
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sale Date */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">{t("addSale.saleDate")}</h3>
          <div className="max-w-xs relative">
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="input-field pr-10"
              required
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>

        {/* Product Items */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{t("addSale.productItems")}</h3>
            <div className="relative w-64">
              <input
                type="text"
                placeholder={t("addSale.searchProducts")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
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
                  <th>{t("addSale.productName")}</th>
                  <th>{t("addSale.productColor")}</th>
                  <th>{t("addSale.productSize")}</th>
                  <th>AVAILABLE QUANTITY</th>
                  <th>SALE {t("addSale.quantity")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  const saleItem = saleItems.get(product?.productId);
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
                          max={`${product?.actualProductQuantity}`}
                          value={saleItem?.productQuantity || ""}
                          onChange={(e) => updateQuantity(product?.productId, parseInt(e?.target?.value) || 0)}
                          className="input-field w-full text-center"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  );
                })}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      {t("addSale.noProductsFound")}
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
          <h3 className="text-lg font-medium mb-4">{t("addSale.selectedItems")} ({Array.from(saleItems.values()).length})</h3>
          {Array.from(saleItems.values()).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Product Name</th>
                    <th className="text-left">Product Color</th>
                    <th className="text-left">Product Size</th>
                    <th className="text-right">Sale Quantity</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(saleItems.values()).map((item) => (
                    <tr key={item.stockChangeID} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2">{item.productName}</td>
                      <td>{item.productColor}</td>
                      <td>{item.productSize}</td>
                          <td className="text-right">{item.productQuantity}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = new Map(saleItems);
                            newItems.delete(item.stockChangeID);
                            setSaleItems(newItems);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t("addSale.remove")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {t("addSale.noProductsSelected")}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Link to="/sales" className="btn-outline">
            {t("addSale.cancel")}
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting || Array.from(saleItems.values()).length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("addSale.saving")}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {t("addSale.saveSaleTransaction")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSaleTransaction;
