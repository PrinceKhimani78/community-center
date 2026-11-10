"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus, Search, ArrowRight } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import StatusBadge from "@/components/common/StatusBadge";
import NewBookingForm from "@/components/features/NewBookingForm";

type BookingsTab = "list" | "new";

export default function BookingsPage() {
  const { bookings } = useDashboard();
  const [activeTab, setActiveTab] = useState<BookingsTab>("list");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  const tabs: TabItem<BookingsTab>[] = [
    { id: "list", label: "All Bookings", icon: CalendarDays, count: bookings.length },
    { id: "new", label: "New Booking", icon: Plus },
  ];

  const statuses = ["All", "Confirmed", "Pending", "Awaiting approval", "Completed"];

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      b.eventTitle.toLowerCase().includes(q) ||
      b.applicantName.toLowerCase().includes(q) ||
      b.receiptNo.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <PageShell
      title="Bookings"
      subtitle="View hall bookings or create a new booking step by step."
    >
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Bookings sections" />

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "list" ? (
          <div className="space-y-4">
            {/* Simple Filter & Search Bar */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid rgba(226, 181, 68, 0.32)",
                borderRadius: "16px",
                padding: "16px",
              }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#5B6474] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, event, mobile, or #"
                  style={{ minHeight: "42px" }}
                  className="w-full pl-10 pr-4 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3.5 py-2 rounded-xl text-[12.5px] font-semibold cursor-pointer transition-all ${
                      statusFilter === s
                        ? "bg-[#0B2A5B] text-white shadow-xs"
                        : "bg-[#FAF5EB] text-[#14213D] border border-[#EFE4CC] hover:border-[#E2B544]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Booking Cards */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#EFE4CC] p-10 text-center text-[#5B6474]">
                  No bookings match your search.
                </div>
              ) : (
                filtered.map((b, idx) => {
                  const balance = Math.max(0, b.rent + b.deposit - b.paid);
                  return (
                    <div
                      key={b.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1.5px solid rgba(226, 181, 68, 0.28)",
                        borderRadius: "16px",
                        padding: "16px 20px",
                        animationDelay: `${idx * 35}ms`,
                      }}
                      className="interactive-row animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC]">
                            #{b.receiptNo}
                          </span>
                          <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                            {b.eventTitle}
                          </h3>
                          <StatusBadge status={b.status} />
                        </div>
                        <p style={{ color: "#5B6474", fontSize: "13.5px" }}>
                          <strong>{b.applicantName}</strong> · {b.dateLabel} · {b.hall}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="text-left sm:text-right mr-2">
                          <div className="text-[11.5px] text-[#5B6474]">Balance Left</div>
                          <div
                            className={`text-[15px] font-extrabold ${
                              balance > 0 ? "text-[#C62828]" : "text-[#15803D]"
                            }`}
                          >
                            {b.isFreeUse ? "Free Use" : `₹${balance.toLocaleString("en-IN")}`}
                          </div>
                        </div>

                        <Link
                          href={`/bookings/${b.receiptNo}`}
                          style={{
                            minHeight: "42px",
                            background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                            color: "#FFFFFF",
                            borderRadius: "10px",
                          }}
                          className="interactive-btn px-4 py-2 text-[13px] font-semibold inline-flex items-center gap-1.5"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <NewBookingForm />
        )}
      </div>
    </PageShell>
  );
}
