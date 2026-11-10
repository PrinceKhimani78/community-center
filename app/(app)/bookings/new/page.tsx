"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageShell from "@/components/common/PageShell";
import NewBookingForm from "@/components/features/NewBookingForm";

export default function NewBookingPage() {
  return (
    <PageShell
      title="New Booking"
      subtitle="Fill these 3 simple steps to book a community hall."
      rightSlot={
        <Link
          href="/bookings"
          style={{
            minHeight: "42px",
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #EFE4CC",
            color: "#0B2A5B",
            borderRadius: "10px",
          }}
          className="interactive-btn px-4 py-2 text-[13px] font-semibold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>
      }
    >
      <NewBookingForm />
    </PageShell>
  );
}
