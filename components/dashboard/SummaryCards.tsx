"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, Wallet, AlertCircle, ArrowRight, Clock } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";

interface SummaryCardsProps {
  onOpenTodoTab?: () => void;
}

export default function SummaryCards({ onOpenTodoTab }: SummaryCardsProps) {
  const { actionCount, actionItems, bookings } = useDashboard();

  const todayBooking = bookings.find((b) => b.dateISO === "2026-10-20") || bookings[0];
  const pendingBalances = bookings.filter(
    (b) => b.status !== "Cancelled" && !b.isFreeUse && b.rent + b.deposit - b.paid > 0
  );
  const totalCollect = pendingBalances.reduce(
    (sum, b) => sum + Math.max(0, b.rent + b.deposit - b.paid),
    0
  );

  const todayTotalDue = todayBooking
    ? Math.max(0, todayBooking.rent + todayBooking.deposit - todayBooking.paid)
    : 9500;

  const payTasks = actionItems.filter((i) => i.tag === "PAY").length;
  const insTasks = actionItems.filter((i) => i.tag === "INS").length;
  const refTasks = actionItems.filter((i) => i.tag === "REF").length;

  return (
    <section aria-label="Quick Summary" className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
      {/* 1. TODAY IN THE HALL */}
      <Link
        href={`/bookings/${todayBooking?.receiptNo || "1048"}`}
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid rgba(226, 181, 68, 0.35)",
          borderRadius: "18px",
          boxShadow: "0 10px 28px -4px rgba(11, 42, 91, 0.06), 0 3px 10px rgba(226, 181, 68, 0.08)",
          padding: "22px",
          textDecoration: "none",
        }}
        className="interactive-card animate-fade-up stagger-1 flex flex-col justify-between group cursor-pointer"
      >
        <div>
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
                }}
                className="flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"
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
              }}
              className="inline-flex items-center gap-1.5 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Confirmed</span>
            </span>
          </div>

          <div className="mt-4">
            <h3
              style={{ color: "#0B2A5B", fontSize: "18px", fontWeight: 700 }}
              className="leading-snug truncate"
            >
              {todayBooking?.applicantName || "Mr. Imran Patel"}
            </h3>
            <p style={{ color: "#64748B", fontSize: "13px" }} className="mt-0.5 truncate font-medium">
              {todayBooking?.eventTitle || "Wedding"}
            </p>
          </div>

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
            <span className="truncate">
              {todayBooking?.timing} · {todayBooking?.hall}
            </span>
          </div>
        </div>

        <div
          style={{ borderTop: "1px solid #F1ECE1", marginTop: "18px", paddingTop: "13px" }}
          className="flex items-center justify-between"
        >
          <div className="text-[12.5px]">
            <span style={{ color: "#78716C" }}>Pending: </span>
            <span style={{ color: "#DC2626", fontWeight: 700 }}>
              ₹{todayTotalDue.toLocaleString("en-IN")} balance
            </span>
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

      {/* 2. MONEY TO COLLECT */}
      <Link
        href="/payments"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid rgba(226, 181, 68, 0.35)",
          borderRadius: "18px",
          boxShadow: "0 10px 28px -4px rgba(11, 42, 91, 0.06), 0 3px 10px rgba(226, 181, 68, 0.08)",
          padding: "22px",
          textDecoration: "none",
        }}
        className="interactive-card animate-fade-up stagger-2 flex flex-col justify-between group cursor-pointer"
      >
        <div>
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
                }}
                className="flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"
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
              1 Overdue
            </span>
          </div>

          <div className="mt-4">
            <div
              style={{ color: "#0B2A5B", fontSize: "30px", fontWeight: 800 }}
              className="leading-none tracking-tight"
            >
              ₹{totalCollect.toLocaleString("en-IN")}
            </div>
            <p style={{ color: "#64748B", fontSize: "13px" }} className="mt-2 truncate font-medium">
              Across {pendingBalances.length} pending client bookings
            </p>
          </div>
        </div>

        <div
          style={{ borderTop: "1px solid #F1ECE1", marginTop: "18px", paddingTop: "13px" }}
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
            className="inline-flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
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

      {/* 3. NEEDS YOUR ACTION */}
      <button
        type="button"
        onClick={onOpenTodoTab}
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid rgba(226, 181, 68, 0.35)",
          borderRadius: "18px",
          boxShadow: "0 10px 28px -4px rgba(11, 42, 91, 0.06), 0 3px 10px rgba(226, 181, 68, 0.08)",
          padding: "22px",
          textAlign: "left",
        }}
        className="interactive-card animate-fade-up stagger-3 flex flex-col justify-between group cursor-pointer w-full"
      >
        <div>
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
                }}
                className="flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"
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

          <div className="mt-4">
            <div
              style={{ color: "#0B2A5B", fontSize: "30px", fontWeight: 800 }}
              className="leading-none tracking-tight"
            >
              {actionCount} Tasks
            </div>

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
                {payTasks} payments
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
                {insTasks} inspection
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
                {refTasks} refund
              </span>
            </div>
          </div>
        </div>

        <div
          style={{ borderTop: "1px solid #F1ECE1", marginTop: "18px", paddingTop: "13px" }}
          className="flex items-center justify-between w-full"
        >
          <span style={{ color: "#92400E", fontSize: "12.5px", fontWeight: 500 }}>
            Review checklist
          </span>
          <span
            style={{ color: "#B45309", fontSize: "12.5px", fontWeight: 700 }}
            className="flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>
    </section>
  );
}
