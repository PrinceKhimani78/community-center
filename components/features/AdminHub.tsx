"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  BarChart3,
  Users,
  History,
  Check,
  X,
  Printer,
  Download,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import StatusBadge from "@/components/common/StatusBadge";

export type AdminTab = "approvals" | "reports" | "users" | "audit";

export default function AdminHub({
  initialTab = "approvals",
  title = "Admin Settings",
  subtitle = "Approve requests, view simple reports, manage staff users, and check activity.",
}: {
  initialTab?: AdminTab;
  title?: string;
  subtitle?: string;
}) {
  const {
    approvals,
    decideApproval,
    bookings,
    payments,
    expenses,
    users,
    toggleUserActive,
    auditLogs,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [reportCategory, setReportCategory] = useState<"Bookings" | "Money">("Bookings");

  const pendingApprovals = approvals.filter((a) => a.status === "Pending").length;
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const tabs: TabItem<AdminTab>[] = [
    { id: "approvals", label: "Approvals", icon: CheckSquare, count: pendingApprovals },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "users", label: "Users & Roles", icon: Users, count: users.length },
    { id: "audit", label: "Activity Log", icon: History, count: auditLogs.length },
  ];

  const handleExportCSV = () => {
    const rows = [
      ["Receipt", "Event", "Applicant", "Hall", "Date", "Rent", "Paid", "Status"],
      ...bookings.map((b) => [
        b.receiptNo,
        b.eventTitle,
        b.applicantName,
        b.hall,
        b.dateLabel,
        String(b.rent),
        String(b.paid),
        b.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "community-centre-bookings.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell title={title} subtitle={subtitle}>
      <div className="no-print">
        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Admin tabs" />
      </div>

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "approvals" && (
          <div className="space-y-3">
            {approvals.map((item) => (
              <div
                key={item.id}
                className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EB] border border-[#EFE4CC] text-[#0B2A5B]">
                      {item.type}
                    </span>
                    <h3 className="font-bold text-[#0B2A5B] text-[15.5px]">{item.title}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-[13px] text-[#5B6474]">{item.detail}</p>
                  <p className="text-[13px] font-bold text-[#0B2A5B]">
                    Amount: {item.amountLabel} · Requested by {item.requester}
                  </p>
                </div>

                {item.status === "Pending" && (
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => decideApproval(item.id, "Approved")}
                      style={{ minHeight: "42px" }}
                      className="interactive-btn px-4 py-2 rounded-xl bg-[#15803D] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => decideApproval(item.id, "Rejected")}
                      style={{ minHeight: "42px" }}
                      className="interactive-btn px-4 py-2 rounded-xl bg-white border border-red-300 text-[#C62828] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="interactive-card bg-white rounded-2xl border border-[#EFE4CC] p-5">
                <div className="text-[12.5px] text-[#5B6474] font-semibold">Total Bookings</div>
                <div className="text-[28px] font-extrabold text-[#0B2A5B] mt-1">
                  {bookings.length}
                </div>
              </div>
              <div className="interactive-card bg-white rounded-2xl border border-[#EFE4CC] p-5">
                <div className="text-[12.5px] text-[#5B6474] font-semibold">Money Collected</div>
                <div className="text-[28px] font-extrabold text-[#15803D] mt-1">
                  ₹{totalCollected.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="interactive-card bg-white rounded-2xl border border-[#EFE4CC] p-5">
                <div className="text-[12.5px] text-[#5B6474] font-semibold">Total Expenses</div>
                <div className="text-[28px] font-extrabold text-[#C62828] mt-1">
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {(["Bookings", "Money"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setReportCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-semibold cursor-pointer ${
                        reportCategory === cat
                          ? "bg-[#0B2A5B] text-white"
                          : "bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC]"
                      }`}
                    >
                      {cat} Summary
                    </button>
                  ))}
                </div>

                <div className="no-print flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{ minHeight: "40px" }}
                    className="interactive-btn px-3.5 py-2 rounded-xl bg-[#FAF5EB] border border-[#E2B544] text-[#0B2A5B] text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    style={{ minHeight: "40px" }}
                    className="interactive-btn px-3.5 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Excel CSV</span>
                  </button>
                </div>
              </div>

              {reportCategory === "Bookings" ? (
                <div className="space-y-2.5">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] flex flex-wrap justify-between gap-2 text-[13.5px]"
                    >
                      <span>
                        <strong>#{b.receiptNo}</strong> · {b.eventTitle} ({b.applicantName})
                      </span>
                      <span className="font-bold text-[#0B2A5B]">
                        Paid ₹{b.paid.toLocaleString("en-IN")} / ₹
                        {(b.rent + b.deposit).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] flex flex-wrap justify-between gap-2 text-[13.5px]"
                    >
                      <span>
                        <strong>{p.receiptNo}</strong> · {p.applicantName} ({p.mode})
                      </span>
                      <span className="font-bold text-[#15803D]">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0B2A5B] text-[15px]">{u.name}</span>
                    <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EB] border border-[#EFE4CC] text-[#0B2A5B]">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#5B6474] mt-0.5">
                    User ID: <strong>{u.userId}</strong> · Last login: {u.lastLogin}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleUserActive(u.id)}
                  style={{ minHeight: "40px" }}
                  className={`interactive-btn px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer ${
                    u.active
                      ? "bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]"
                      : "bg-[#FEE2E2] text-[#C62828] border border-[#FECACA]"
                  }`}
                >
                  {u.active ? "Active (Tap to Disable)" : "Disabled (Tap to Enable)"}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-[#0B2A5B] text-[14.5px]">{log.action}</div>
                  <div className="text-[13px] text-[#5B6474]">{log.detail}</div>
                </div>
                <div className="text-right text-[12px] text-[#78716C]">
                  <div className="font-semibold text-[#0B2A5B]">{log.userLabel}</div>
                  <div>{log.timeLabel}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

