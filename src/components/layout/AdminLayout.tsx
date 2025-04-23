import { Outlet } from 'react-router-dom';
import { Sidebar } from '../ui/sidebar';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 