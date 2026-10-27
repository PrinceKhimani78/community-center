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
    <section aria-label="Quick Summary" className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
      {/* 1. Today in the hall */}
      <Link
        href={`/bookings/${today.receiptNo}`}
        className="bg-white rounded-[18px] border border-[#EFE4CC] p-5 transition-all duration-200 hover:border-light-gold hover:shadow-xs flex flex-col justify-between group cursor-pointer"
      >
        <div>
          <span className="text-[13px] font-medium text-muted">Today in the hall</span>
          <h3 className="text-[18px] font-bold text-navy mt-1.5 leading-snug group-hover:text-navy/90">
            {today.event} · {today.applicant}
          </h3>
          <p className="text-[13px] text-muted mt-1 leading-normal">
            {today.hall} · {today.timing}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-1">
          <span className="px-2.5 py-0.5 rounded-full bg-[#15803D] text-white text-[12px] font-semibold">
            {today.status}
          </span>
          <span className="text-[12px] font-bold text-[#C62828]">
            {today.balance}
          </span>
        </div>
      </Link>

      {/* 2. Money to collect */}
      <Link
        href="/payments"
        className="bg-white rounded-[18px] border border-[#EFE4CC] p-5 transition-all duration-200 hover:border-light-gold hover:shadow-xs flex flex-col justify-between group cursor-pointer"
      >
        <div>
          <span className="text-[13px] font-medium text-muted">Money to collect</span>
          <div className="text-[34px] font-bold text-navy tracking-tight mt-1 leading-none">
            {money.amount}
          </div>
        </div>

        <div className="text-[13px] text-muted mt-4">
          <span>{money.bookingCount} bookings</span>
          <span className="mx-1.5">·</span>
          <span className="text-[#C62828] font-semibold">{money.overdueCount} overdue</span>
        </div>
      </Link>

      {/* 3. Needs your action */}
      <Link
        href="/notifications"
        className="bg-[#FFF4D6] rounded-[18px] border border-[#F0DCA4] p-5 transition-all duration-200 hover:border-light-gold hover:shadow-xs flex flex-col justify-between group cursor-pointer"
      >
        <div>
          <span className="text-[13px] font-medium text-[#8A6510]">Needs your action</span>
          <div className="text-[34px] font-bold text-navy tracking-tight mt-1 leading-none">
            {actionCount}
          </div>
        </div>

        <div className="text-[13px] font-medium text-[#8A6510] mt-4">
          Clear them from the list below
        </div>
      </Link>
    </section>
  );
}
