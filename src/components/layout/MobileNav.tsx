import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Package, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MobileNav() {
  const { userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const adminLinks = [
    { title: "Dashboard", url: "/admin/dashboard", icon: Home },
    { title: "Disbursers", url: "/admin/disbursers", icon: Users },
    { title: "Beneficiaries", url: "/admin/beneficiaries", icon: Users },
    { title: "Alerts", url: "/admin/alerts", icon: Bell },
  ];

  const disburserLinks = [
    { title: "Register", url: "/disburser/register", icon: Users },
    { title: "Allocate", url: "/disburser/allocate", icon: Package },
  ];

  const links = userRole === "admin" ? adminLinks : disburserLinks;

  const handleNavClick = (url: string) => {
    navigate(url);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-md">
      <div className="grid h-full grid-cols-4 mx-auto">
        {links.map((link) => (
          <button
            key={link.title}
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50",
              location.pathname === link.url ? "text-green-600" : "text-gray-500"
            )}
            onClick={() => handleNavClick(link.url)}
          >
            <link.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{link.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
