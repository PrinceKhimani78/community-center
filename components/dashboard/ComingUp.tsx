"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import StatusBadge from "@/components/common/StatusBadge";

export default function ComingUp() {
  const { bookings } = useDashboard();
  const upcoming = bookings.filter((b) => b.status !== "Completed" && b.status !== "Cancelled");

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1.5px solid rgba(226, 181, 68, 0.35)",
        borderRadius: "20px",
        boxShadow: "0 12px 28px -6px rgba(11, 42, 91, 0.06)",
        padding: "clamp(18px, 3vw, 26px)",
      }}
      className="flex flex-col"
    >
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #F1ECE1", paddingBottom: "14px" }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2.5">
          <CalendarDays className="w-5 h-5 text-[#C9971C]" />
          <h2 style={{ color: "#0B2A5B", fontSize: "18px", fontWeight: 700 }}>
            Upcoming Bookings
          </h2>
        </div>
        <Link
          href="/calendar"
          style={{ color: "#C9971C", fontSize: "13px", fontWeight: 600 }}
          className="hover:underline inline-flex items-center gap-1 group"
        >
          <span>Open Calendar</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Rows */}
      <div className="space-y-2.5">
        {upcoming.map((booking, idx) => {
          const dayNum = booking.dateISO.slice(8, 10);
          return (
            <Link
              key={booking.id}
              href={`/bookings/${booking.receiptNo}`}
              style={{
                backgroundColor: "#FAF7F2",
                border: "1px solid rgba(226, 181, 68, 0.22)",
                borderRadius: "14px",
                padding: "14px 16px",
                animationDelay: `${idx * 45}ms`,
              }}
              className="interactive-row animate-fade-up flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Date Tile */}
                <div
                  style={{
                    width: "46px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(226, 181, 68, 0.45)",
                    borderRadius: "10px",
                  }}
                  className="flex flex-col items-center justify-between overflow-hidden shrink-0 shadow-2xs"
                >
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#0B2A5B",
                      color: "#E2B544",
                      fontSize: "9.5px",
                      fontWeight: 800,
                      padding: "2px 0",
                    }}
                    className="text-center uppercase tracking-wider"
                  >
                    OCT
                  </div>
                  <div
                    style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 800 }}
                    className="pb-1 leading-none"
                  >
                    {dayNum}
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 style={{ color: "#0B2A5B", fontSize: "15px", fontWeight: 700 }} className="truncate">
                    {booking.eventTitle}
                  </h3>
                  <p style={{ color: "#5B6474", fontSize: "13px" }} className="truncate mt-0.5">
                    {booking.applicantName} · {booking.hall}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={booking.status} />
                <ArrowRight className="w-4 h-4 text-[#C9971C] hidden sm:block" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
