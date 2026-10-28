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
    <div style={{ backgroundColor: "#F6F8FC" }} className="w-full min-h-[calc(100vh-60px)] p-4 sm:p-6 lg:p-7">
      <div className="max-w-[1240px] mx-auto space-y-5">
        {/* 1. Greeting row */}
        <section
          aria-label="Welcome and Actions"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
        >
          {/* Greeting Text + Status Tag */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                style={{
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #DBEAFE",
                  color: "#1D4ED8",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Hall Operational</span>
              </span>
              <span style={{ color: "#CBD5E1", fontSize: "11px" }}>•</span>
              <span style={{ color: "#64748B", fontSize: "11.5px", fontWeight: 500 }}>
                Dhari, Gujarat
              </span>
            </div>

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
            {/* + New Booking (Navy with Gold accent) */}
            <Link
              href="/bookings/new"
              style={{
                height: "40px",
                padding: "0 18px",
                backgroundColor: "#0B2A5B",
                border: "1px solid rgba(226, 181, 68, 0.45)",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 1px 3px rgba(11, 42, 91, 0.25)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="hover:bg-[#071F45] hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-[#E2B544]/60 active:scale-[0.98] whitespace-nowrap transition-all"
            >
              <Plus className="w-4 h-4 shrink-0 text-[#E2B544]" />
              <span>New Booking</span>
            </Link>

            {/* ₹ Record Payment (Luminous Gold Gradient) */}
            <Link
              href="/payments"
              style={{
                height: "40px",
                padding: "0 18px",
                background: "linear-gradient(135deg, #F4CF6A 0%, #E2B544 50%, #C9971C 100%)",
                border: "1px solid #D4A330",
                color: "#0B2A5B",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 5px rgba(201, 151, 28, 0.3)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="hover:brightness-105 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] whitespace-nowrap transition-all"
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
          {/* LEFT: Needs your action */}
          <div className="lg:col-span-7 w-full">
            <ActionList />
          </div>

          {/* RIGHT: Coming up */}
          <div className="lg:col-span-5 w-full">
            <ComingUp />
          </div>
        </section>
      </div>
    </div>
  );
}
