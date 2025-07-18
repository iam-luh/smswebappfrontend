
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "sonner";
import { ProductStock } from "../../services/productService";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (product: ProductStock) => void;
  product: ProductStock | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onUpdateProduct, product }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    productName: "",
    productColor: "",
    productSize: "",
    actualProductQuantity: 0,
    thresholdProductQuantity: 0,
    productUnit: ""
  });

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        productColor: product.productColor,
        productSize: product.productSize,
        actualProductQuantity: product.actualProductQuantity,
        thresholdProductQuantity: product.thresholdProductQuantity,
        productUnit: product.productUnit
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    if (formData.actualProductQuantity < 0) {
      toast.error("Quantity cannot be negative");
      return;
    }

    if (product) {
      onUpdateProduct({
        ...product,
        productName: formData.productName,
        productColor: formData.productColor,
        productSize: formData.productSize,
        actualProductQuantity: formData.actualProductQuantity,
        thresholdProductQuantity: formData.thresholdProductQuantity,
        productUnit: formData.productUnit
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("products.editProduct")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("products.name")}
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("products.color")}
            </label>
            <input
              type="text"
              name="productColor"
              value={formData.productColor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("products.size")}
            </label>
            <input
              type="text"
              name="productSize"
              value={formData.productSize}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("products.quantity")}
            </label>
            <input
              type="number"
              name="actualProductQuantity"
              value={formData.actualProductQuantity}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("products.threshold")}
            </label>
            <input
              type="number"
              name="thresholdProductQuantity"
              value={formData.thresholdProductQuantity}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("products.unit")}
            </label>
            <input
              type="text"
              name="productUnit"
              value={formData.productUnit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
