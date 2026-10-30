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
        border: "1.5px solid rgba(226, 181, 68, 0.32)",
        borderRadius: "18px",
        boxShadow: "0 10px 28px -4px rgba(11, 42, 91, 0.05), 0 3px 10px rgba(226, 181, 68, 0.07)",
        padding: "24px",
      }}
      className="flex flex-col justify-between"
    >
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #F1ECE1", paddingBottom: "16px" }}
        className="flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2.5">
          <CalendarDays className="w-4 h-4 text-[#C9971C]" />
          <h3
            style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }}
            className="tracking-tight"
          >
            Coming up
          </h3>
        </div>
        <Link
          href="/calendar"
          style={{
            color: "#C9971C",
            fontSize: "13px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="hover:underline transition-colors group"
        >
          <span>Full calendar</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 5 Rows with airy spacing */}
      <div className="space-y-1.5">
        {UPCOMING_BOOKINGS.map((booking) => {
          const badge = STATUS_BADGES[booking.status] || STATUS_BADGES.Confirmed;

          return (
            <Link
              key={booking.id}
              href={`/bookings/${booking.receiptNo}`}
              style={{
                borderRadius: "10px",
                padding: "10px 12px",
              }}
              className="flex items-center justify-between gap-3 group hover:bg-[#FAF6EF] transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Executive Calendar Tile with Navy Top and Gold text */}
                <div
                  style={{
                    width: "42px",
                    height: "46px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(226, 181, 68, 0.4)",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "0 2px 4px rgba(11, 42, 91, 0.06)",
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
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: 1.35,
                    }}
                    className="group-hover:text-blue-900 transition-colors"
                  >
                    {booking.title}
                  </h4>
                  <p
                    style={{
                      color: "#78716C",
                      fontSize: "12px",
                      marginTop: "2px",
                      lineHeight: 1.2,
                    }}
                    className="truncate font-medium"
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

