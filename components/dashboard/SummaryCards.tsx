"use client";

import React from "react";
import Link from "next/link";
import { useDashboard } from "@/lib/context/DashboardContext";
import { INITIAL_TODAY_HALL, INITIAL_MONEY_TO_COLLECT } from "@/lib/mock/dashboard";

export default function SummaryCards() {
  const { actionCount } = useDashboard();
  const today = INITIAL_TODAY_HALL;
  const money = INITIAL_MONEY_TO_COLLECT;

  return (
    <section aria-label="Quick Summary" className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4.5">
      {/* 1. Today in the hall */}
      <Link
        href={`/bookings/${today.receiptNo}`}
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E2E8F0",
          borderWidth: "1px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
        className="p-3.5 sm:p-4 transition-all duration-150 hover:border-[#E2B544] hover:shadow-xs flex flex-col justify-between group cursor-pointer"
      >
        <div>
          <span style={{ color: "#64748B" }} className="text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-wider">
            Today in the hall
          </span>
          <h3 style={{ color: "#0B2A5B" }} className="text-[15px] sm:text-[15.5px] font-bold mt-1 leading-snug group-hover:text-navy/90 truncate">
            {today.event} · {today.applicant}
          </h3>
          <p style={{ color: "#64748B" }} className="text-[12px] mt-0.5 leading-normal truncate">
            {today.hall} · {today.timing}
          </p>
        </div>

        <div className="flex items-center gap-2.5 mt-3 pt-0.5">
          <span className="px-2 py-0.5 rounded-full bg-[#15803D] text-white text-[11px] font-semibold">
            {today.status}
          </span>
          <span className="text-[11.5px] font-bold text-[#C62828]">
            {today.balance}
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
        }}
        className="p-3.5 sm:p-4 transition-all duration-150 hover:border-[#E2B544] hover:shadow-xs flex flex-col justify-between group cursor-pointer"
      >
        <div>
          <span style={{ color: "#64748B" }} className="text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-wider">
            Money to collect
          </span>
          <div style={{ color: "#0B2A5B" }} className="text-[25px] sm:text-[27px] font-bold tracking-tight mt-1 leading-none font-poppins">
            {money.amount}
          </div>
        </div>

        <div style={{ color: "#64748B" }} className="text-[12px] mt-3">
          <span>{money.bookingCount} bookings</span>
          <span className="mx-1">·</span>
          <span className="text-[#C62828] font-semibold">{money.overdueCount} overdue</span>
        </div>
      </Link>

      {/* 3. Needs your action */}
      <Link
        href="/notifications"
        style={{
          backgroundColor: "#FFF9EA",
          borderColor: "#F3E2B3",
          borderWidth: "1px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
        className="p-3.5 sm:p-4 transition-all duration-150 hover:border-[#E2B544] hover:shadow-xs flex flex-col justify-between group cursor-pointer"
      >
        <div>
          <span style={{ color: "#8A6510" }} className="text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-wider">
            Needs your action
          </span>
          <div style={{ color: "#0B2A5B" }} className="text-[25px] sm:text-[27px] font-bold tracking-tight mt-1 leading-none font-poppins">
            {actionCount}
          </div>
        </div>

        <div style={{ color: "#8A6510" }} className="text-[12px] font-medium mt-3">
          Clear them from the list below
        </div>
      </Link>
    </section>
  );
}
