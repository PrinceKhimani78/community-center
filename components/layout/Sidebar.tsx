"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Bell,
  FileText,
  CalendarDays,
  Wallet,
  Receipt,
  Wrench,
  MapPin,
  Users,
  CircleCheck,
  BarChart3,
  TrendingUp,
  History,
  Shield,
  LogOut,
  X,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: "actionCount" | "fixedYellow";
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Notifications", href: "/notifications", icon: Bell, badge: "actionCount" },
  { label: "Bookings", href: "/bookings", icon: FileText },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "Receipts", href: "/receipts", icon: Receipt },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Attendance", href: "/attendance", icon: MapPin },
  { label: "Booking Applicants", href: "/applicants", icon: Users },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Approvals", href: "/approvals", icon: CircleCheck, badge: "fixedYellow" },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Analytics", href: "/analytics", icon: TrendingUp },
  { label: "Audit Logs", href: "/audit-logs", icon: History },
  { label: "Users & Roles", href: "/users", icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, actionCount, isMobileSidebarOpen, closeMobileSidebar } = useDashboard();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore error
    } finally {
      router.push("/login");
    }
  };

  const renderNavList = (items: NavItem[]) => {
    return (
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMobileSidebar}
                className={`h-[46px] rounded-[10px] px-3.5 flex items-center justify-between text-[15px] font-medium transition-colors select-none ${
                  isActive
                    ? "bg-[#F8E7B9] text-navy font-semibold shadow-xs"
                    : "text-[#374151] hover:bg-cream hover:text-navy"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-navy" : "text-[#5B6474]"}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge === "actionCount" && actionCount > 0 && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#C62828] text-white text-[11px] font-bold flex items-center justify-center">
                    {actionCount}
                  </span>
                )}

                {item.badge === "fixedYellow" && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#F5B700] text-[#3D2E00] text-[11px] font-bold flex items-center justify-center">
                    5
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 overflow-y-auto no-scrollbar">
      {/* Top Branding */}
      <div>
        <div className="flex items-center gap-3 pb-3.5 border-b border-[#EFE4CC]">
          <Image
            src="/logo.png"
            alt="Valibhoy Community Centre logo"
            width={60}
            height={60}
            className="w-[60px] h-[60px] rounded-full object-contain shrink-0"
            priority
          />
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-[13px] font-bold text-navy leading-tight font-poppins">
              Haji Mohamed Yunus Valibhoy Community Centre
            </h1>
            <p className="text-[11px] font-bold text-deep-gold leading-tight font-gujarati mt-0.5">
              હાજી મોહમ્મદ યુનુસ વલીભોય કોમ્યુનિટી સેન્ટર
            </p>
          </div>
          {/* Close button on mobile */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-muted hover:text-navy hover:bg-cream"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="mt-3.5" aria-label="Main Navigation">
          {renderNavList(MAIN_NAV_ITEMS)}

          {/* Admin Navigation (Only if role === 'admin') */}
          {role === "admin" && (
            <div className="mt-4 pt-3 border-t border-[#EFE4CC]">
              <div className="text-[11px] font-bold tracking-wider text-deep-gold px-3 mb-1.5 uppercase">
                ADMIN ONLY
              </div>
              {renderNavList(ADMIN_NAV_ITEMS)}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom: Logout */}
      <div className="pt-4 mt-6 border-t border-[#EFE4CC]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full h-[46px] rounded-[10px] border border-[#F3C1C1] text-[#C62828] hover:bg-red-50/70 transition-colors flex items-center justify-center gap-2 text-[14px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-light-gold"
        >
          <LogOut className="w-4 h-4 text-[#C62828]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden lg:block w-[248px] shrink-0 h-screen sticky top-0 bg-white border-r border-[#EFE4CC] z-30"
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Below 1024px) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy/40 backdrop-blur-xs transition-opacity"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative w-[280px] max-w-[85vw] h-full bg-white shadow-xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
