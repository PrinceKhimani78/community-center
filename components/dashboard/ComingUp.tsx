import React from "react";
import Link from "next/link";
import { UPCOMING_BOOKINGS, BookingStatus } from "@/lib/mock/dashboard";

const STATUS_PILL_STYLES: Record<BookingStatus, { bg: string; text: string }> = {
  Confirmed: { bg: "bg-[#15803D]", text: "text-white" },
  Pending: { bg: "bg-[#F5B700]", text: "text-[#3D2E00]" },
  "Awaiting approval": { bg: "bg-[#1D4ED8]", text: "text-white" },
};

export default function ComingUp() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: "1px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
      className="p-3.5 sm:p-4 flex flex-col justify-between"
    >
      {/* Header */}
      <div style={{ borderBottom: "1px solid #F1F5F9" }} className="flex items-center justify-between pb-2.5">
        <h3 style={{ color: "#0B2A5B" }} className="text-[15.5px] font-bold tracking-tight">Coming up</h3>
        <Link
          href="/calendar"
          style={{ color: "#0B2A5B" }}
          className="text-[12px] font-semibold hover:text-[#C9971C] hover:underline"
        >
          Calendar
        </Link>
      </div>

      {/* 5 Rows separated by thin lines */}
      <div className="divide-y divide-slate-100">
        {UPCOMING_BOOKINGS.map((booking) => {
          const pill = STATUS_PILL_STYLES[booking.status] || STATUS_PILL_STYLES.Confirmed;

          return (
            <Link
              key={booking.id}
              href={`/bookings/${booking.receiptNo}`}
              className="py-2.5 first:pt-2.5 last:pb-0.5 flex items-center justify-between gap-2.5 group transition-colors hover:bg-slate-50/80 px-2 -mx-2 rounded-[8px] cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* 38px date block */}
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#F8FAFC",
                    borderColor: "#E2E8F0",
                    borderWidth: "1px",
                    borderRadius: "8px",
                  }}
                  className="flex flex-col items-center justify-center shrink-0 text-center leading-none select-none shadow-2xs"
                >
                  <span style={{ color: "#0B2A5B" }} className="text-[14px] font-bold">{booking.day}</span>
                  <span style={{ color: "#64748B" }} className="text-[9.5px] font-bold uppercase mt-0.5">
                    {booking.month}
                  </span>
                </div>

                {/* Event Name + Details */}
                <div className="min-w-0">
                  <h4 style={{ color: "#0B2A5B" }} className="text-[13px] font-bold truncate group-hover:text-navy/90 leading-snug">
                    {booking.title}
                  </h4>
                  <p style={{ color: "#64748B" }} className="text-[11.5px] truncate mt-0.5 leading-normal">
                    {booking.applicant} · {booking.hall}
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-2xs ${pill.bg} ${pill.text}`}
                >
                  {booking.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
