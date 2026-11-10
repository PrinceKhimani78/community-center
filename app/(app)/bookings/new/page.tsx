"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageShell from "@/components/common/PageShell";
import NewBookingForm from "@/components/features/NewBookingForm";
import { useDashboard } from "@/lib/context/DashboardContext";
import type { HallName } from "@/lib/mock/dashboard";
import { HALL_OPTIONS } from "@/lib/utils/bookings";

function NewOrEditBookingContent() {
  const searchParams = useSearchParams();
  const { bookings } = useDashboard();

  const editParam = searchParams.get("edit");
  const dateParam = searchParams.get("date") || undefined;
  const hallParam = searchParams.get("hall");
  const initialHall = HALL_OPTIONS.includes(hallParam as HallName)
    ? (hallParam as HallName)
    : undefined;

  const editBooking = editParam
    ? bookings.find((b) => b.receiptNo === editParam || b.id === editParam)
    : undefined;

  return (
    <PageShell
      title={editBooking ? `Edit Booking #${editBooking.receiptNo}` : "New Booking"}
      subtitle={
        editBooking
          ? `Updating ${editBooking.eventTitle} for ${editBooking.applicantName}.`
          : "Bookings · Create single or multi-day hall reservations with live availability."
      }
      rightSlot={
        <Link
          href={editBooking ? `/bookings/${editBooking.receiptNo}` : "/bookings"}
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
          <span>{editBooking ? "Back to Details" : "Back to Bookings"}</span>
        </Link>
      }
    >
      <NewBookingForm
        key={editBooking?.id || `${dateParam || ""}-${initialHall || ""}`}
        editBooking={editBooking}
        initialDateISO={dateParam}
        initialHall={initialHall}
      />
    </PageShell>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading booking form...</div>}>
      <NewOrEditBookingContent />
    </Suspense>
  );
}
