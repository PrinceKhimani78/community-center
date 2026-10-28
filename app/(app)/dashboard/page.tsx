"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ActionList from "@/components/dashboard/ActionList";
import ComingUp from "@/components/dashboard/ComingUp";

export default function DashboardPage() {
  const { role } = useDashboard();
  const [greetingTime, setGreetingTime] = useState("Good afternoon");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreetingTime("Good morning");
    } else if (hour < 17) {
      setGreetingTime("Good afternoon");
    } else {
      setGreetingTime("Good evening");
    }
  }, []);

  const userName = role === "admin" ? "Admin" : "Manager";

  return (
    <div className="w-full bg-[#F8FAFC] min-h-[calc(100vh-64px)] p-4 sm:p-5 lg:p-6">
      <div className="max-w-[1240px] mx-auto space-y-4 sm:space-y-5">
        {/* 1. Greeting row */}
        <section
          aria-label="Welcome and Actions"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
        >
          {/* Greeting Text */}
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-navy leading-tight tracking-tight font-poppins">
              {greetingTime}, {userName}
            </h1>
            <p className="text-[12.5px] text-slate-500 font-normal mt-0.5">
              Tuesday, 20 October 2026
            </p>
          </div>

          {/* Two Action Buttons (42px tall, 10px radius, 13.5px semibold) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* + New Booking */}
            <Link
              href="/bookings/new"
              className="h-[42px] rounded-[10px] bg-navy text-white hover:bg-navy/90 text-[13px] sm:text-[13.5px] font-semibold px-4 flex items-center justify-center gap-1.5 transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#E2B544] active:scale-[0.98] text-center whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>New Booking</span>
            </Link>

            {/* ₹ Record Payment */}
            <Link
              href="/payments"
              className="h-[42px] rounded-[10px] bg-[#E2B544] text-navy hover:bg-[#D4A732] text-[13px] sm:text-[13.5px] font-semibold px-4 flex items-center justify-center gap-1.5 transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-navy/20 active:scale-[0.98] text-center whitespace-nowrap cursor-pointer"
            >
              <span className="font-bold text-[15px] leading-none shrink-0">₹</span>
              <span>Record Payment</span>
            </Link>
          </div>
        </section>

        {/* 2. Three Summary Cards in one row */}
        <SummaryCards />

        {/* 3. Two columns below (60% / 40%, stack on tablet/phone) */}
        <section aria-label="Action and Upcoming Bookings" className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* LEFT: Needs your action (60% -> 7 cols on 12-col grid or lg:col-span-7) */}
          <div className="lg:col-span-7 w-full">
            <ActionList />
          </div>

          {/* RIGHT: Coming up (40% -> 5 cols on 12-col grid or lg:col-span-5) */}
          <div className="lg:col-span-5 w-full">
            <ComingUp />
          </div>
        </section>
      </div>
    </div>
  );
}
