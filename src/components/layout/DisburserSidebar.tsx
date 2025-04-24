import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  Package,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useAuth } from "@/hooks/useAuth";

export function DisburserSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserInfo();
  const { logout } = useAuth();
  
  const menuItems = [
    {
      title: "Register Beneficiary",
      url: "/disburser/register",
      icon: UserPlus,
    },
    {
      title: "Allocate Resources",
      url: "/disburser/allocate",
      icon: Package,
    },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <aside className="h-screen bg-slate-800 text-white w-64 fixed left-0 top-0 z-50 shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0">
      {/* Sidebar Header */}
      <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
        <h1 className="font-bold text-xl text-emerald-400">SecureAid</h1>
      </div>
      
      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-700">
          <p className="text-sm text-slate-400">Welcome,</p>
          <p className="font-medium text-white">{user.name}</p>
          <p className="text-xs text-emerald-400 mt-1">{user.region}</p>
        </div>
      )}
      
      {/* Navigation Menu */}
      <nav className="py-4">
        <p className="px-6 mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Actions</p>
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
