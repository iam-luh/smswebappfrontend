
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../LanguageSwitcher";
import NotificationsDropdown from "../ui/NotificationsDropdown";
import UserProfileDropdown from "../ui/UserProfileDropdown";

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  translationKey: string;
  children?: NavItem[];
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    translationKey: "nav.dashboard",
    path: "/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    )
  },
  {
    title: "Sales",
    translationKey: "nav.sales",
    path: "/sales",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"></path>
        <path d="m19 9-5 5-4-4-3 3"></path>
      </svg>
    )
  },
  {
    title: "Stock Additions",
    translationKey: "nav.stock",
    path: "/stock",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    )
  },
  {
    title: "Products",
    translationKey: "nav.products",
    path: "/products",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15"></path>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
        <path d="m3.3 7 8.7 5 8.7-5"></path>
        <path d="M12 22V12"></path>
      </svg>
    )
  },
  {
    title: "Adjustments",
    translationKey: "nav.adjustments",
    path: "/adjustments",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
    )
  },
  {
    title: "Reports",
    translationKey: "nav.reports",
    path: "/reports",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    )
  },
  {
    title: "Settings",
    translationKey: "nav.settings",
    path: "/settings",
    adminOnly: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  }
];

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return hasRole("Admin");
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`bg-white dark:bg-gray-800 h-full border-r border-gray-200 dark:border-gray-700 fixed z-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("app.name")}</h1>
          ) : (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">MI</h1>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <nav className="mt-6 px-2">
          <ul className="space-y-2">
            {filteredNavItems.map((item, index) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive 
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-current">{item.icon}</span>
                    {sidebarOpen && (
                      <span className="ml-3 text-sm font-medium">{t(item.translationKey)}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto grid transition-all duration-300  ease-in-out ${
        sidebarOpen ? "ml-64" : "ml-20"
      }`}>
        {/* Header */}
        <header className="bg-white justify-self-end dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 fixed w-full z-10 flex flex-row justify-between items-center">
          <div className={`px-6 flex w-full transition-all duration-300 ease-in-out ${
            sidebarOpen ? "ml-64" : "ml-20"
          }`}>
            {/* Left side - Mobile menu toggle */}
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar}
                className="p-1.5 mr-4 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Right side - Controls */}
            <div className="ml-auto flex items-center space-x-3 mr-2">
              {/* Language switcher */}
              <LanguageSwitcher />
              
              {/* Theme toggle */}
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                  </svg>
                )}
              </button>

              <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <UserProfileDropdown />
        </div>
              
             
              
              {/* User profile */}
              <div className="flex items-center">
                
                <button 
                  onClick={logout}
                  className="ml-2 p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  title={t("app.logout")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-16 px-6 h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
