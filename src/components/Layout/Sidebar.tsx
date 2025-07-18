import { Link, useLocation } from "react-router-dom";
import { ReactNode, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { 
  Home, 
  ShoppingCart, 
  PackagePlus, 
  Package, 
  Sliders, 
  BarChart3, 
  Settings,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

interface SidebarItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarItem = ({ to, icon, label, isActive }: SidebarItemProps) => {
  return (
    <Link 
      to={to} 
      className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
    >
      {icon}
      <span className="text-lg font-medium">{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { hasRole } = useAuth();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="h-screen flex flex-col bg-sidebar text-sidebar-foreground min-w-[250px]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center">
          <Package className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">InventoryPro</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-2">
        <SidebarItem 
          to="/" 
          icon={<Home className="h-5 w-5" />} 
          label={t("nav.dashboard")}
          isActive={isActive("/")}
        />
        <SidebarItem 
          to="/sales" 
          icon={<ShoppingCart className="h-5 w-5" />} 
          label={t("nav.sales")}
          isActive={isActive("/sales")}
        />
        <SidebarItem 
          to="/stock" 
          icon={<PackagePlus className="h-5 w-5" />} 
          label={t("nav.stock")}
          isActive={isActive("/stock")}
        />
        <SidebarItem 
          to="/products" 
          icon={<Package className="h-5 w-5" />} 
          label={t("nav.products")}
          isActive={isActive("/products")}
        />
        <SidebarItem 
          to="/adjustments" 
          icon={<Sliders className="h-5 w-5" />} 
          label={t("nav.adjustments")}
          isActive={isActive("/adjustments")}
        />
        <SidebarItem 
          to="/reports" 
          icon={<BarChart3 className="h-5 w-5" />} 
          label={t("nav.reports")}
          isActive={isActive("/reports")}
        />
        {hasRole("Admin") && (
          <SidebarItem 
            to="/settings" 
            icon={<Settings className="h-5 w-5" />} 
            label={t("nav.settings")}
            isActive={isActive("/settings")}
          />
        )}
      </nav>
      
      {/* Footer with Theme Toggle */}
      <div className="p-4 border-t border-sidebar-hover mt-auto">
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center w-full gap-2 p-3 rounded-full transition-colors hover:bg-sidebar-hover"
        >
          {theme === 'dark' 
            ? <Sun className="h-5 w-5" /> 
            : <Moon className="h-5 w-5" />
          }
          <span className="text-sm">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
