
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute mounted, auth status:", { isAuthenticated, role, path: location.pathname });
  }, [isAuthenticated, role, location]);

  console.log("ProtectedRoute check:", { isAuthenticated, role, path: location.pathname });

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child routes
  console.log("Authenticated, rendering outlet");
  return <Outlet />;
};

export default ProtectedRoute;
