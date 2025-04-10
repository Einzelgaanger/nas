
import React from "react";
import { Link, useLocation } from "react-router-dom";
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

export function AdminSidebar() {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
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
      url: "/admin/resources",
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
    // Will implement logout functionality later
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarTrigger className="h-16 border-b flex items-center justify-center" />
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3",
                        location.pathname === item.url ? "text-secure-DEFAULT font-medium" : ""
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
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
