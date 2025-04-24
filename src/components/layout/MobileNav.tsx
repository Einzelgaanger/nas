import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  BarChart3, Users, UserCheck, Package, AlertTriangle, 
  LogOut, UserPlus 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MobileNav() {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const adminLinks = [
    { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
    { title: "Disbursers", url: "/admin/disbursers", icon: Users },
    { title: "Beneficiaries", url: "/admin/beneficiaries", icon: UserCheck },
    { title: "Allocations", url: "/admin/allocations", icon: Package },
    { title: "Alerts", url: "/admin/alerts", icon: AlertTriangle },
  ];

  const disburserLinks = [
    { title: "Register", url: "/disburser/register", icon: UserPlus },
    { title: "Allocate", url: "/disburser/allocate", icon: Package },
  ];

  const links = role === "admin" ? adminLinks : disburserLinks;

  const handleNavClick = (url: string): void => {
    navigate(url);
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 shadow-md lg:hidden">
      <div className="grid h-full grid-cols-5 mx-auto">
        {links.map((link, index) => (
          <button
            key={link.title}
            className={cn(
              "inline-flex flex-col items-center justify-center px-1",
              "hover:bg-slate-50 transition-colors",
              location.pathname === link.url ? "text-emerald-600" : "text-slate-600"
            )}
            onClick={() => handleNavClick(link.url)}
          >
            <link.icon className="w-5 h-5 mb-1" />
            <span className="text-xs truncate">{link.title}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
