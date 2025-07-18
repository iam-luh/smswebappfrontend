
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectLanguage = (selectedLanguage: "en" | "sw") => {
    setLanguage(selectedLanguage);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        title={t("settings.language")}
        onClick={toggleDropdown}
      >
        <span className="text-xs font-medium">{language === "en" ? "EN" : "SW"}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m2 12 20 0"></path>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              className={`w-full text-left px-4 py-2 text-sm ${language === "en" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              onClick={() => selectLanguage("en")}
            >
              {t("settings.english")}
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-sm ${language === "sw" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              onClick={() => selectLanguage("sw")}
            >
              {t("settings.kiswahili")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
