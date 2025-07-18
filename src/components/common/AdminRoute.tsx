
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!hasRole("Admin")) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;
