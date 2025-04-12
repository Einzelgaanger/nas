
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Admin pages
import ManageDisbursers from "./pages/admin/ManageDisbursers";

// Disburser pages
import RegisterBeneficiary from "./pages/disburser/RegisterBeneficiary";
import AllocateResources from "./pages/disburser/AllocateResources";

// Create a new QueryClient to fix stale data issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route for login */}
            <Route path="/" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Common Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/disbursers" replace />} />
                <Route path="/admin/disbursers" element={<ManageDisbursers />} />
                <Route path="/admin/beneficiaries" element={<Dashboard />} />
                <Route path="/admin/resources" element={<Dashboard />} />
                <Route path="/admin/goods" element={<Dashboard />} />
                <Route path="/admin/alerts" element={<Dashboard />} />
                
                {/* Disburser Routes */}
                <Route path="/disburser" element={<Navigate to="/disburser/register" replace />} />
                <Route path="/disburser/register" element={<RegisterBeneficiary />} />
                <Route path="/disburser/allocate" element={<AllocateResources />} />
              </Route>
            </Route>
            
            {/* Catch-all for 404s */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
