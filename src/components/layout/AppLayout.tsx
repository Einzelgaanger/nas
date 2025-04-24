import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DisburserSidebar } from "@/components/layout/DisburserSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield, Menu, X, Bell, Settings, User } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { role } = useUserRole();
  const { user } = useUserInfo();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get first letter of user's name for avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const Sidebar = role === "admin" ? AdminSidebar : DisburserSidebar;
  
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, shown when toggled or on desktop */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform lg:translate-x-0 transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-screen lg:pl-64">
        {/* Header */}
        <header className="bg-white h-16 border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-600" />
              <h1 className="text-lg font-bold text-slate-800 hidden sm:block">SecureAid Network</h1>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
              <Bell size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
              <Settings size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-medium">
                {userInitial}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="bg-white p-4 border-t text-center text-xs text-slate-500">
          SecureAid Network &copy; {new Date().getFullYear()} - Secure aid distribution platform
        </footer>
      </div>
    </div>
  );
}
