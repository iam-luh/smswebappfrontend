
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "sonner";
import { StockChange } from "../../services/stockChangeService";

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStock: (stock: StockChange) => void;
  stock: StockChange | null;
}

const EditStockModal: React.FC<EditStockModalProps> = ({ isOpen, onClose, onUpdateStock, stock }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    productName: "",
    productColor: "",
    productSize: "",
    productQuantity: 0,
    addedDate: "",
    productUnit: ""
  });

  useEffect(() => {
    if (stock) {
      setFormData({
        productName: stock.productName,
        productColor: stock.productColor,
        productSize: stock.productSize,
        productQuantity: stock.productQuantity,
        addedDate: new Date(stock.addedDate).toISOString().split('T')[0],
        productUnit: stock.productUnit
      });
    }
  }, [stock]);

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
    
    if (formData.productQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (stock) {
      onUpdateStock({
        ...stock,
        productName: formData.productName,
        productColor: formData.productColor,
        productSize: formData.productSize,
        productQuantity: formData.productQuantity,
        addedDate: new Date(formData.addedDate),
        productUnit: formData.productUnit
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("stock.editStockAddition")}</DialogTitle>
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
              {t("stock.quantity")}
            </label>
            <input
              type="number"
              name="productQuantity"
              value={formData.productQuantity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("stock.date")}
            </label>
            <input
              type="date"
              name="addedDate"
              value={formData.addedDate}
              onChange={handleChange}
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

export default EditStockModal;
