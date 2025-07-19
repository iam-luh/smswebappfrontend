
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { hasRole } = useAuth();
  
  const settingGroups = [
    {
      title: t("settings.users"),
      description: t("settings.usersDesc"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      link: "/settings/users",
      adminOnly: true
    },
    {
      title: "User Activity Logs",
      description: "View and monitor user activities and system events",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
      ),
      link: "/settings/user-logs",
      adminOnly: true
    },
    {
      title: t("settings.products"),
      description: t("settings.productsDesc"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
      link: "/settings/products",
      adminOnly: true
    },
    {
      title: t("settings.units"),
      description: t("settings.unitsDesc"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      link: "/settings/units",
      adminOnly: true
    }
  ];

  // Only show adminOnly groups to admins
  const visibleGroups = settingGroups.filter(group => !group.adminOnly || hasRole("Admin"));

  return (
    <div className="animate-fade-in my-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("settings.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your application settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleGroups.map((group, index) => (
          <a
            key={index}
            href={group.link}
            className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                {group.icon}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{group.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{group.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Settings;
