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
    <div className="bg-white rounded-[18px] border border-[#EFE4CC] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#F1EADB]">
        <h3 className="text-[18px] font-bold text-navy tracking-tight">Coming up</h3>
        <Link
          href="/calendar"
          className="text-[13px] font-semibold text-navy hover:text-navy/80 hover:underline"
        >
          Calendar
        </Link>
      </div>

      {/* 5 Rows separated by thin #F1EADB lines */}
      <div className="divide-y divide-[#F1EADB]">
        {UPCOMING_BOOKINGS.map((booking) => {
          const pill = STATUS_PILL_STYLES[booking.status] || STATUS_PILL_STYLES.Confirmed;

          return (
            <Link
              key={booking.id}
              href={`/bookings/${booking.receiptNo}`}
              className="py-3.5 first:pt-3.5 last:pb-1 flex items-center justify-between gap-3 group transition-colors hover:bg-cream/40 px-2 -mx-2 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* 50px date block: day 18px bold navy over month 11px muted, cream background */}
                <div className="w-[50px] h-[50px] rounded-[10px] bg-cream border border-[#EFE4CC] flex flex-col items-center justify-center shrink-0 text-center leading-none select-none shadow-2xs">
                  <span className="text-[18px] font-bold text-navy">{booking.day}</span>
                  <span className="text-[11px] font-semibold text-muted uppercase mt-0.5">
                    {booking.month}
                  </span>
                </div>

                {/* Event Name + Details */}
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-navy truncate group-hover:text-navy/90 leading-snug">
                    {booking.title}
                  </h4>
                  <p className="text-[12px] text-muted truncate mt-0.5 leading-normal">
                    {booking.applicant} · {booking.hall}
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap shadow-2xs ${pill.bg} ${pill.text}`}
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
