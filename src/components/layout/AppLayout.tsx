
import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DisburserSidebar } from "@/components/layout/DisburserSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield } from "lucide-react";

export function AppLayout() {
  const { role } = useUserRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {role === "admin" ? <AdminSidebar /> : <DisburserSidebar />}
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-4 bg-white">
            <h1 className="text-xl font-bold flex items-center gap-2 text-secure-DEFAULT">
              <Shield size={24} />
              SecureAid Network
            </h1>
            <div className="flex items-center gap-4">
              {/* Profile dropdown will go here */}
            </div>
          </header>
          <main className="flex-1 p-6 bg-gray-50 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
