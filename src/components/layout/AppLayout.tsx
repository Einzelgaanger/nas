import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DisburserSidebar } from "@/components/layout/DisburserSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileNav } from "./MobileNav";

export function AppLayout() {
  const { role } = useUserRole();
  const { isMobile } = useIsMobile();
  const { user } = useUserInfo();
  
  // Get first letter of user's name for avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        {!isMobile && (
          <div className="w-64 border-r bg-white">
            {role === "admin" ? <AdminSidebar /> : <DisburserSidebar />}
          </div>
        )}
        <div className="flex-1">
          <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">SecureAid</h1>
            </div>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </div>
        {isMobile && <MobileNav role={role} />}
      </div>
    </SidebarProvider>
  );
}
