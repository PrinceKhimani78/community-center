"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Download, Filter, Plus, Search } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import type { BookingStatus } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import StatusBadge from "@/components/common/StatusBadge";
import {
  HALL_OPTIONS,
  REFERENCE_TODAY_ISO,
  countBookingDays,
  exportBookingsCsv,
  formatBookingCode,
  formatWeekdayDate,
  getBookingBalance,
  getDayMonthParts,
  isDateInRange,
} from "@/lib/utils/bookings";

const STATUS_TABS: Array<{ id: "All" | BookingStatus; label: string }> = [
  { id: "All", label: "All" },
  { id: "Confirmed", label: "Confirmed" },
  { id: "Pending", label: "Pending" },
  { id: "Awaiting approval", label: "Awaiting approval" },
  { id: "Completed", label: "Completed" },
  { id: "Cancelled", label: "Cancelled" },
];

type MobileSegment = "Upcoming" | "Today" | "Past" | "Cancelled";

const PAGE_SIZE = 6;

export default function BookingsPage() {
  const { bookings } = useDashboard();

  const [query, setQuery] = useState("");
  const [hallFilter, setHallFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"All" | BookingStatus>("All");
  const [page, setPage] = useState(1);

  // Mobile state
  const [mobileSegment, setMobileSegment] = useState<MobileSegment>("Upcoming");
  const [showMobileDateFilter, setShowMobileDateFilter] = useState(false);

  const baseSearchFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesHall = hallFilter === "All" || b.hall === hallFilter;
      const matchesFrom = !fromDate || (b.endDateISO || b.dateISO) >= fromDate;
      const matchesTo = !toDate || b.dateISO <= toDate;
      const code = formatBookingCode(b.receiptNo).toLowerCase();
      const matchesQuery =
        !q ||
        b.eventTitle.toLowerCase().includes(q) ||
        b.applicantName.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.receiptNo.toLowerCase().includes(q) ||
        code.includes(q);
      return matchesHall && matchesFrom && matchesTo && matchesQuery;
    });
  }, [bookings, query, hallFilter, fromDate, toDate]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: baseSearchFiltered.length };
    for (const tab of STATUS_TABS) {
      if (tab.id !== "All") {
        counts[tab.id] = baseSearchFiltered.filter((b) => b.status === tab.id).length;
      }
    }
    return counts;
  }, [baseSearchFiltered]);

  const desktopFiltered = useMemo(() => {
    if (statusFilter === "All") return baseSearchFiltered;
    return baseSearchFiltered.filter((b) => b.status === statusFilter);
  }, [baseSearchFiltered, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(desktopFiltered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = desktopFiltered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const mobileFiltered = useMemo(() => {
    return baseSearchFiltered.filter((b) => {
      if (mobileSegment === "Cancelled") return b.status === "Cancelled";
      if (b.status === "Cancelled") return false;
      if (mobileSegment === "Today") {
        return isDateInRange(REFERENCE_TODAY_ISO, b.dateISO, b.endDateISO);
      }
      if (mobileSegment === "Past") {
        return (b.endDateISO || b.dateISO) < REFERENCE_TODAY_ISO || b.status === "Completed";
      }
      return (b.endDateISO || b.dateISO) >= REFERENCE_TODAY_ISO && b.status !== "Completed";
    });
  }, [baseSearchFiltered, mobileSegment]);

  const resetPage = () => setPage(1);

  return (
    <PageShell hideHeader>
      <div className="space-y-4">
        {/* MOBILE HEADER & CONTROLS (matches 5.6) */}
        <div className="md:hidden space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h1 style={{ color: "#0B2A5B", fontSize: "22px", fontWeight: 700 }}>Bookings</h1>
            <Link
              href="/bookings/new"
              style={{
                minHeight: "40px",
                background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                color: "#FFFFFF",
                borderRadius: "10px",
              }}
              className="interactive-btn px-3.5 py-2 text-[13px] font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-xl border border-[#EFE4CC] px-3 py-1.5">
            <Search className="w-4 h-4 text-[#5B6474] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPage();
              }}
              placeholder="Search event, customer name or ID"
              className="flex-1 bg-transparent py-1.5 text-[13.5px] text-[#14213D] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowMobileDateFilter((v) => !v)}
              className={`p-1.5 rounded-lg cursor-pointer ${
                showMobileDateFilter || fromDate || toDate
                  ? "bg-[#0B2A5B] text-white"
                  : "text-[#0B2A5B] hover:bg-[#FAF5EB]"
              }`}
              aria-label="Toggle date filter"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {showMobileDateFilter && (
            <div className="bg-white rounded-xl border border-[#EFE4CC] p-3 grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#5B6474] mb-1">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[#E5D9BF] bg-[#FAF7F2] px-2 text-[12.5px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5B6474] mb-1">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[#E5D9BF] bg-[#FAF7F2] px-2 text-[12.5px]"
                />
              </div>
            </div>
          )}

          {/* Segmented Tabs */}
          <div className="bg-white rounded-xl border border-[#EFE4CC] p-1 grid grid-cols-4 gap-1">
            {(["Upcoming", "Today", "Past", "Cancelled"] as const).map((seg) => (
              <button
                key={seg}
                type="button"
                onClick={() => setMobileSegment(seg)}
                className={`py-2 rounded-lg text-[12.5px] font-bold cursor-pointer transition-all ${
                  mobileSegment === seg
                    ? "bg-[#0B2A5B] text-white shadow-xs"
                    : "text-[#14213D] hover:bg-[#FAF5EB]"
                }`}
              >
                {seg}
              </button>
            ))}
          </div>

          {/* Hall Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#5B6474] shrink-0 mr-0.5">Hall:</span>
            {["All", ...HALL_OPTIONS].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHallFilter(h)}
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap cursor-pointer border transition-all ${
                  hallFilter === h
                    ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                    : "bg-white text-[#14213D] border-[#EFE4CC]"
                }`}
              >
                {h === "Ground + First Floor" ? "Ground + 1st" : h}
              </button>
            ))}
          </div>

          {/* Mobile Booking Cards */}
          <div className="space-y-3">
            {mobileFiltered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-8 text-center text-[13.5px] text-[#5B6474]">
                No bookings in this view.
              </div>
            ) : (
              mobileFiltered.map((b) => {
                const { day, month } = getDayMonthParts(b.dateISO);
                const days = countBookingDays(b.dateISO, b.endDateISO);
                return (
                  <Link
                    key={b.id}
                    href={`/bookings/${b.receiptNo}`}
                    className="interactive-row block bg-white rounded-2xl border border-[#EFE4CC] p-3.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF5EB] border border-[#EFE4CC] flex flex-col items-center justify-center shrink-0">
                          <span className="text-[16px] font-extrabold text-[#0B2A5B] leading-none">
                            {day}
                          </span>
                          <span className="text-[10px] font-bold text-[#5B6474] mt-0.5">
                            {month}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#0B2A5B] text-[15px] truncate">
                            {b.eventTitle}
                          </div>
                          <div className="text-[12.5px] text-[#5B6474] truncate">
                            {b.applicantName}
                          </div>
                          <div className="text-[11.5px] text-[#5B6474] truncate mt-0.5">
                            {days > 1 ? `${b.dateLabel} · ${days} days` : b.timing} · {b.hall}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={b.status} />
                        <span className="text-[14px] font-extrabold text-[#0B2A5B]">
                          {b.isFreeUse ? "₹0 · Free" : `₹${b.rent.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* DESKTOP VIEW (matches 4.4) */}
        <div className="hidden md:block space-y-4">
          {/* Top Heading Row */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-medium text-[#5B6474]">Bookings · All bookings</div>
              <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>Bookings</h1>
            </div>
          </div>

          {/* Search + Hall + Date Range + Export + New Booking Toolbar */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #EFE4CC",
              borderRadius: "16px",
              padding: "12px 14px",
            }}
            className="flex flex-wrap items-center gap-2.5"
          >
            <div className="relative flex-1 min-w-[230px]">
              <Search className="w-4 h-4 text-[#5B6474] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetPage();
                }}
                placeholder="Search by event, customer, phone or booking ID"
                style={{ minHeight: "42px" }}
                className="w-full pl-10 pr-3.5 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13px] text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <select
              value={hallFilter}
              onChange={(e) => {
                setHallFilter(e.target.value);
                resetPage();
              }}
              style={{ minHeight: "42px" }}
              aria-label="Filter by hall"
              className="rounded-xl border border-[#E5D9BF] bg-white px-3 text-[13px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
            >
              <option value="All">All Halls</option>
              {HALL_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 rounded-xl border border-[#E5D9BF] bg-white px-2.5 h-[42px] text-[12.5px]">
              <Calendar className="w-3.5 h-3.5 text-[#C9971C] shrink-0" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  resetPage();
                }}
                aria-label="From date"
                className="bg-transparent text-[#0B2A5B] font-medium focus:outline-none"
              />
              <span className="text-[#5B6474]">–</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  resetPage();
                }}
                aria-label="To date"
                className="bg-transparent text-[#0B2A5B] font-medium focus:outline-none"
              />
              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    resetPage();
                  }}
                  className="text-[11px] font-bold text-[#C62828] ml-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => exportBookingsCsv(desktopFiltered)}
              style={{ minHeight: "42px" }}
              className="interactive-btn px-3.5 py-2 rounded-xl bg-white border border-[#0B2A5B]/30 text-[#0B2A5B] text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <Link
              href="/bookings/new"
              style={{
                minHeight: "42px",
                background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                color: "#FFFFFF",
                borderRadius: "10px",
              }}
              className="interactive-btn px-4 py-2 text-[13px] font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </Link>
          </div>

          {/* Status Filter Pills with Counts */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              const count = statusCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    resetPage();
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold cursor-pointer border transition-all ${
                    active
                      ? "bg-[#0B2A5B] text-white border-[#0B2A5B] shadow-xs"
                      : "bg-white text-[#14213D] border-[#EFE4CC] hover:border-[#E2B544]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center ${
                      active ? "bg-[#E2B544] text-[#041535]" : "bg-[#FAF5EB] text-[#0B2A5B]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bookings Table Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #EFE4CC",
              borderRadius: "18px",
            }}
            className="overflow-hidden shadow-2xs"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="border-b border-[#F1ECE1] bg-[#FAF7F2]/70 text-[12px] font-semibold text-[#5B6474]">
                    <th className="py-3.5 px-5">Booking</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Hall</th>
                    <th className="py-3.5 px-4">Rent</th>
                    <th className="py-3.5 px-4">Balance</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1ECE1] text-[13.5px]">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#5B6474]">
                        No bookings match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((b) => {
                      const balance = getBookingBalance(b);
                      const days = countBookingDays(b.dateISO, b.endDateISO);

                      return (
                        <tr key={b.id} className="hover:bg-[#FAF7F2]/70 transition-colors">
                          <td className="py-3.5 px-5">
                            <Link
                              href={`/bookings/${b.receiptNo}`}
                              className="font-bold text-[#0B2A5B] hover:text-[#C9971C] block"
                            >
                              {b.eventTitle}
                            </Link>
                            <span className="notranslate text-[11.5px] text-[#5B6474]">
                              {formatBookingCode(b.receiptNo)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#14213D]">{b.applicantName}</div>
                            <div className="notranslate text-[12px] text-[#5B6474]">{b.phone}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#14213D]">
                              {days > 1
                                ? `${b.dateLabel} · ${days} days`
                                : formatWeekdayDate(b.dateISO)}
                            </div>
                            <div className="text-[12px] text-[#5B6474]">{b.timing}</div>
                          </td>

                          <td className="py-3.5 px-4 text-[#14213D] font-medium">
                            {b.hall}
                            {b.isAC ? (
                              <span className="ml-1.5 text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8]">
                                A.C.
                              </span>
                            ) : null}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-[#0B2A5B]">
                            {b.isFreeUse ? "Free" : `₹${b.rent.toLocaleString("en-IN")}`}
                          </td>

                          <td className="py-3.5 px-4 font-bold">
                            {b.isFreeUse ? (
                              <span className="text-[#15803D]">—</span>
                            ) : b.status === "Cancelled" ? (
                              <span className="text-[#15803D]">
                                {b.depositStatus === "Refunded" ? "Refunded" : "Cancelled"}
                              </span>
                            ) : balance > 0 ? (
                              <span className="text-[#C62828]">
                                ₹{balance.toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-[#15803D]">₹0</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <StatusBadge status={b.status} />
                          </td>

                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-3 text-[13px] font-bold">
                              <Link
                                href={`/bookings/${b.receiptNo}`}
                                className="text-[#0B2A5B] hover:text-[#C9971C]"
                              >
                                View
                              </Link>
                              <Link
                                href={`/bookings/new?edit=${b.receiptNo}`}
                                className="text-[#0B2A5B] hover:text-[#C9971C]"
                              >
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-[#F1ECE1] text-[12.5px] text-[#5B6474]">
              <span>
                Showing{" "}
                {desktopFiltered.length === 0
                  ? 0
                  : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                      safePage * PAGE_SIZE,
                      desktopFiltered.length
                    )}`}{" "}
                of {desktopFiltered.length} bookings
              </span>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-[12.5px] font-bold cursor-pointer transition-colors ${
                      safePage === pageNum
                        ? "bg-[#0B2A5B] text-white"
                        : "bg-white border border-[#EFE4CC] text-[#0B2A5B] hover:border-[#E2B544]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
