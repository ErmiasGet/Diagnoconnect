import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  FileText,
  FlaskConical,
  Radiation,
  PillBottle,
  CreditCard,
  Shield,
  MessageSquare,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { getInitials } from "../../lib/utils";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Appointments", icon: Calendar, href: "/appointments" },
  { label: "My Doctors", icon: Stethoscope, href: "/medical-records" },
  { label: "Medical Records", icon: FileText, href: "/medical-records" },
  { label: "Lab Results", icon: FlaskConical, href: "/lab-results" },
  { label: "Radiology", icon: Radiation, href: "/radiology" },
  { label: "Prescriptions", icon: PillBottle, href: "/prescriptions" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Insurance", icon: Shield, href: "/insurance" },
  { label: "Chat", icon: MessageSquare, href: "/chat" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Profile", icon: User, href: "/profile" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const patient = user?.patient;

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Diagno<span className="text-blue-600">Connect</span>
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600 dark:text-blue-400" : "")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="p-4 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start gap-3", collapsed && "justify-center px-2")}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && <span className="text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </Button>

        <div className={cn("flex items-center gap-3 rounded-lg p-2", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={patient?.profileImage} alt={patient?.firstName} />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
              {getInitials(patient?.firstName || "P", patient?.lastName || "T")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {patient?.firstName} {patient?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start gap-3 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400", collapsed && "justify-center px-2")}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-900 shadow-md"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full transition-all duration-300 lg:relative",
          collapsed ? "w-[68px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
