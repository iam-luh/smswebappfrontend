
import React from "react";
import { useLanguage } from "../../context/LanguageContext";

interface ActionButtonsProps {
  onImport?: () => void;
  onExport?: () => void;
  showImport?: boolean;
  showExport?: boolean;
  children?: React.ReactNode;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onImport,
  onExport,
  showImport = false,
  showExport = false,
  children,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex gap-3">
      {showImport && onImport && (
        <button 
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={onImport}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3"></path>
          </svg>
          {t("sales.importCSV")}
        </button>
      )}
      
      {showExport && onExport && (
        <button 
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={onExport}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {t("sales.exportCSV")}
        </button>
      )}
      
      {children}
    </div>
  );
};

export default ActionButtons;
