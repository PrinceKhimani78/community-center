"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, Wallet, AlertCircle, ArrowRight, Clock } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { INITIAL_TODAY_HALL, INITIAL_MONEY_TO_COLLECT } from "@/lib/mock/dashboard";

export default function SummaryCards() {
  const { actionCount } = useDashboard();
  const today = INITIAL_TODAY_HALL;
  const money = INITIAL_MONEY_TO_COLLECT;

  return (
    <section aria-label="Quick Summary" className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
      {/* 1. Today in the hall (Blue accent) */}
      <Link
        href={`/bookings/${today.receiptNo}`}
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderTop: "3.5px solid #2563EB",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(37, 99, 235, 0.05)",
          textDecoration: "none",
        }}
        className="p-4 sm:p-5 flex flex-col justify-between group cursor-pointer summary-card-blue"
      >
        <div>
          {/* Header row: Icon Badge + Category + Status Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #DBEAFE",
                  color: "#1D4ED8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="group-hover:scale-110 transition-transform"
              >
                <CalendarDays className="w-4 h-4" />
              </div>
              <span
                style={{ color: "#475569", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}
                className="uppercase"
              >
                Today in the Hall
              </span>
            </div>

            <span
              style={{
                backgroundColor: "#DCFCE7",
                color: "#15803D",
                border: "1px solid #BBF7D0",
                padding: "2.5px 8.5px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>{today.status}</span>
            </span>
          </div>

          {/* Event Title */}
          <h3
            style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}
            className="mt-3.5 leading-snug group-hover:text-blue-900 truncate"
          >
            {today.event} · {today.applicant}
          </h3>

          {/* Hall & Time */}
          <div
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              padding: "5px 8px",
              color: "#475569",
              fontSize: "12px",
            }}
            className="flex items-center gap-1.5 mt-2.5 truncate"
          >
            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{today.timing} · {today.hall}</span>
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            borderTop: "1px solid #F1F5F9",
            marginTop: "16px",
            paddingTop: "12px",
          }}
          className="flex items-center justify-between"
        >
          <div className="text-[12px]">
            <span style={{ color: "#64748B" }}>Pending: </span>
            <span style={{ color: "#DC2626", fontWeight: 700 }}>{today.balance}</span>
          </div>
          <span
            style={{ color: "#0B2A5B", fontSize: "12px", fontWeight: 600 }}
            className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>View booking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* 2. Money to collect (Emerald accent) */}
      <Link
        href="/payments"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderTop: "3.5px solid #059669",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(5, 150, 105, 0.05)",
          textDecoration: "none",
        }}
        className="p-4 sm:p-5 flex flex-col justify-between group cursor-pointer summary-card-green"
      >
        <div>
          {/* Header row: Icon Badge + Category + Overdue Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="group-hover:scale-110 transition-transform"
              >
                <Wallet className="w-4 h-4" />
              </div>
              <span
                style={{ color: "#475569", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}
                className="uppercase"
              >
                Money to Collect
              </span>
            </div>

            <span
              style={{
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
                border: "1px solid #FECACA",
                padding: "2.5px 8.5px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {money.overdueCount} Overdue
            </span>
          </div>

          {/* Amount */}
          <div
            style={{
              color: "#0B2A5B",
              fontSize: "28px",
              fontWeight: 800,
              fontFamily: "var(--font-poppins)",
            }}
            className="mt-3 leading-none tracking-tight"
          >
            {money.amount}
          </div>

          {/* Bookings context */}
          <p style={{ color: "#64748B", fontSize: "12.5px" }} className="mt-2 truncate">
            Across {money.bookingCount} pending client bookings
          </p>
        </div>

        {/* Footer row */}
        <div
          style={{
            borderTop: "1px solid #F1F5F9",
            marginTop: "16px",
            paddingTop: "12px",
          }}
          className="flex items-center justify-between"
        >
          <span style={{ color: "#DC2626", fontSize: "12px", fontWeight: 600 }}>
            ● Action required
          </span>
          <span
            style={{ color: "#059669", fontSize: "12px", fontWeight: 700 }}
            className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>Collect ₹</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* 3. Needs your action (Golden Amber accent) */}
      <Link
        href="/notifications"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderTop: "3.5px solid #E2B544",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(226, 181, 68, 0.08)",
          textDecoration: "none",
        }}
        className="p-4 sm:p-5 flex flex-col justify-between group cursor-pointer summary-card-gold"
      >
        <div>
          {/* Header row: Icon Badge + Category + Alert Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#FEF9C3",
                  border: "1px solid #FDE047",
                  color: "#B45309",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="group-hover:scale-110 transition-transform"
              >
                <AlertCircle className="w-4 h-4" />
              </div>
              <span
                style={{ color: "#92400E", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}
                className="uppercase"
              >
                Needs Your Action
              </span>
            </div>

            <span
              style={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                border: "1px solid #FCD34D",
                padding: "2.5px 8.5px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Urgent
            </span>
          </div>

          {/* Action Count */}
          <div
            style={{
              color: "#0B2A5B",
              fontSize: "28px",
              fontWeight: 800,
              fontFamily: "var(--font-poppins)",
            }}
            className="mt-3 leading-none tracking-tight"
          >
            {actionCount} Tasks
          </div>

          {/* Tasks breakdown with mini color dots */}
          <div style={{ fontSize: "12px", color: "#64748B" }} className="mt-2 truncate flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>4 pay</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>1 check</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              <span>1 refund</span>
            </span>
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            borderTop: "1px solid #F1F5F9",
            marginTop: "16px",
            paddingTop: "12px",
          }}
          className="flex items-center justify-between"
        >
          <span style={{ color: "#B45309", fontSize: "12px", fontWeight: 500 }}>
            Resolve from list below
          </span>
          <span
            style={{ color: "#B45309", fontSize: "12px", fontWeight: 700 }}
            className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>Review tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </section>
  );
}
