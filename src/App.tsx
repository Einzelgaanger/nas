import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load components for better performance
const AdminDashboard = lazy(() => import('./components/admin/Dashboard'));
const DisburserDashboard = lazy(() => import('./components/disburser/Dashboard'));
const BeneficiaryRegistration = lazy(() => import('./components/admin/BeneficiaryRegistration'));
const ManageAllocations = lazy(() => import('./components/admin/ManageAllocations'));
const Alerts = lazy(() => import('./components/admin/Alerts'));
const AllocateResources = lazy(() => import('./components/disburser/AllocateResources'));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/beneficiaries" element={<BeneficiaryRegistration />} />
          <Route path="/admin/allocations" element={<ManageAllocations />} />
          <Route path="/admin/alerts" element={<Alerts />} />
          
          {/* Disburser Routes */}
          <Route path="/disburser" element={<DisburserDashboard />} />
          <Route path="/disburser/allocate" element={<AllocateResources />} />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
              <a href="/" className="text-primary hover:underline">
                Go back home
              </a>
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
