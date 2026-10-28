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
      {/* 1. Today in the hall */}
      <Link
        href={`/bookings/${today.receiptNo}`}
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E2E8F0",
          borderWidth: "1px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          textDecoration: "none",
        }}
        className="p-4 sm:p-5 flex flex-col justify-between group cursor-pointer transition-all hover:border-[#E2B544] hover:shadow-xs"
      >
        <div>
          {/* Header row: Icon Badge + Category + Status Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  backgroundColor: "#EFF6FF",
                  color: "#1D4ED8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarDays className="w-4 h-4" />
              </div>
              <span
                style={{ color: "#64748B", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}
                className="uppercase"
              >
                Today in the Hall
              </span>
            </div>

            <span
              style={{
                backgroundColor: "#DCFCE7",
                color: "#15803D",
                padding: "2px 8px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {today.status}
            </span>
          </div>

          {/* Event Title */}
          <h3
            style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}
            className="mt-3.5 leading-snug group-hover:text-[#123B7C] truncate"
          >
            {today.event} · {today.applicant}
          </h3>

          {/* Hall & Time */}
          <div
            style={{ color: "#64748B", fontSize: "12.5px" }}
            className="flex items-center gap-1.5 mt-1 truncate"
          >
            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
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
            className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* 2. Money to collect */}
      <Link
        href="/payments"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E2E8F0",
          borderWidth: "1px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          textDecoration: "none",
        }}
        className="p-4 sm:p-5 flex flex-col justify-between group cursor-pointer transition-all hover:border-[#E2B544] hover:shadow-xs"
      >
        <div>
          {/* Header row: Icon Badge + Category + Overdue Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  backgroundColor: "#ECFDF5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wallet className="w-4 h-4" />
              </div>
              <span
                style={{ color: "#64748B", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}
                className="uppercase"
              >
                Money to Collect
              </span>
            </div>

            <span
              style={{
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                padding: "2px 8px",
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
            className="mt-2.5 leading-none tracking-tight"
          >
            {money.amount}
          </div>

          {/* Bookings context */}
          <p style={{ color: "#64748B", fontSize: "12.5px" }} className="mt-1.5 truncate">
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
            style={{ color: "#0B2A5B", fontSize: "12px", fontWeight: 600 }}
            className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Collect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* 3. Needs your action */}
      <Link
        href="/notifications"
        style={{
          backgroundColor: "#FFFDF5",
          borderColor: "#FDE68A",
          borderWidth: "1px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(217, 119, 6, 0.05)",
          textDecoration: "none",
        }}
        className="p-4 sm:p-5 flex flex-col justify-between group cursor-pointer transition-all hover:border-[#E2B544] hover:shadow-xs"
      >
        <div>
          {/* Header row: Icon Badge + Category + Alert Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  backgroundColor: "#FEF3C7",
                  color: "#B45309",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
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
                padding: "2px 8px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid #FCD34D",
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
            className="mt-2.5 leading-none tracking-tight"
          >
            {actionCount} Tasks
          </div>

          {/* Tasks breakdown */}
          <p style={{ color: "#92400E", fontSize: "12.5px" }} className="mt-1.5 truncate">
            4 payments · 1 inspection · 1 refund
          </p>
        </div>

        {/* Footer row */}
        <div
          style={{
            borderTop: "1px solid #FDE68A",
            marginTop: "16px",
            paddingTop: "12px",
          }}
          className="flex items-center justify-between"
        >
          <span style={{ color: "#B45309", fontSize: "12px", fontWeight: 500 }}>
            Resolve from list below
          </span>
          <span
            style={{ color: "#0B2A5B", fontSize: "12px", fontWeight: 600 }}
            className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </section>
  );
}
