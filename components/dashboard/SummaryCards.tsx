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
    <section aria-label="Quick Summary" className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
      {/* 1. Today in the hall */}
      <Link
        href={`/bookings/${today.receiptNo}`}
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid rgba(226, 181, 68, 0.32)",
          borderRadius: "18px",
          boxShadow: "0 10px 28px -4px rgba(11, 42, 91, 0.05), 0 3px 10px rgba(226, 181, 68, 0.07)",
          padding: "24px",
          textDecoration: "none",
        }}
        className="flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-[#E2B544] transition-all duration-200"
      >
        <div>
          {/* Header row: Icon Badge + Category + Status Pill */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  color: "#1D4ED8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="group-hover:scale-105 transition-transform shrink-0"
              >
                <CalendarDays className="w-4 h-4" />
              </div>
              <span
                style={{ color: "#64748B", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.05em" }}
                className="uppercase tracking-wider truncate"
              >
                Today in the Hall
              </span>
            </div>

            <span
              style={{
                backgroundColor: "#DCFCE7",
                color: "#15803D",
                border: "1px solid #BBF7D0",
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "11.5px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
              className="shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>{today.status}</span>
            </span>
          </div>

          {/* Event Title & Applicant */}
          <div className="mt-4">
            <h3
              style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }}
              className="leading-snug group-hover:text-blue-900 transition-colors truncate"
            >
              {today.event}
            </h3>
            <p style={{ color: "#64748B", fontSize: "13px" }} className="mt-0.5 truncate font-medium">
              {today.applicant}
            </p>
          </div>

          {/* Hall & Timing in soft minimal pill */}
          <div
            style={{
              backgroundColor: "#FAF6EF",
              border: "1px solid rgba(226, 181, 68, 0.25)",
              borderRadius: "8px",
              padding: "7px 10px",
              color: "#475569",
              fontSize: "12px",
            }}
            className="flex items-center gap-2 mt-3.5"
          >
            <Clock className="w-3.5 h-3.5 shrink-0 text-[#C9971C]" />
            <span className="truncate">{today.timing} · {today.hall}</span>
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            borderTop: "1px solid #F1ECE1",
            marginTop: "18px",
            paddingTop: "14px",
          }}
          className="flex items-center justify-between"
        >
          <div className="text-[12.5px]">
            <span style={{ color: "#78716C" }}>Pending: </span>
            <span style={{ color: "#DC2626", fontWeight: 700 }}>{today.balance}</span>
          </div>
          <span
            style={{ color: "#0B2A5B", fontSize: "12.5px", fontWeight: 600 }}
            className="flex items-center gap-1 group-hover:translate-x-1 group-hover:text-[#C9971C] transition-all"
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
          border: "1.5px solid rgba(226, 181, 68, 0.32)",
          borderRadius: "18px",
          boxShadow: "0 10px 28px -4px rgba(11, 42, 91, 0.05), 0 3px 10px rgba(226, 181, 68, 0.07)",
          padding: "24px",
          textDecoration: "none",
        }}
        className="flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-[#E2B544] transition-all duration-200"
      >
        <div>
          {/* Header row: Icon Badge + Category + Overdue Pill */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="group-hover:scale-105 transition-transform shrink-0"
              >
                <Wallet className="w-4 h-4" />
              </div>
              <span
                style={{ color: "#64748B", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.05em" }}
                className="uppercase tracking-wider truncate"
              >
                Money to Collect
              </span>
            </div>

            <span
              style={{
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
                border: "1px solid #FECACA",
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "11.5px",
                fontWeight: 600,
              }}
              className="shrink-0"
            >
              {money.overdueCount} Overdue
            </span>
          </div>

          {/* Amount */}
          <div className="mt-4">
            <div
              style={{
                color: "#0B2A5B",
                fontSize: "30px",
                fontWeight: 800,
                fontFamily: "var(--font-poppins)",
              }}
              className="leading-none tracking-tight flex items-baseline gap-1"
            >
              <span>{money.amount}</span>
            </div>
            <p style={{ color: "#64748B", fontSize: "13px" }} className="mt-2 truncate font-medium">
              Across {money.bookingCount} pending client bookings
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            borderTop: "1px solid #F1ECE1",
            marginTop: "18px",
            paddingTop: "14px",
          }}
          className="flex items-center justify-between"
        >
          <span
            style={{
              backgroundColor: "#FFF1F2",
              color: "#BE123C",
              border: "1px solid #FFE4E6",
              padding: "3px 9px",
              borderRadius: "9999px",
              fontSize: "11.5px",
              fontWeight: 600,
            }}
            className="flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
            <span>Action required</span>
          </span>
          <span
            style={{ color: "#059669", fontSize: "12.5px", fontWeight: 700 }}
            className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
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
          backgroundColor: "#FFFFFF",
          border: "1.5px solid rgba(226, 181, 68, 0.32)",
          borderRadius: "18px",
          boxShadow: "0 10px 28px -4px rgba(11, 42, 91, 0.05), 0 3px 10px rgba(226, 181, 68, 0.07)",
          padding: "24px",
          textDecoration: "none",
        }}
        className="flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-[#E2B544] transition-all duration-200"
      >
        <div>
          {/* Header row: Icon Badge + Category + Alert Pill */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#FEF9C3",
                  border: "1px solid #FDE047",
                  color: "#B45309",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="group-hover:scale-105 transition-transform shrink-0"
              >
                <AlertCircle className="w-4 h-4" />
              </div>
              <span
                style={{ color: "#92400E", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.05em" }}
                className="uppercase tracking-wider truncate"
              >
                Needs Your Action
              </span>
            </div>

            <span
              style={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                border: "1px solid #FCD34D",
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "11.5px",
                fontWeight: 600,
              }}
              className="shrink-0"
            >
              Urgent
            </span>
          </div>

          {/* Action Count */}
          <div className="mt-4">
            <div
              style={{
                color: "#0B2A5B",
                fontSize: "30px",
                fontWeight: 800,
                fontFamily: "var(--font-poppins)",
              }}
              className="leading-none tracking-tight"
            >
              {actionCount} Tasks
            </div>

            {/* Tasks breakdown with clean spaced mini chips */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span
                style={{
                  backgroundColor: "#FFF1F2",
                  color: "#BE123C",
                  border: "1px solid #FFE4E6",
                  padding: "2px 7px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                }}
              >
                4 payments
              </span>
              <span
                style={{
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  border: "1px solid #FDE68A",
                  padding: "2px 7px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                }}
              >
                1 inspection
              </span>
              <span
                style={{
                  backgroundColor: "#EFF6FF",
                  color: "#1D4ED8",
                  border: "1px solid #DBEAFE",
                  padding: "2px 7px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                }}
              >
                1 refund
              </span>
            </div>
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            borderTop: "1px solid #F1ECE1",
            marginTop: "18px",
            paddingTop: "14px",
          }}
          className="flex items-center justify-between"
        >
          <span style={{ color: "#92400E", fontSize: "12.5px", fontWeight: 500 }}>
            Resolve from list below
          </span>
          <span
            style={{ color: "#B45309", fontSize: "12.5px", fontWeight: 700 }}
            className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </section>
  );
}

