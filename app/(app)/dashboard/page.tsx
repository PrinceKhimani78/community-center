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
    <div style={{ backgroundColor: "#F8FAFC" }} className="w-full min-h-[calc(100vh-60px)] p-4 sm:p-6 lg:p-7">
      <div className="max-w-[1240px] mx-auto space-y-5">
        {/* 1. Greeting row */}
        <section
          aria-label="Welcome and Actions"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
        >
          {/* Greeting Text */}
          <div>
            <h1
              style={{ color: "#0B2A5B", fontSize: "22px", fontWeight: 700, fontFamily: "var(--font-poppins)" }}
              className="leading-tight tracking-tight"
            >
              {greetingTime}, {userName}
            </h1>
            <p style={{ color: "#64748B", fontSize: "13px" }} className="font-normal mt-0.5">
              Overview of community hall bookings, collections, and pending actions today.
            </p>
          </div>

          {/* Coordinated Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
            {/* + New Booking */}
            <Link
              href="/bookings/new"
              style={{
                height: "40px",
                padding: "0 18px",
                backgroundColor: "#0B2A5B",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 1px 3px rgba(11, 42, 91, 0.2)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              className="hover:opacity-95 active:scale-[0.98] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>New Booking</span>
            </Link>

            {/* ₹ Record Payment */}
            <Link
              href="/payments"
              style={{
                height: "40px",
                padding: "0 18px",
                backgroundColor: "#E2B544",
                color: "#0B2A5B",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 1px 3px rgba(226, 181, 68, 0.25)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              className="hover:opacity-95 active:scale-[0.98] whitespace-nowrap"
            >
              <span style={{ fontSize: "15px", fontWeight: 800 }}>₹</span>
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
