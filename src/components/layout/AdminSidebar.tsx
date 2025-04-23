import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import {
  Users,
  UserCheck,
  Package,
  AlertTriangle,
  BarChart3,
  LogOut,
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

  const handleLogout = () => {
    logout();
  };

  const handleNavClick = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(url);
  };

  return (
    <Sidebar className="border-r bg-white">
      <SidebarContent>
        <SidebarTrigger className="h-16 border-b flex items-center justify-center border-green-200">
          <div className="text-center">
            <h1 className="font-bold text-green-700 text-xl">SecureAid</h1>
          </div>
        </SidebarTrigger>
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={handleNavClick(item.url)}
                      className={cn(
                        "flex items-center gap-3 w-full text-left",
                        location.pathname === item.url ? "text-green-600 font-medium" : "text-gray-700"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left text-red-600"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
