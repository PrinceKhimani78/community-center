import React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { UPCOMING_BOOKINGS, BookingStatus } from "@/lib/mock/dashboard";

interface StatusBadgeConfig {
  bg: string;
  color: string;
  border: string;
  label: string;
}

const STATUS_BADGES: Record<BookingStatus, StatusBadgeConfig> = {
  Confirmed: {
    bg: "#DCFCE7",
    color: "#15803D",
    border: "1px solid #BBF7D0",
    label: "Confirmed",
  },
  Pending: {
    bg: "#FEF3C7",
    color: "#B45309",
    border: "1px solid #FDE68A",
    label: "Pending",
  },
  "Awaiting approval": {
    bg: "#EFF6FF",
    color: "#1D4ED8",
    border: "1px solid #BFDBFE",
    label: "Awaiting approval",
  },
};

export default function ComingUp() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
      className="p-4 sm:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #F1F5F9" }}
        className="flex items-center justify-between pb-3 mb-2"
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" style={{ color: "#0B2A5B" }} />
          <h3
            style={{ color: "#0B2A5B", fontSize: "15px", fontWeight: 700 }}
            className="tracking-tight"
          >
            Coming up
          </h3>
        </div>
        <Link
          href="/calendar"
          style={{
            color: "#0B2A5B",
            fontSize: "12.5px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="hover:underline hover:text-amber-600 transition-colors"
        >
          <span>Full calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5 Rows */}
      <div className="divide-y divide-slate-100">
        {UPCOMING_BOOKINGS.map((booking) => {
          const badge = STATUS_BADGES[booking.status] || STATUS_BADGES.Confirmed;

          return (
            <Link
              key={booking.id}
              href={`/bookings/${booking.receiptNo}`}
              style={{
                borderRadius: "8px",
                padding: "10px 8px",
                margin: "0 -8px",
              }}
              className="flex items-center justify-between gap-3 group coming-up-item cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Executive Calendar Tile with Navy Top and Gold text */}
                <div
                  style={{
                    width: "42px",
                    height: "46px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "0 1px 2px rgba(11, 42, 91, 0.06)",
                    userSelect: "none",
                  }}
                  className="group-hover:border-[#E2B544] group-hover:shadow-sm transition-all"
                >
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#0B2A5B",
                      color: "#E2B544",
                      fontSize: "9px",
                      fontWeight: 800,
                      textAlign: "center",
                      padding: "2px 0",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      lineHeight: 1.2,
                    }}
                  >
                    {booking.month}
                  </div>
                  <div
                    style={{
                      color: "#0B2A5B",
                      fontSize: "15px",
                      fontWeight: 800,
                      paddingBottom: "4px",
                      lineHeight: 1,
                    }}
                  >
                    {booking.day}
                  </div>
                </div>

                {/* Event Name + Details */}
                <div className="min-w-0">
                  <h4
                    style={{
                      color: "#0B2A5B",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                    }}
                    className="truncate group-hover:text-blue-900"
                  >
                    {booking.title}
                  </h4>
                  <p
                    style={{
                      color: "#64748B",
                      fontSize: "11.5px",
                      marginTop: "2px",
                      lineHeight: 1.2,
                    }}
                    className="truncate"
                  >
                    {booking.applicant} · {booking.hall}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div className="shrink-0">
                <span
                  style={{
                    backgroundColor: badge.bg,
                    color: badge.color,
                    border: badge.border,
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: "9999px",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  {badge.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
