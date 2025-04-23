import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import AdminDashboard from './pages/admin/Dashboard';
import DisburserDashboard from './pages/disburser/Dashboard';
import BeneficiaryRegistration from './pages/admin/BeneficiaryRegistration';
import ManageAllocations from './pages/admin/ManageAllocations';
import Alerts from './pages/admin/Alerts';
import AllocateResources from './pages/disburser/AllocateResources';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/beneficiaries" element={<BeneficiaryRegistration />} />
          <Route path="/admin/allocations" element={<ManageAllocations />} />
          <Route path="/admin/alerts" element={<Alerts />} />
          
          {/* Disburser Routes */}
          <Route path="/disburser" element={<DisburserDashboard />} />
          <Route path="/disburser/allocate" element={<AllocateResources />} />
          
          {/* Redirect root to appropriate dashboard based on role */}
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
