
import React from "react";
import { useLanguage } from "../../context/LanguageContext";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
  showDateFilters?: boolean;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  searchPlaceholder,
  showDateFilters = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("sales.searchSales")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder || t("products.search")}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        {showDateFilters && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("sales.fromDate")}
              </label>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={startDate}
                onChange={(e) => onStartDateChange?.(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("sales.toDate")}
              </label>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={endDate}
                onChange={(e) => onEndDateChange?.(e.target.value)}
              />
            </div>
          </>
        )}
        
        <button 
          onClick={onClearFilters}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors self-end"
        >
          {t("sales.clearFilters")}
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilters;
