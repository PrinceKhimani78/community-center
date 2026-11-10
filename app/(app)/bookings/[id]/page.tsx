"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Info,
  Printer,
  User,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import StatusBadge from "@/components/common/StatusBadge";

type DetailTab = "overview" | "steps" | "payments";

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const { bookings, payments, updateBookingStatus } = useDashboard();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const booking =
    bookings.find((b) => b.receiptNo === params.id || b.id === params.id) || bookings[0];

  const bookingPayments = payments.filter((p) => p.bookingReceiptNo === booking.receiptNo);
  const totalCharge = booking.rent + booking.deposit;
  const balance = Math.max(0, totalCharge - booking.paid);

  const tabs: TabItem<DetailTab>[] = [
    { id: "overview", label: "Booking Details", icon: Info },
    { id: "steps", label: "Progress Steps", icon: ClipboardList },
    { id: "payments", label: "Payments", icon: CreditCard, count: bookingPayments.length },
  ];

  const steps = [
    { label: "Booking Created", done: true },
    { label: "Advance Paid", done: booking.paid > 0 || booking.isFreeUse },
    {
      label: "Booking Confirmed",
      done: booking.status === "Confirmed" || booking.status === "Completed",
    },
    { label: "Before-Event Hall Check", done: booking.status === "Completed" },
    { label: "Event Completed", done: booking.status === "Completed" },
    { label: "After-Event Hall Check & Deposit Settled", done: booking.status === "Completed" },
  ];

  return (
    <PageShell
      title={`Booking #${booking.receiptNo} · ${booking.eventTitle}`}
      subtitle={`${booking.applicantName} · ${booking.dateLabel}`}
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
          <span>All Bookings</span>
        </Link>
      }
    >
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Booking tabs" />

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Simple Money Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Hall Rent", val: `₹${booking.rent.toLocaleString("en-IN")}`, color: "#0B2A5B" },
                { label: "Deposit", val: `₹${booking.deposit.toLocaleString("en-IN")}`, color: "#0B2A5B" },
                { label: "Paid So Far", val: `₹${booking.paid.toLocaleString("en-IN")}`, color: "#15803D" },
                { label: "Balance Left", val: `₹${balance.toLocaleString("en-IN")}`, color: balance > 0 ? "#C62828" : "#15803D" },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid rgba(226, 181, 68, 0.35)",
                    borderRadius: "16px",
                    padding: "18px",
                  }}
                  className="interactive-card"
                >
                  <div className="text-[12.5px] font-semibold text-[#5B6474]">{card.label}</div>
                  <div style={{ color: card.color }} className="text-[22px] font-extrabold mt-1">
                    {card.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Event & Customer Info Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid rgba(226, 181, 68, 0.35)",
                borderRadius: "18px",
                padding: "22px",
              }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F1ECE1]">
                <h2 style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }}>
                  Event Information
                </h2>
                <StatusBadge status={booking.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-[#C9971C] mt-1 shrink-0" />
                  <div>
                    <div className="text-[12px] text-[#5B6474]">Booked By</div>
                    <div className="font-bold text-[#0B2A5B]">{booking.applicantName}</div>
                    <div className="text-[13px] text-[#5B6474]">{booking.phone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#C9971C] mt-1 shrink-0" />
                  <div>
                    <div className="text-[12px] text-[#5B6474]">Hall & Time</div>
                    <div className="font-bold text-[#0B2A5B]">
                      {booking.hall} {booking.isAC ? "(A.C.)" : ""}
                    </div>
                    <div className="text-[13px] text-[#5B6474]">
                      {booking.dateLabel} · {booking.timing}
                    </div>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] text-[13.5px] text-[#14213D]">
                  <strong>Note:</strong> {booking.notes}
                </div>
              )}

              {/* Simple Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                {balance > 0 && (
                  <Link
                    href="/payments"
                    style={{
                      minHeight: "44px",
                      background: "linear-gradient(135deg, #F7E6A9 0%, #E2B544 60%, #C9971C 100%)",
                      color: "#041535",
                      borderRadius: "10px",
                    }}
                    className="interactive-btn px-4 py-2 text-[13.5px] font-bold inline-flex items-center gap-2"
                  >
                    <span>₹ Collect Money</span>
                  </Link>
                )}

                <Link
                  href="/receipts"
                  style={{
                    minHeight: "44px",
                    backgroundColor: "#FAF5EB",
                    border: "1.5px solid #E2B544",
                    color: "#0B2A5B",
                    borderRadius: "10px",
                  }}
                  className="interactive-btn px-4 py-2 text-[13.5px] font-semibold inline-flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </Link>

                {booking.status === "Pending" && (
                  <button
                    type="button"
                    onClick={() => updateBookingStatus(booking.id, "Confirmed")}
                    style={{
                      minHeight: "44px",
                      background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                      color: "#FFFFFF",
                      borderRadius: "10px",
                    }}
                    className="interactive-btn px-4 py-2 text-[13.5px] font-semibold cursor-pointer"
                  >
                    Mark Confirmed
                  </button>
                )}

                {booking.status === "Confirmed" && (
                  <button
                    type="button"
                    onClick={() => updateBookingStatus(booking.id, "Completed")}
                    style={{
                      minHeight: "44px",
                      background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                      color: "#FFFFFF",
                      borderRadius: "10px",
                    }}
                    className="interactive-btn px-4 py-2 text-[13.5px] font-semibold cursor-pointer"
                  >
                    Mark Event Done
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "steps" && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid rgba(226, 181, 68, 0.35)",
              borderRadius: "18px",
              padding: "24px",
            }}
            className="space-y-3"
          >
            <h2 style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }} className="mb-4">
              Booking Progress
            </h2>
            {steps.map((step, idx) => (
              <div
                key={step.label}
                style={{
                  backgroundColor: step.done ? "#F0FDF4" : "#FAF7F2",
                  border: step.done ? "1px solid #BBF7D0" : "1px solid #EFE4CC",
                  borderRadius: "12px",
                  padding: "14px 16px",
                }}
                className="flex items-center gap-3"
              >
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${
                    step.done ? "text-emerald-600" : "text-slate-300"
                  }`}
                />
                <span className="text-[14px] font-semibold text-[#0B2A5B]">
                  {idx + 1}. {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "payments" && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid rgba(226, 181, 68, 0.35)",
              borderRadius: "18px",
              padding: "22px",
            }}
            className="space-y-3"
          >
            <h2 style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }}>
              Payment Receipts for #{booking.receiptNo}
            </h2>
            {bookingPayments.length === 0 ? (
              <p className="text-[14px] text-[#5B6474] py-4">No payments recorded yet.</p>
            ) : (
              bookingPayments.map((p) => (
                <div
                  key={p.id}
                  className="interactive-row flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]"
                >
                  <div>
                    <div className="font-bold text-[#0B2A5B] text-[14px]">
                      {p.receiptNo} · {p.type} ({p.mode})
                    </div>
                    <div className="text-[12.5px] text-[#5B6474]">
                      {p.dateLabel} · Ref: {p.reference}
                    </div>
                  </div>
                  <div className="font-extrabold text-[#15803D] text-[16px]">
                    ₹{p.amount.toLocaleString("en-IN")}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
