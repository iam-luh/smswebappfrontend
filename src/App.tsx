import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "./components/Layout/PageLayout";
import CustomToaster from "./components/ui/CustomToaster";
import { useAuth } from "./context/AuthContext";
import AdminRoute from "./components/common/AdminRoute";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Main Pages
import Dashboard from "./pages/Dashboard";
import SalesTransactions from "./pages/SalesTransactions";
import AddSaleTransaction from "./pages/AddSaleTransaction";
import StockAdditions from "./pages/StockAdditions";
import AddStockAddition from "./pages/AddStockAddition";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import InventoryAdjustments from "./pages/InventoryAdjustments";
import AddInventoryAdjustment from "./pages/AddInventoryAdjustment";
import Reports from "./pages/Reports";
import DailySalesReport from "./pages/DailySalesReport";
import MonthlySalesReport from "./pages/MonthlySalesReport";
import AnnualSalesReport from "./pages/AnnualSalesReport";
import DailyStockReport from "./pages/DailyStockReport";
import MonthlyStockReport from "./pages/MonthlyStockReport";
import AnnualStockReport from "./pages/AnnualStockReport";
import NotFound from "./pages/NotFound";
import ProductsManagement from "./pages/ProductsManagement";
import Settings from "./pages/Settings";
import OrganizationProfile from "./pages/OrganizationProfile";
import UsersManagement from "./pages/UsersManagement";
import UnitsOfMeasurement from "./pages/UnitsOfMeasurement";
import UserLogs from "./pages/UserLogs";

const queryClient = new QueryClient();

// Simple component for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <PageLayout>
                  <Dashboard />
                </PageLayout>
              </ProtectedRoute>
            } />
            
            {/* Sales Routes */}
            <Route path="/sales" element={
              <ProtectedRoute>
                <PageLayout>
                  <SalesTransactions />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/sales/add" element={
              <ProtectedRoute>
                <PageLayout>
                  <AddSaleTransaction />
                </PageLayout>
              </ProtectedRoute>
            } />
            
            {/* Stock Routes */}
            <Route path="/stock" element={
              <ProtectedRoute>
                <PageLayout>
                  <StockAdditions />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/stock/add" element={
              <ProtectedRoute>
                <PageLayout>
                  <AddStockAddition />
                </PageLayout>
              </ProtectedRoute>
            } />
            
            {/* Products Routes */}
            <Route path="/products" element={
              <ProtectedRoute>
                <PageLayout>
                  <Products />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/products/add" element={
              <ProtectedRoute>
                <PageLayout>
                  <AddProduct />
                </PageLayout>
              </ProtectedRoute>
            } />
            
            {/* Adjustments Routes */}
            <Route path="/adjustments" element={
              <ProtectedRoute>
                <PageLayout>
                  <InventoryAdjustments />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/adjustments/add" element={
              <ProtectedRoute>
                <PageLayout>
                  <AddInventoryAdjustment />
                </PageLayout>
              </ProtectedRoute>
            } />
            
            {/* Reports Routes */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <PageLayout>
                  <Reports />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports/daily-sales" element={
              <ProtectedRoute>
                <PageLayout>
                  <DailySalesReport />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports/monthly-sales" element={
              <ProtectedRoute>
                <PageLayout>
                  <MonthlySalesReport />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports/annual-sales" element={
              <ProtectedRoute>
                <PageLayout>
                  <AnnualSalesReport />
                </PageLayout>
              </ProtectedRoute>
            } />
           
            <Route path="/reports/daily-stock" element={
              <ProtectedRoute>
                <PageLayout>
                  <DailyStockReport />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports/monthly-stock" element={
              <ProtectedRoute>
                <PageLayout>
                  <MonthlyStockReport />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports/annual-stock" element={
              <ProtectedRoute>
                <PageLayout>
                  <AnnualStockReport />
                </PageLayout>
              </ProtectedRoute>
            } />
           
            {/* Admin-only Settings Routes */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <PageLayout>
                  <Settings />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings/users" element={
              <AdminRoute>
                <PageLayout>
                  <UsersManagement />
                </PageLayout>
              </AdminRoute>
            } />
            <Route path="/settings/user-logs" element={
              <AdminRoute>
                <PageLayout>
                  <UserLogs />
                </PageLayout>
              </AdminRoute>
            } />
            <Route path="/settings/units" element={
              <AdminRoute>
                <PageLayout>
                  <UnitsOfMeasurement />
                </PageLayout>
              </AdminRoute>
            } />
            <Route path="/settings/products" element={
              <AdminRoute>
                <PageLayout>
                  <ProductsManagement />
                </PageLayout>
              </AdminRoute>
            } />
            <Route path="/settings/organization" element={
              <AdminRoute>
                <PageLayout>
                  <OrganizationProfile />
                </PageLayout>
              </AdminRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CustomToaster />
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
