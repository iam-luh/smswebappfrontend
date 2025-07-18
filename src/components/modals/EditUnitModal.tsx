
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "sonner";
import { Unit } from "../../services/unitService";

interface EditUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUnit: (unit: Unit) => void;
  unit: Unit | null;
}

const EditUnitModal: React.FC<EditUnitModalProps> = ({ isOpen, onClose, onUpdateUnit, unit }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: ""
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        symbol: unit.symbol,
        description: unit.description
      });
    }
  }, [unit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    if (!formData.symbol.trim()) {
      toast.error("Symbol is required");
      return;
    }

    if (unit) {
      onUpdateUnit({
        ...unit,
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("units.editUnit")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("units.name")}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("units.symbol")}
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("units.description")}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
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

export default EditUnitModal;
