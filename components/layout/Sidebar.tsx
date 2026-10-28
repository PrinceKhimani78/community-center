"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  CalendarDays,
  Calendar,
  CreditCard,
  Receipt,
  Wrench,
  UserCheck,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: "actionCount" | "fixedYellow";
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Notifications", href: "/notifications", icon: Bell, badge: "actionCount" },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Receipts", href: "/receipts", icon: Receipt },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Attendance", href: "/attendance", icon: UserCheck },
  { label: "Booking Applicants", href: "/applicants", icon: Users },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help & Guide", href: "/help", icon: HelpCircle },
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
          let itemBorder = "3.5px solid transparent";
          let itemColor = "rgba(255, 255, 255, 0.72)";
          let iconColor = "rgba(255, 255, 255, 0.65)";
          let itemWeight = 500;
          let itemTransform = "none";
          let itemShadow = "none";

          if (isActive) {
            itemBg = "linear-gradient(90deg, rgba(226, 181, 68, 0.28) 0%, rgba(11, 42, 91, 0.5) 100%)";
            itemBorder = "3.5px solid #E2B544";
            itemColor = "#FFFFFF";
            iconColor = "#E2B544";
            itemWeight = 700;
            itemShadow = "0 2px 10px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)";
          } else if (isHovered) {
            itemBg = "linear-gradient(90deg, rgba(226, 181, 68, 0.2) 0%, rgba(255, 255, 255, 0.06) 100%)";
            itemBorder = "3.5px solid #F6D062";
            itemColor = "#FFFFFF";
            iconColor = "#F6D062";
            itemWeight = 600;
            itemTransform = "translateX(5px)";
            itemShadow = "0 4px 14px rgba(0, 0, 0, 0.2), 0 0 12px rgba(226, 181, 68, 0.3)";
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
                  transform: itemTransform,
                  boxShadow: itemShadow,
                  transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  userSelect: "none",
                }}
                className="cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    style={{
                      color: iconColor,
                      transform: isHovered ? "scale(1.15)" : "scale(1)",
                      filter: isHovered ? "drop-shadow(0 0 6px rgba(246, 208, 98, 0.55))" : "none",
                      transition: "all 0.18s ease",
                    }}
                    className="shrink-0 flex items-center"
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge === "actionCount" && actionCount > 0 && (
                    <span
                      style={{
                        backgroundColor: "#DC2626",
                        color: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(220, 38, 38, 0.4)",
                      }}
                      className="h-[18px] min-w-[18px] px-1.5 rounded-full text-[10.5px] font-bold flex items-center justify-center"
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

                  {/* Subtle right chevron on hover for inactive items */}
                  {isHovered && !isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#F6D062] animate-in fade-in slide-in-from-left-1 duration-150" />
                  )}
                </div>
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
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/15">
          <Image
            src="/logo.png"
            alt="Valibhoy Community Centre logo"
            width={44}
            height={44}
            className="w-[42px] h-[42px] rounded-full object-contain shrink-0 ring-2 ring-[#E2B544] ring-offset-2 ring-offset-[#071C44] shadow-sm"
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
              style={{ color: "#F5C444" }}
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
        <nav className="mt-3.5" aria-label="Main Navigation">
          {renderNavList(MAIN_NAV_ITEMS)}

          {/* Admin Navigation (Only if role === 'admin') */}
          {role === "admin" && (
            <div className="mt-4 pt-3.5 border-t border-white/15">
              <div
                style={{ color: "#F5C444" }}
                className="text-[10px] uppercase font-bold tracking-wider px-3 mb-2"
              >
                Admin Area
              </div>
              {renderNavList(ADMIN_NAV_ITEMS)}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom: Logout (With generous bottom padding to clear dev tools) */}
      <div style={{ paddingBottom: "28px" }} className="pt-3.5 mt-4 border-t border-white/15">
        <button
          type="button"
          onClick={handleLogout}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          style={{
            height: "38px",
            borderRadius: "8px",
            border: isLogoutHovered ? "1px solid rgba(248, 113, 113, 0.7)" : "1px solid rgba(255, 255, 255, 0.12)",
            backgroundColor: isLogoutHovered ? "rgba(220, 38, 38, 0.3)" : "rgba(255, 255, 255, 0.06)",
            color: isLogoutHovered ? "#FFFFFF" : "#FCA5A5",
            transform: isLogoutHovered ? "translateY(-1px)" : "none",
            boxShadow: isLogoutHovered ? "0 4px 12px rgba(220, 38, 38, 0.25)" : "none",
            transition: "all 0.18s ease",
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
      {/* Desktop Persistent Sidebar with Rich Royal Navy Palette */}
      <aside
        style={{
          background: "linear-gradient(180deg, #071C44 0%, #09265B 45%, #05183B 100%)",
          borderRight: "1px solid rgba(226, 181, 68, 0.25)",
        }}
        className="hidden lg:block w-[240px] shrink-0 h-screen sticky top-0 z-30 shadow-xl"
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
              background: "linear-gradient(180deg, #071C44 0%, #09265B 45%, #05183B 100%)",
              borderRight: "1px solid rgba(226, 181, 68, 0.25)",
            }}
            className="relative w-[260px] max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
