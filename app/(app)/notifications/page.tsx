"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Bell,
  Wallet,
  CalendarDays,
  Wrench,
  CheckCheck,
  ArrowRight,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import ActionList from "@/components/dashboard/ActionList";

type NotifTab = "todo" | "All" | "Attendance" | "Money" | "Bookings" | "Repairs";

export default function NotificationsPage() {
  const {
    role,
    notifications,
    actionCount,
    unreadAlertCount,
    markAllNotificationsRead,
    toggleNotificationRead,
  } = useDashboard();
  const isAdmin = role === "admin";
  const [selectedTab, setSelectedTab] = useState<NotifTab | null>(null);
  const activeTab: NotifTab = isAdmin ? (selectedTab ?? "All") : "todo";

  const filtered = notifications.filter(
    (n) => activeTab === "All" || n.category === activeTab
  );

  const tabs: TabItem<NotifTab>[] = isAdmin
    ? [
        { id: "All", label: "All Alerts", icon: Bell, count: notifications.length },
        {
          id: "Attendance",
          label: "Geo-fence & Attendance",
          icon: MapPin,
          count: notifications.filter((n) => n.category === "Attendance").length,
        },
        {
          id: "Money",
          label: "Money",
          icon: Wallet,
          count: notifications.filter((n) => n.category === "Money").length,
        },
        {
          id: "Bookings",
          label: "Bookings",
          icon: CalendarDays,
          count: notifications.filter((n) => n.category === "Bookings").length,
        },
        {
          id: "Repairs",
          label: "Repairs",
          icon: Wrench,
          count: notifications.filter((n) => n.category === "Repairs").length,
        },
        { id: "todo", label: "To-Do List", icon: CheckSquare, count: actionCount },
      ]
    : [{ id: "todo", label: "To-Do List", icon: CheckSquare, count: actionCount }];

  return (
    <PageShell
      title={isAdmin ? "Admin Alerts & To-Do" : "To-Do List"}
      subtitle={
        isAdmin
          ? `${unreadAlertCount} unread alert(s) · ${actionCount} task(s) pending`
          : `${actionCount} task(s) pending · System & geo-fence alerts go directly to Admin`
      }
      rightSlot={
        isAdmin && activeTab !== "todo" && unreadAlertCount > 0 ? (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            style={{ minHeight: "42px" }}
            className="interactive-btn px-4 py-2 rounded-xl bg-white border border-[#E2B544] text-[#0B2A5B] text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#15803D]" />
            <span>Mark All Read</span>
          </button>
        ) : undefined
      }
    >
      {!isAdmin && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE4CC] text-[13px] text-[#0B2A5B] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#C9971C] shrink-0" />
          <span>
            All alerts (Geo-fence violations, attendance check-ins, payment alerts, bookings &amp; repairs) are delivered to <strong>Admin</strong>.
          </span>
        </div>
      )}

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={setSelectedTab}
        ariaLabel="Notification tabs"
      />

      <div key={activeTab} className="animate-tab-enter space-y-3">
        {activeTab === "todo" ? (
          <ActionList />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-8 text-center text-[13.5px] text-[#5B6474]">
            No alerts in this category yet.
          </div>
        ) : (
          filtered.map((n, idx) => (
            <div
              key={n.id}
              style={{
                backgroundColor: n.unread ? "#FFFFFF" : "#FAF7F2",
                border: n.unread
                  ? "1.5px solid rgba(226, 181, 68, 0.55)"
                  : "1px solid #EFE4CC",
                borderRadius: "16px",
                padding: "16px 20px",
                animationDelay: `${idx * 35}ms`,
              }}
              className="interactive-row animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    n.unread ? "bg-[#C9971C] animate-pulse" : "bg-slate-300"
                  }`}
                />
                <div>
                  <h3 className="font-bold text-[#0B2A5B] text-[15px]">{n.title}</h3>
                  <p className="text-[13.5px] text-[#5B6474] mt-0.5">{n.detail}</p>
                  <span className="text-[11.5px] text-[#78716C] mt-1 inline-block">
                    {n.category} · {n.timeLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleNotificationRead(n.id)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#FAF5EB] border border-[#EFE4CC] text-[#0B2A5B] cursor-pointer hover:border-[#E2B544]"
                >
                  {n.unread ? "Mark Read" : "Unread"}
                </button>
                <Link
                  href={n.href}
                  style={{ minHeight: "40px" }}
                  className="interactive-btn px-3.5 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold inline-flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
