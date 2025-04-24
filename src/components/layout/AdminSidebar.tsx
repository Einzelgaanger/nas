import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Package,
  AlertTriangle,
  BarChart3,
  LogOut,
  Menu,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const menuItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      title: "Manage Disbursers",
      url: "/admin/disbursers",
      icon: Users,
    },
    {
      title: "Beneficiaries",
      url: "/admin/beneficiaries",
      icon: UserCheck,
    },
    {
      title: "Resource Allocation",
      url: "/admin/allocations",
      icon: Package,
    },
    {
      title: "Goods Management",
      url: "/admin/goods",
      icon: Package,
    },
    {
      title: "Fraud Alerts",
      url: "/admin/alerts",
      icon: AlertTriangle,
    },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const handleNavClick = (url) => (e) => {
    e.preventDefault();
    navigate(url);
  };

  return (
    <aside className="h-screen bg-slate-800 text-white w-64 fixed left-0 top-0 z-50 shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0">
      {/* Sidebar Header */}
      <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
        <h1 className="font-bold text-xl text-emerald-400">SecureAid</h1>
      </div>
      
      {/* Navigation Menu */}
      <nav className="py-4">
        <p className="px-6 mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Main Menu</p>
        <ul>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={item.title}>
                <Link
                  to={item.url}
                  className={cn(
                    "flex items-center w-full px-6 py-3 text-left transition-colors",
                    "hover:bg-slate-700 group relative",
                    isActive 
                      ? "bg-slate-700 text-emerald-400 font-medium"
                      : "text-slate-300"
                  )}
                >
                  <item.icon size={18} className="mr-3" />
                  <span>{item.title}</span>
                  {isActive && (
                    <span className="absolute inset-y-0 left-0 w-1 bg-emerald-400"></span>
                  )}
                  <ChevronRight size={16} className={cn(
                    "ml-auto opacity-0 transform transition-all duration-200",
                    "group-hover:opacity-100 group-hover:translate-x-1"
                  )} />
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Logout Section */}
        <div className="px-4 mt-8 border-t border-slate-700 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 w-full text-left text-red-400 hover:bg-slate-700 rounded transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
