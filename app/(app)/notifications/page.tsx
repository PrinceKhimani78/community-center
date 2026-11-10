"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckSquare, Bell, Wallet, CalendarDays, Wrench, CheckCheck, ArrowRight } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import ActionList from "@/components/dashboard/ActionList";

type NotifTab = "todo" | "All" | "Money" | "Bookings" | "Repairs";

export default function NotificationsPage() {
  const { notifications, actionCount, markAllNotificationsRead, toggleNotificationRead } =
    useDashboard();
  const [activeTab, setActiveTab] = useState<NotifTab>("todo");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filtered = notifications.filter(
    (n) => activeTab === "All" || n.category === activeTab
  );

  const tabs: TabItem<NotifTab>[] = [
    { id: "todo", label: "To-Do List", icon: CheckSquare, count: actionCount },
    { id: "All", label: "All Alerts", icon: Bell, count: notifications.length },
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
  ];

  return (
    <PageShell
      title="To-Do & Notifications"
      subtitle={`${actionCount} task(s) pending · ${unreadCount} unread alert(s)`}
      rightSlot={
        activeTab !== "todo" && unreadCount > 0 ? (
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
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Notification tabs"
      />

      <div key={activeTab} className="animate-tab-enter space-y-3">
        {activeTab === "todo" ? (
          <ActionList />
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
