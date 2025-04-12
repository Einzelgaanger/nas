
import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DisburserSidebar } from "@/components/layout/DisburserSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserInfo } from "@/hooks/useUserInfo";

export function AppLayout() {
  const { role } = useUserRole();
  const isMobile = useIsMobile();
  const { user } = useUserInfo();
  
  // Get first letter of user's name for avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <SidebarProvider>
      <AnimatedIcons />
      <div className="min-h-screen flex w-full overflow-hidden bg-gray-50">
        {!isMobile && (role === "admin" ? <AdminSidebar /> : <DisburserSidebar />)}
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-4 bg-white shadow-sm z-10">
            <h1 className="text-xl font-bold flex items-center gap-2 text-secure-DEFAULT">
              <Shield size={24} className="text-secure-light animate-pulse" />
              <span className="bg-gradient-to-r from-secure-DEFAULT to-secure-accent bg-clip-text text-transparent">
                SecureAid Network
              </span>
            </h1>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8 bg-secure-light text-white">
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          
          <main className="flex-1 p-3 sm:p-6 bg-gray-50 overflow-auto fade-in">
            <Outlet />
          </main>
          
          {isMobile && (
            <div className="mobile-menu shadow-lg">
              {role === "admin" ? (
                <>
                  <a href="/dashboard" className="mobile-menu-item">
                    <Shield size={20} />
                    <span>Dashboard</span>
                  </a>
                  <a href="/admin/disbursers" className="mobile-menu-item">
                    <Shield size={20} />
                    <span>Disbursers</span>
                  </a>
                  <a href="/admin/beneficiaries" className="mobile-menu-item">
                    <Shield size={20} />
                    <span>Beneficiaries</span>
                  </a>
                  <a href="/admin/resources" className="mobile-menu-item">
                    <Shield size={20} />
                    <span>Resources</span>
                  </a>
                </>
              ) : (
                <>
                  <a href="/disburser/register" className="mobile-menu-item">
                    <Shield size={20} />
                    <span>Register</span>
                  </a>
                  <a href="/disburser/allocate" className="mobile-menu-item">
                    <Shield size={20} />
                    <span>Allocate</span>
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
