
import React from "react";
import { formatDate } from "../../utils/dateUtils";
import { useLanguage } from "../../context/LanguageContext";
import ActionContextMenu from "../ui/ActionContextMenu";
import { StockChange } from "../../services/stockChangeService";

interface StockTableProps {
  stockData: StockChange[];
  onEditStock: (stock: StockChange) => void;
  onDeleteStock: (stockId: number) => void;
}

const StockTable: React.FC<StockTableProps> = ({ stockData, onEditStock, onDeleteStock }) => {
  const { t } = useLanguage();

  return (
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
                {t("stock.quantity")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("stock.date")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {stockData.map((item, index) => (
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
                  {item.productQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(item.addedDate?.toString?.())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <ActionContextMenu
                    onEdit={() => onEditStock(item)}
                    onDelete={() => onDeleteStock(item.stockChangeID)}
                    editLabel={t("stock.editStockAddition")}
                    deleteLabel={t("stock.deleteStockAddition")}
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
            {stockData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("stock.noStock")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;
