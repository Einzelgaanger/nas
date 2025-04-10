
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Protected Admin & Disburser Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Common Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Admin Routes */}
                <Route path="/admin/disbursers" element={<ManageDisbursers />} />
                <Route path="/admin/beneficiaries" element={<Dashboard />} /> {/* Placeholder */}
                <Route path="/admin/resources" element={<Dashboard />} /> {/* Placeholder */}
                <Route path="/admin/goods" element={<Dashboard />} /> {/* Placeholder */}
                <Route path="/admin/alerts" element={<Dashboard />} /> {/* Placeholder */}
                
                {/* Disburser Routes */}
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
