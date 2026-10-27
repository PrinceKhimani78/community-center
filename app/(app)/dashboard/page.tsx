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
    <div className="w-full bg-cream min-h-[calc(100vh-76px)] p-5 sm:p-7 xl:p-[28px]">
      <div className="max-w-[1200px] mx-auto space-y-6 sm:space-y-7">
        {/* 1. Greeting row */}
        <section
          aria-label="Welcome and Actions"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
        >
          {/* Greeting Text */}
          <div>
            <h1 className="text-[26px] font-bold text-navy leading-tight tracking-tight font-poppins">
              {greetingTime}, {userName}
            </h1>
            <p className="text-[14px] text-muted font-normal mt-1">
              Tuesday, 20 October 2026
            </p>
          </div>

          {/* Two Big Action Buttons (56px tall, 14px radius, 16px semibold) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* + New Booking */}
            <Link
              href="/bookings/new"
              className="h-[56px] rounded-[14px] bg-navy text-white hover:bg-navy/90 text-[13px] sm:text-[16px] font-semibold px-2 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-light-gold active:scale-[0.98] text-center whitespace-nowrap tracking-tight sm:tracking-normal"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>New Booking</span>
            </Link>

            {/* ₹ Record Payment */}
            <Link
              href="/payments"
              className="h-[56px] rounded-[14px] bg-light-gold text-navy hover:bg-[#d8a834] text-[13px] sm:text-[16px] font-semibold px-2 sm:px-6 flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-light-gold active:scale-[0.98] text-center whitespace-nowrap tracking-tight sm:tracking-normal"
            >
              <span className="font-bold text-[15px] sm:text-[18px] leading-none shrink-0">₹</span>
              <span>Record Payment</span>
            </Link>
          </div>
        </section>

        {/* 2. Three Summary Cards in one row */}
        <SummaryCards />

        {/* 3. Two columns below (60% / 40%, stack on tablet/phone) */}
        <section aria-label="Action and Upcoming Bookings" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
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
