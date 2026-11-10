"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  CalendarPlus,
  ListChecks,
  Wallet,
  Receipt,
  Wrench,
  UserCheck,
  Users,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  LayoutGrid,
  Sparkles,
  Plus,
  CheckSquare,
  CalendarDays,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ActionList from "@/components/dashboard/ActionList";
import ComingUp from "@/components/dashboard/ComingUp";

type DashTab = "tabs" | "overview" | "todo" | "upcoming";

interface TileTabConfig {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  cardBg: string;
  cardBorder: string;
  circleBg: string;
  labelColor: string;
  badgeCount?: number;
}

const emptySubscribe = () => () => {};

function getGreetingSnapshot() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const { role, actionCount, bookings } = useDashboard();
  const [activeTab, setActiveTab] = useState<DashTab>("tabs");

  const greetingTime = useSyncExternalStore(
    emptySubscribe,
    getGreetingSnapshot,
    () => "Good afternoon"
  );

  const userName = role === "admin" ? "Admin" : "Manager";
  const upcomingCount = bookings.filter(
    (b) => b.status !== "Completed" && b.status !== "Cancelled"
  ).length;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore error
    } finally {
      router.push("/login");
    }
  };

  const navTabs: TabItem<DashTab>[] = [
    { id: "tabs", label: "Quick Tabs", icon: LayoutGrid },
    { id: "overview", label: "Overview", icon: Sparkles },
    { id: "todo", label: "To-Do", icon: CheckSquare, count: actionCount },
    { id: "upcoming", label: "Upcoming", icon: CalendarDays, count: upcomingCount },
  ];

  const tiles: TileTabConfig[] = [
    {
      label: "New Booking",
      href: "/bookings/new",
      icon: CalendarPlus,
      cardBg: "#EBF9EE",
      cardBorder: "#CBEBD2",
      circleBg: "#15803D",
      labelColor: "#14532D",
    },
    {
      label: "Bookings List",
      href: "/bookings",
      icon: ListChecks,
      cardBg: "#EAF3FF",
      cardBorder: "#C8DFFD",
      circleBg: "#1D6FE2",
      labelColor: "#1E3A8A",
    },
    {
      label: "Calendar",
      href: "/calendar",
      icon: Calendar,
      cardBg: "#FFF1E6",
      cardBorder: "#FED8BA",
      circleBg: "#F97316",
      labelColor: "#9A3412",
    },
    {
      label: "Payments",
      href: "/payments",
      icon: Wallet,
      cardBg: "#E6F8F5",
      cardBorder: "#BEECE4",
      circleBg: "#0D9488",
      labelColor: "#134E4A",
    },
    {
      label: "Receipts",
      href: "/receipts",
      icon: Receipt,
      cardBg: "#EEF0FF",
      cardBorder: "#D2D8FD",
      circleBg: "#4F46E5",
      labelColor: "#312E81",
    },
    {
      label: "Maintenance",
      href: "/maintenance",
      icon: Wrench,
      cardBg: "#F3EEFF",
      cardBorder: "#DCD0FE",
      circleBg: "#7C3AED",
      labelColor: "#4C1D95",
    },
    {
      label: "Attendance",
      href: "/attendance",
      icon: UserCheck,
      cardBg: "#FEF5DD",
      cardBorder: "#F4DD9D",
      circleBg: "#D4940E",
      labelColor: "#78350F",
    },
    {
      label: "Applicants",
      href: "/applicants",
      icon: Users,
      cardBg: "#FFECEF",
      cardBorder: "#FACFD6",
      circleBg: "#DC2626",
      labelColor: "#881337",
    },
    role === "admin"
      ? {
          label: "Admin & Reports",
          href: "/settings",
          icon: Settings,
          cardBg: "#EEF1F6",
          cardBorder: "#D2DBE8",
          circleBg: "#475569",
          labelColor: "#1E293B",
        }
      : {
          label: "To-Do & Alerts",
          href: "/notifications",
          icon: Bell,
          cardBg: "#EEF1F6",
          cardBorder: "#D2DBE8",
          circleBg: "#475569",
          labelColor: "#1E293B",
          badgeCount: actionCount,
        },
  ];

  return (
    <PageShell hideHeader>
      <div className="max-w-[1120px] mx-auto w-full flex flex-col gap-5">
        {/* Clean Top Switcher Tabs */}
        <TabBar
          tabs={navTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          ariaLabel="Dashboard tabs"
        />

        {/* Tab Content with Smooth Animation */}
        <div key={activeTab} className="animate-tab-enter">
          {activeTab === "tabs" && (
            <div className="max-w-[920px] mx-auto flex flex-col gap-5">
              {/* Clean Welcome Strip */}
              <section
                aria-label="Welcome"
                style={{
                  background: "linear-gradient(135deg, #FFFDF7 0%, #FDF4DC 100%)",
                  border: "1.5px solid #EFE4CC",
                  borderRadius: "20px",
                  boxShadow: "0 10px 26px -8px rgba(11, 42, 91, 0.08)",
                  padding: "18px 22px",
                }}
                className="interactive-card animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    style={{
                      width: "54px",
                      height: "54px",
                      borderRadius: "9999px",
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #E2B544",
                      color: "#0B2A5B",
                    }}
                    className="flex items-center justify-center shrink-0 shadow-2xs"
                  >
                    <User className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <div style={{ color: "#5B6474", fontSize: "12.5px", fontWeight: 500 }}>
                      Welcome
                    </div>
                    <h1
                      style={{ color: "#0B2A5B", fontSize: "21px", fontWeight: 800 }}
                      className="leading-tight"
                    >
                      {userName}
                    </h1>
                    <p
                      style={{ color: "#5B6474", fontSize: "12.5px", fontWeight: 500 }}
                      className="truncate mt-0.5"
                    >
                      Haji Mohamed Yunus Valibhoy Community Centre
                    </p>
                  </div>
                </div>

                <div
                  style={{ borderColor: "#E8D9B5" }}
                  className="flex items-center gap-3 sm:pl-6 sm:border-l shrink-0"
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #EFE4CC",
                      color: "#0B2A5B",
                    }}
                    className="flex items-center justify-center shrink-0"
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="leading-tight">
                    <div style={{ color: "#5B6474", fontSize: "12px", fontWeight: 500 }}>
                      Tuesday
                    </div>
                    <div style={{ color: "#0B2A5B", fontSize: "14px", fontWeight: 700 }}>
                      20 October 2026
                    </div>
                  </div>
                </div>
              </section>

              {/* 3x3 Pastel Colored Icon Tile Tabs */}
              <section
                aria-label="Quick Menu Tabs"
                className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5"
              >
                {tiles.map((tile, idx) => {
                  const Icon = tile.icon;
                  return (
                    <Link
                      key={tile.href}
                      href={tile.href}
                      style={{
                        backgroundColor: tile.cardBg,
                        border: `1.5px solid ${tile.cardBorder}`,
                        borderRadius: "20px",
                        minHeight: "146px",
                        padding: "22px 14px 18px",
                        textDecoration: "none",
                      }}
                      className={`tile-tab-card animate-fade-up stagger-${idx + 1} relative flex flex-col items-center justify-center gap-4 group cursor-pointer select-none shadow-2xs`}
                    >
                      {typeof tile.badgeCount === "number" && tile.badgeCount > 0 && (
                        <span
                          style={{
                            backgroundColor: "#DC2626",
                            color: "#FFFFFF",
                          }}
                          className="absolute top-3 right-3 min-w-[24px] h-[24px] px-1.5 rounded-full text-[11.5px] font-bold inline-flex items-center justify-center shadow-xs animate-pulse"
                        >
                          {tile.badgeCount}
                        </span>
                      )}

                      <div
                        style={{
                          width: "58px",
                          height: "58px",
                          borderRadius: "9999px",
                          backgroundColor: tile.circleBg,
                          color: "#FFFFFF",
                          boxShadow: "0 8px 18px -4px rgba(11, 42, 91, 0.2)",
                        }}
                        className="tile-tab-icon flex items-center justify-center"
                      >
                        <Icon className="w-7 h-7" />
                      </div>

                      <div
                        style={{ color: tile.labelColor, fontSize: "15px", fontWeight: 700 }}
                        className="inline-flex items-center justify-center gap-1 text-center leading-snug"
                      >
                        <span>{tile.label}</span>
                        <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </section>

              {/* Mobile Logout */}
              <div className="lg:hidden pt-1 animate-fade-up stagger-9">
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    minHeight: "48px",
                    background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                    color: "#FFFFFF",
                    borderRadius: "14px",
                  }}
                  className="interactive-btn w-full text-[15px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Signature Navy & Flowing Gold Wave Hero Banner */}
              <section
                aria-label="Welcome and Actions"
                style={{
                  background: "linear-gradient(135deg, #031330 0%, #06204E 46%, #0B2A5B 100%)",
                  border: "1.5px solid rgba(226, 181, 68, 0.45)",
                  borderRadius: "24px",
                  boxShadow:
                    "0 22px 50px -10px rgba(11, 42, 91, 0.28), 0 6px 20px rgba(226, 181, 68, 0.16)",
                  padding:
                    "clamp(24px, 3.5vw, 36px) clamp(20px, 4vw, 42px) clamp(30px, 4vw, 38px)",
                  position: "relative",
                }}
                className="overflow-hidden select-none animate-fade-up"
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at 10% 100%, rgba(30, 64, 175, 0.4) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Flowing Multi-Ribbon Gold Waves */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "75px",
                    pointerEvents: "none",
                    zIndex: 0,
                    overflow: "hidden",
                  }}
                >
                  <svg
                    viewBox="0 0 1200 75"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="heroGoldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#C9971C" />
                        <stop offset="18%" stopColor="#F7E6A9" />
                        <stop offset="48%" stopColor="#E2B544" />
                        <stop offset="78%" stopColor="#FFF2BF" />
                        <stop offset="100%" stopColor="#8A6510" />
                      </linearGradient>
                      <linearGradient id="heroGoldHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFF9E3" />
                        <stop offset="50%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#FFE79A" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M-40,48 C200,32 465,65 760,42 C980,26 1140,55 1240,38"
                      stroke="#E2B544"
                      strokeWidth="2"
                      strokeOpacity="0.25"
                      fill="none"
                    />
                    <path
                      d="M-40,55 C220,38 485,70 785,48 C1005,32 1155,62 1240,45"
                      stroke="#DEC797"
                      strokeWidth="2"
                      strokeOpacity="0.38"
                      fill="none"
                    />
                    <path
                      d="M-40,64 C250,44 520,74 830,54 C1040,38 1175,68 1240,52"
                      stroke="url(#heroGoldRibbon)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M-40,64 C250,44 520,74 830,54 C1040,38 1175,68 1240,52"
                      stroke="url(#heroGoldHighlight)"
                      strokeWidth="2"
                      strokeOpacity="0.95"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M-40,70 C270,52 540,76 850,62 C1060,48 1185,73 1240,60"
                      stroke="#E2B544"
                      strokeWidth="2"
                      strokeOpacity="0.4"
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span
                        style={{
                          backgroundColor: "rgba(16, 185, 129, 0.18)",
                          border: "1px solid rgba(52, 211, 153, 0.55)",
                          color: "#A7F3D0",
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "4px 13px",
                          borderRadius: "9999px",
                        }}
                        className="inline-flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                        <span>Hall Operational</span>
                      </span>
                      <span style={{ color: "rgba(226, 181, 68, 0.5)", fontSize: "12px" }}>•</span>
                      <span
                        style={{ color: "#F6EFE2", fontSize: "13px", fontWeight: 500 }}
                        className="flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E2B544]" />
                        <span>Dhari, Gujarat</span>
                      </span>
                    </div>

                    <h1
                      style={{
                        color: "#FFFFFF",
                        fontSize: "clamp(24px, 4vw, 30px)",
                        fontWeight: 700,
                      }}
                      className="leading-tight"
                    >
                      {greetingTime}, <span style={{ color: "#F7E6A9" }}>{userName}</span>
                    </h1>

                    <p
                      style={{ color: "rgba(255, 255, 255, 0.88)", fontSize: "14px", lineHeight: 1.6 }}
                      className="mt-2 max-w-xl"
                    >
                      Overview of community hall bookings, collections, and pending actions today.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-4 shrink-0 w-full sm:w-auto">
                    <Link
                      href="/bookings/new"
                      style={{
                        height: "44px",
                        padding: "0 18px",
                        backgroundColor: "rgba(4, 21, 53, 0.85)",
                        border: "1.5px solid #E2B544",
                        color: "#FFFFFF",
                        borderRadius: "12px",
                        fontSize: "13.5px",
                        fontWeight: 600,
                      }}
                      className="interactive-btn inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 shrink-0 text-[#F7E6A9]" />
                      <span>New Booking</span>
                    </Link>

                    <Link
                      href="/payments"
                      style={{
                        height: "44px",
                        padding: "0 20px",
                        background: "linear-gradient(135deg, #F7E6A9 0%, #E2B544 50%, #C9971C 100%)",
                        border: "1px solid #FFE79A",
                        color: "#041535",
                        borderRadius: "12px",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        boxShadow: "0 4px 16px rgba(201, 151, 28, 0.45)",
                      }}
                      className="interactive-btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <span style={{ fontSize: "15px", fontWeight: 800 }}>₹</span>
                      <span>Record Payment</span>
                    </Link>
                  </div>
                </div>
              </section>

              {/* Three Executive Summary Cards */}
              <SummaryCards onOpenTodoTab={() => setActiveTab("todo")} />
            </div>
          )}

          {activeTab === "todo" && <ActionList />}

          {activeTab === "upcoming" && <ComingUp />}
        </div>
      </div>
    </PageShell>
  );
}
