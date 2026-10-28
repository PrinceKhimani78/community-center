"use client";

import React, { useState } from "react";
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
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

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
          const isHovered = hoveredHref === item.href;

          let itemBg = "transparent";
          let itemBorder = "3px solid transparent";
          let itemColor = "rgba(255, 255, 255, 0.75)";
          let iconColor = "rgba(255, 255, 255, 0.65)";
          let itemWeight = 500;

          if (isActive) {
            itemBg = "linear-gradient(90deg, rgba(226, 181, 68, 0.28) 0%, rgba(201, 151, 28, 0.12) 100%)";
            itemBorder = "3px solid #E2B544";
            itemColor = "#FFFFFF";
            iconColor = "#E2B544";
            itemWeight = 600;
          } else if (isHovered) {
            itemBg = "rgba(226, 181, 68, 0.16)";
            itemBorder = "3px solid #E2B544";
            itemColor = "#FFFFFF";
            iconColor = "#E2B544";
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMobileSidebar}
                onMouseEnter={() => setHoveredHref(item.href)}
                onMouseLeave={() => setHoveredHref(null)}
                style={{
                  background: itemBg,
                  borderLeft: itemBorder,
                  color: itemColor,
                  fontWeight: itemWeight,
                  height: "38px",
                  borderRadius: "8px",
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "13.5px",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span style={{ color: iconColor }} className="shrink-0 flex items-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge === "actionCount" && actionCount > 0 && (
                  <span
                    style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
                    className="h-[18px] min-w-[18px] px-1.5 rounded-full text-[10.5px] font-bold flex items-center justify-center shadow-xs"
                  >
                    {actionCount}
                  </span>
                )}

                {item.badge === "fixedYellow" && (
                  <span
                    style={{ backgroundColor: "#F5B700", color: "#3D2E00" }}
                    className="h-[18px] min-w-[18px] px-1.5 rounded-full text-[10.5px] font-bold flex items-center justify-center shadow-xs"
                  >
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
    <div className="flex flex-col justify-between h-full p-3.5 overflow-y-auto no-scrollbar">
      {/* Top Branding */}
      <div>
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Image
            src="/logo.png"
            alt="Valibhoy Community Centre logo"
            width={44}
            height={44}
            className="w-[42px] h-[42px] rounded-full object-contain shrink-0 ring-1 ring-[#E2B544]/40 shadow-xs"
            priority
          />
          <div className="flex flex-col justify-center min-w-0">
            <h1
              style={{ color: "#FFFFFF" }}
              className="text-[12px] font-bold leading-tight font-poppins"
            >
              Haji Mohamed Yunus Valibhoy Community Centre
            </h1>
            <p
              style={{ color: "#E2B544" }}
              className="text-[10px] font-bold leading-tight font-gujarati mt-0.5"
            >
              હાજી મોહમ્મદ યુનુસ વલીભોય કોમ્યુનિટી સેન્ટર
            </p>
          </div>
          {/* Close button on mobile */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="mt-3" aria-label="Main Navigation">
          {renderNavList(MAIN_NAV_ITEMS)}

          {/* Admin Navigation (Only if role === 'admin') */}
          {role === "admin" && (
            <div className="mt-3.5 pt-3 border-t border-white/10">
              <div
                style={{ color: "#E2B544" }}
                className="text-[10px] font-bold tracking-wider px-3 mb-1.5 uppercase"
              >
                ADMIN ONLY
              </div>
              {renderNavList(ADMIN_NAV_ITEMS)}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom: Logout */}
      <div className="pt-3 mt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          style={{
            height: "38px",
            borderRadius: "8px",
            border: isLogoutHovered ? "1px solid rgba(248, 113, 113, 0.6)" : "1px solid rgba(248, 113, 113, 0.25)",
            backgroundColor: isLogoutHovered ? "rgba(220, 38, 38, 0.25)" : "rgba(127, 29, 29, 0.2)",
            color: isLogoutHovered ? "#FFFFFF" : "#FCA5A5",
            transition: "all 0.15s ease",
          }}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
        >
          <LogOut className="w-3.5 h-3.5" style={{ color: isLogoutHovered ? "#FFFFFF" : "#FCA5A5" }} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        style={{
          background: "linear-gradient(180deg, #051636 0%, #08204D 60%, #031026 100%)",
        }}
        className="hidden lg:block w-[240px] shrink-0 h-screen sticky top-0 border-r border-[#0E2A5D] z-30"
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Below 1024px) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            style={{
              background: "linear-gradient(180deg, #051636 0%, #08204D 60%, #031026 100%)",
            }}
            className="relative w-[260px] max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-[#0E2A5D]"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
