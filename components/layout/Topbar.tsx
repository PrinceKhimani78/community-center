"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Calendar, Bell, ArrowLeft } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

interface TopbarProps {
  title?: string;
}

const ROUTE_TITLES: Array<{ prefix: string; title: string; subtitle: string }> = [
  { prefix: "/dashboard", title: "Dashboard", subtitle: "Daily summary & quick work" },
  { prefix: "/notifications", title: "Notifications", subtitle: "Alerts & reminders" },
  { prefix: "/bookings/new", title: "New Booking", subtitle: "Book a community hall" },
  { prefix: "/bookings/", title: "Booking Details", subtitle: "View & update booking" },
  { prefix: "/bookings", title: "Bookings", subtitle: "All hall bookings" },
  { prefix: "/calendar", title: "Calendar", subtitle: "Hall schedule by date" },
  { prefix: "/customers/", title: "Customer Profile", subtitle: "History, ledger & notes" },
  { prefix: "/customers", title: "Customers", subtitle: "Customer directory & dues" },
  { prefix: "/payments", title: "Payments & Expenses", subtitle: "Rent, deposits & expenses" },
  { prefix: "/deposits/", title: "Deposit Refund", subtitle: "Deposit refund workflow" },
  { prefix: "/invoices/", title: "Invoices & Receipts", subtitle: "Invoice & receipt generator" },
  { prefix: "/receipts", title: "Invoices & Receipts", subtitle: "View & print receipts" },
  { prefix: "/maintenance/new", title: "New Maintenance Request", subtitle: "Tickets, quotes & calendar block" },
  { prefix: "/maintenance", title: "Maintenance Requests", subtitle: "Tickets, quotations & approvals" },
  { prefix: "/inspections/", title: "Property Inspection", subtitle: "Before & after hall checklist" },
  { prefix: "/attendance", title: "Attendance", subtitle: "GPS check-in & check-out" },
  { prefix: "/applicants", title: "Booking Applicants", subtitle: "Customer details & dues" },
  { prefix: "/settings", title: "Admin Settings", subtitle: "Approvals, reports & users" },
  { prefix: "/approvals", title: "Approvals", subtitle: "Approve pending requests" },
  { prefix: "/reports", title: "Reports", subtitle: "Summary & exports" },
  { prefix: "/analytics", title: "Analytics", subtitle: "Monthly hall summary" },
  { prefix: "/users", title: "Users & Roles", subtitle: "Staff accounts & access" },
  { prefix: "/audit-logs", title: "Activity Log", subtitle: "Who changed what" },
  { prefix: "/help", title: "Help & Guide", subtitle: "Simple step-by-step guide" },
];

const emptySubscribe = () => () => {};

function getClientTodayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Topbar({ title }: TopbarProps) {
  const pathname = usePathname();
  const { role, actionCount, unreadAlertCount } = useDashboard();
  const bellCount = role === "admin" ? unreadAlertCount : actionCount;

  const matched = ROUTE_TITLES.find((r) => pathname.startsWith(r.prefix));
  const displayTitle = title || matched?.title || "Dashboard";
  const displaySubtitle = matched?.subtitle || "Community Centre";
  const isDashboard = pathname === "/dashboard";

  const isManager = role === "manager";
  const userInitials = isManager ? "MG" : "AD";
  const userName = isManager ? "Manager" : "Admin";
  const userRoleTitle = isManager ? "Centre Manager" : "Trustee / Admin";

  const currentDateLabel = React.useSyncExternalStore(
    emptySubscribe,
    getClientTodayLabel,
    () => "Today"
  );

  return (
    <>
      {/* DESKTOP HEADER (>= 1024px) */}
      <header
        style={{
          height: "58px",
          backgroundColor: "#FAF5EB",
          borderBottom: "1px solid rgba(226, 181, 68, 0.28)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "0 clamp(18px, 3vw, 28px)",
        }}
        className="hidden lg:flex items-center justify-between gap-3 no-print"
      >
        <div className="flex items-baseline gap-2.5 min-w-0 select-none">
          <h1
            style={{
              color: "#0B2A5B",
              fontSize: "16px",
              fontWeight: 700,
            }}
            className="tracking-tight truncate"
          >
            {displayTitle}
          </h1>
          <span
            style={{ color: "#78716C", fontSize: "12px", fontWeight: 500 }}
            className="truncate"
          >
            · {displaySubtitle}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <LanguageSwitcher variant="light" />

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(226, 181, 68, 0.28)",
              borderRadius: "9px",
              padding: "6px 12px",
              color: "#44403C",
              fontSize: "12.5px",
              fontWeight: 600,
              userSelect: "none",
            }}
            className="flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C9971C]" />
            <span>{currentDateLabel || "Today"}</span>
          </div>

          <Link
            href="/notifications"
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(226, 181, 68, 0.28)",
              borderRadius: "9px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0B2A5B",
            }}
            className="interactive-btn hover:bg-[#FFFDF8] hover:border-[#E2B544] shrink-0"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {bellCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 700,
                  height: "18px",
                  minWidth: "18px",
                  padding: "0 4px",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(220, 38, 38, 0.3)",
                }}
              >
                {bellCount}
              </span>
            )}
          </Link>

          <div
            style={{ paddingLeft: "10px", borderLeft: "1px solid rgba(226, 181, 68, 0.3)" }}
            className="flex items-center gap-2.5"
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "linear-gradient(135deg, #0B2A5B 0%, #071D44 100%)",
                border: "1.5px solid rgba(226, 181, 68, 0.45)",
                borderRadius: "9px",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(11, 42, 91, 0.18)",
              }}
              className="notranslate"
            >
              {userInitials}
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span style={{ color: "#0B2A5B", fontSize: "13px", fontWeight: 700 }}>
                {userName}
              </span>
              <span style={{ color: "#78716C", fontSize: "11px", fontWeight: 500 }}>
                {userRoleTitle}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE / TABLET HEADER (< 1024px) — No left sidebar at all */}
      <div className="lg:hidden no-print">
        {isDashboard ? (
          /* Signature Mobile Navy + Curved Gold Header matching reference screenshot */
          <header
            style={{
              background: "linear-gradient(180deg, #061A3E 0%, #0B2A5B 100%)",
            }}
            className="relative px-4 pt-3 pb-8 overflow-hidden"
          >
            <div className="relative z-10 flex justify-end mb-2">
              <LanguageSwitcher variant="dark" compact />
            </div>

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Image
                  src="/logo.png"
                  alt="Valibhoy Community Centre logo"
                  width={62}
                  height={62}
                  className="w-[58px] h-[58px] rounded-full object-contain shrink-0 ring-2 ring-[#E2B544] shadow-md"
                  priority
                />
                <div className="min-w-0">
                  <div className="text-white text-[13.5px] font-bold leading-snug">
                    Haji Mohamed Yunus Valibhoy Community Centre
                  </div>
                  <div
                    lang="gu"
                    className="notranslate text-[#F5C444] text-[12px] font-bold leading-snug mt-0.5"
                  >
                    હાજી મોહમ્મદ યુનુસ વલીભોય કોમ્યુનિટી સેન્ટર
                  </div>
                  <div className="text-[10.5px] text-white/85 mt-0.5">
                    <span className="text-[#F7E6A9] font-semibold">Serving Humanity</span> · DHARI,
                    GUJARAT, INDIA
                  </div>
                </div>
              </div>

              <Link
                href="/notifications"
                className="relative w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {bellCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                    {bellCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Bottom Gold Curve into Cream */}
            <div className="absolute -bottom-[1px] left-0 w-full leading-none pointer-events-none">
              <svg
                viewBox="0 0 1440 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-[26px]"
                preserveAspectRatio="none"
              >
                <path d="M0,18 Q720,70 1440,18 L1440,70 L0,70 Z" fill="#FAF5EB" />
                <path
                  d="M0,18 Q720,70 1440,18"
                  stroke="#E2B544"
                  strokeWidth="6"
                  fill="none"
                />
              </svg>
            </div>
          </header>
        ) : (
          /* Compact Sub-page Mobile Header with 1-tap Back to Home Tabs */
          <header
            style={{
              backgroundColor: "#0B2A5B",
              borderBottom: "2px solid #E2B544",
            }}
            className="sticky top-0 z-20 px-3.5 py-2.5 flex items-center justify-between gap-2 text-white shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/12 border border-[#E2B544]/60 text-[#F7E6A9] text-[12.5px] font-bold shrink-0 active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <span className="text-[15px] font-bold truncate">{displayTitle}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <LanguageSwitcher variant="dark" compact />

              <Link
                href="/notifications"
                className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {bellCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9.5px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center">
                    {bellCount}
                  </span>
                )}
              </Link>
            </div>
          </header>
        )}
      </div>
    </>
  );
}
