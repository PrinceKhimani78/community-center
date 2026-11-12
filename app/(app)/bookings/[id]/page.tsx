"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Printer,
  Users,
  XCircle,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import StatusBadge from "@/components/common/StatusBadge";
import {
  REFERENCE_TODAY_ISO,
  formatBookingCode,
  getBookingBalance,
  getDayMonthParts,
  isDateInRange,
} from "@/lib/utils/bookings";

interface TimelineStep {
  title: string;
  subtitle: string;
  state: "done" | "current" | "upcoming" | "cancelled";
}

function BookingDetailsContent() {
  const params = useParams<{ id: string }>();
  const {
    bookings,
    payments,
    refunds,
    cancelBooking,
    updateBookingStatus,
  } = useDashboard();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const booking =
    bookings.find((b) => b.receiptNo === params.id || b.id === params.id) || bookings[0];

  const bookingPayments = useMemo(
    () => payments.filter((p) => p.bookingReceiptNo === booking.receiptNo || p.bookingId === booking.id),
    [payments, booking.receiptNo, booking.id]
  );

  const relatedRefund = useMemo(
    () => refunds.find((r) => r.bookingReceiptNo === booking.receiptNo),
    [refunds, booking.receiptNo]
  );

  const totalCharge = booking.isFreeUse ? 0 : booking.rent + booking.deposit;
  const balance = getBookingBalance(booking);
  const collectedPct =
    totalCharge > 0 ? Math.min(100, Math.round((booking.paid / totalCharge) * 100)) : 100;

  const { day, month } = getDayMonthParts(booking.dateISO);
  const isEventToday = isDateInRange(REFERENCE_TODAY_ISO, booking.dateISO, booking.endDateISO);

  const timelineSteps = useMemo<TimelineStep[]>(() => {
    const firstPay = bookingPayments[bookingPayments.length - 1];
    const secondPay = bookingPayments.length > 1 ? bookingPayments[0] : undefined;
    const isCancelled = booking.status === "Cancelled";
    const isConfirmedOrDone =
      booking.status === "Confirmed" || booking.status === "Completed";
    const isCompleted = booking.status === "Completed";
    const isDepositSettled =
      relatedRefund?.status === "Refunded" || booking.depositStatus === "Refunded";
    const preDone = Boolean(booking.preInspectionDone || isCompleted);
    const postDone = Boolean(booking.postInspectionDone || isCompleted);

    if (isCancelled) {
      return [
        {
          title: "Booking created",
          subtitle: `${booking.createdAtLabel || booking.dateLabel} · by ${booking.createdBy || "Manager"}`,
          state: "done",
        },
        {
          title: firstPay
            ? `Advance received ₹${firstPay.amount.toLocaleString("en-IN")}`
            : "Advance payment",
          subtitle: firstPay
            ? `${firstPay.dateLabel} · ${firstPay.mode} · ${firstPay.receiptNo}`
            : "No advance collected",
          state: firstPay ? "done" : "upcoming",
        },
        {
          title: "Booking cancelled",
          subtitle: booking.cancellationReason || "Cancelled by staff",
          state: "cancelled",
        },
        {
          title: "Deposit & refund settlement",
          subtitle: booking.paid > 0 ? "Refund processed" : "No refund required",
          state: booking.paid > 0 ? "done" : "upcoming",
        },
      ];
    }

    return [
      {
        title: "Booking created",
        subtitle: `${booking.createdAtLabel || "Oct 2026"} · by ${booking.createdBy || "Manager"}`,
        state: "done",
      },
      {
        title: booking.isFreeUse
          ? "Free community use requested"
          : firstPay
          ? `Advance received ₹${firstPay.amount.toLocaleString("en-IN")}`
          : "Advance payment pending",
        subtitle: booking.isFreeUse
          ? "No rent or deposit charged"
          : firstPay
          ? `${firstPay.dateLabel} · ${firstPay.mode} · ${firstPay.receiptNo}`
          : "Awaiting advance payment",
        state: booking.isFreeUse || firstPay || booking.paid > 0 ? "done" : "current",
      },
      {
        title:
          booking.status === "Awaiting approval"
            ? "Trustee approval pending"
            : isConfirmedOrDone
            ? "Booking confirmed"
            : "Awaiting confirmation",
        subtitle: isConfirmedOrDone
          ? "Approved & slot reserved"
          : booking.status === "Awaiting approval"
          ? "Sent to Admin / Trustee queue"
          : "Pending advance / confirmation",
        state: isConfirmedOrDone ? "done" : booking.paid > 0 || booking.isFreeUse ? "current" : "upcoming",
      },
      {
        title: booking.isFreeUse
          ? "Security deposit waived"
          : secondPay
          ? `Payment received ₹${secondPay.amount.toLocaleString("en-IN")}`
          : booking.deposit > 0
          ? `Security deposit ₹${booking.deposit.toLocaleString("en-IN")}`
          : "Full balance payment",
        subtitle: booking.isFreeUse
          ? "Free community event"
          : secondPay
          ? `${secondPay.dateLabel} · ${secondPay.mode} · ${secondPay.receiptNo}`
          : balance === 0
          ? "Full rent & deposit settled"
          : `₹${balance.toLocaleString("en-IN")} balance remaining`,
        state:
          booking.isFreeUse || balance === 0 || Boolean(secondPay)
            ? "done"
            : isConfirmedOrDone
            ? "current"
            : "upcoming",
      },
      {
        title: "Pre-event inspection",
        subtitle: preDone ? "7/7 checks passed" : `Scheduled before ${booking.dateLabel}`,
        state: preDone ? "done" : isEventToday && isConfirmedOrDone ? "current" : "upcoming",
      },
      {
        title: isCompleted
          ? "Event completed"
          : isEventToday
          ? "Event in progress"
          : "Event day",
        subtitle: `${booking.dateLabel} · ${booking.timing}`,
        state: isCompleted ? "done" : isEventToday ? "current" : "upcoming",
      },
      {
        title: "Post-event inspection",
        subtitle: postDone ? "Hall inspected after event" : "Scheduled after event",
        state: postDone ? "done" : isCompleted ? "current" : "upcoming",
      },
      {
        title: "Deposit refund & settlement",
        subtitle: booking.isFreeUse
          ? "Not applicable"
          : isDepositSettled
          ? "Refunded to customer"
          : "After inspection approval",
        state: booking.isFreeUse || isDepositSettled ? "done" : postDone ? "current" : "upcoming",
      },
    ];
  }, [booking, bookingPayments, relatedRefund, balance, isEventToday]);

  const doneCount = timelineSteps.filter((s) => s.state === "done").length;

  const handleConfirmCancel = () => {
    cancelBooking(booking.id, cancelReason);
    setShowCancelConfirm(false);
    setCancelReason("");
  };

  return (
    <PageShell hideHeader>
      <div className="space-y-5">
        {/* Top Breadcrumb + Back */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-[#5B6474]">
              <Link href="/bookings" className="hover:text-[#0B2A5B]">
                Bookings
              </Link>{" "}
              · Booking details
            </div>
            <h1 style={{ color: "#0B2A5B", fontSize: "22px", fontWeight: 700 }}>
              {formatBookingCode(booking.receiptNo)} · {booking.eventTitle}
            </h1>
          </div>

          <Link
            href="/bookings"
            style={{
              minHeight: "40px",
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #EFE4CC",
              color: "#0B2A5B",
              borderRadius: "10px",
            }}
            className="interactive-btn px-3.5 py-2 text-[13px] font-semibold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Bookings</span>
          </Link>
        </div>

        {/* MOBILE NAVY SUMMARY CARD (matches 5.8) */}
        <div className="md:hidden space-y-3">
          <div
            style={{
              background: "linear-gradient(155deg, #071E47 0%, #0B2A5B 100%)",
              borderRadius: "18px",
              padding: "18px",
              color: "#FFFFFF",
            }}
            className="space-y-3 shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[18px] font-bold">{booking.applicantName}</div>
                <div className="text-[13px] text-[#F4CF6A] font-medium mt-0.5">
                  {booking.eventTitle}
                  {booking.phone ? ` · ${booking.phone}` : ""}
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[12.5px] text-white/90 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E2B544] shrink-0" />
                <span>{booking.dateLabel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E2B544] shrink-0" />
                <span className="truncate">{booking.timing}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E2B544] shrink-0" />
                <span className="truncate">{booking.hall}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#E2B544] shrink-0" />
                <span>{booking.guests} guests</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/bookings/new?edit=${booking.receiptNo}`}
              className="min-h-[42px] rounded-xl bg-white border border-[#EFE4CC] text-[#0B2A5B] text-[13px] font-bold inline-flex items-center justify-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
            <Link
              href={`/invoices/${booking.receiptNo}?type=invoice`}
              className="min-h-[42px] rounded-xl bg-white border border-[#EFE4CC] text-[#0B2A5B] text-[13px] font-bold inline-flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </Link>
            <Link
              href={`/payments?booking=${booking.receiptNo}`}
              className="min-h-[42px] rounded-xl bg-[#0B2A5B] text-white text-[13px] font-bold inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </Link>
            {booking.status !== "Cancelled" && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="min-h-[42px] rounded-xl bg-white border border-red-300 text-[#C62828] text-[13px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP HEADER STRIP (matches 4.6) */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #EFE4CC",
            borderRadius: "18px",
            padding: "18px 22px",
          }}
          className="hidden md:flex flex-wrap items-center justify-between gap-4 shadow-2xs"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-[#0B2A5B] text-white flex flex-col items-center justify-center shrink-0">
              <span className="text-[19px] font-extrabold leading-none">{day}</span>
              <span className="text-[10px] font-bold text-[#F4CF6A] mt-0.5">{month}</span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[19px] font-bold text-[#0B2A5B]">{booking.applicantName}</h2>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-[13px] text-[#5B6474] mt-0.5">
                {booking.eventTitle} · {booking.hall} {booking.isAC ? "(A.C.)" : ""} ·{" "}
                {booking.timing} · {booking.guests} guests
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/bookings/new?edit=${booking.receiptNo}`}
              style={{ minHeight: "40px" }}
              className="interactive-btn px-3.5 py-2 rounded-xl bg-white border border-[#0B2A5B]/30 text-[#0B2A5B] text-[13px] font-bold inline-flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>

            <Link
              href={`/invoices/${booking.receiptNo}?type=invoice`}
              style={{ minHeight: "40px" }}
              className="interactive-btn px-3.5 py-2 rounded-xl bg-white border border-[#0B2A5B]/30 text-[#0B2A5B] text-[13px] font-bold inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </Link>

            <Link
              href={`/payments?booking=${booking.receiptNo}`}
              style={{
                minHeight: "40px",
                background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                color: "#FFFFFF",
                borderRadius: "10px",
              }}
              className="interactive-btn px-4 py-2 text-[13px] font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </Link>

            {booking.status !== "Cancelled" && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                style={{ minHeight: "40px" }}
                className="interactive-btn px-3.5 py-2 rounded-xl bg-white border border-red-300 text-[#C62828] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Cancel Booking</span>
              </button>
            )}
          </div>
        </section>

        {/* Cancel Booking Confirmation Panel */}
        {showCancelConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 space-y-3 animate-check-pop">
            <div className="flex items-start gap-2.5 text-[#C62828]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[15px]">Cancel Booking #{booking.receiptNo}?</h3>
                <p className="text-[13px] text-red-800 mt-0.5">
                  This frees the hall slot on the Calendar and logs the cancellation in Activity Logs.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="flex-1 h-10 rounded-xl border border-red-200 bg-white px-3.5 text-[13px] text-[#14213D]"
              />
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="h-10 px-4 rounded-xl bg-[#C62828] text-white text-[13px] font-bold cursor-pointer"
              >
                Confirm Cancellation
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="h-10 px-4 rounded-xl bg-white border border-[#EFE4CC] text-[#0B2A5B] text-[13px] font-semibold cursor-pointer"
              >
                Keep Booking
              </button>
            </div>
          </div>
        )}

        {/* Quick Workflow Action Bar if Pending / Awaiting Approval / Confirmed */}
        {(booking.status === "Pending" ||
          booking.status === "Awaiting approval" ||
          booking.status === "Confirmed") && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFDF7] border border-[#EFE4CC] rounded-2xl px-4 py-3 text-[13px]">
            <span className="text-[#5B6474] font-medium">
              Quick status update for{" "}
              <strong className="text-[#0B2A5B]">#{booking.receiptNo}</strong>:
            </span>
            <div className="flex flex-wrap gap-2">
              {(booking.status === "Pending" || booking.status === "Awaiting approval") && (
                <button
                  type="button"
                  onClick={() => updateBookingStatus(booking.id, "Confirmed")}
                  className="px-3.5 py-1.5 rounded-xl bg-[#15803D] text-white text-[12.5px] font-bold cursor-pointer"
                >
                  Mark Confirmed
                </button>
              )}
              {booking.status === "Confirmed" && (
                <button
                  type="button"
                  onClick={() => updateBookingStatus(booking.id, "Completed")}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0B2A5B] text-white text-[12.5px] font-bold cursor-pointer"
                >
                  Mark Event Completed
                </button>
              )}
            </div>
          </div>
        )}

        {/* MAIN 2-COLUMN BODY (matches 4.6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 7/8 COLS */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            {/* 4 Money KPI Cards + Collection Progress */}
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] p-3.5">
                  <div className="text-[11.5px] font-semibold text-[#5B6474]">Hall Rent</div>
                  <div className="text-[20px] font-extrabold text-[#0B2A5B] mt-1">
                    {booking.isFreeUse ? "Free" : `₹${booking.rent.toLocaleString("en-IN")}`}
                  </div>
                </div>
                <div className="rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] p-3.5">
                  <div className="text-[11.5px] font-semibold text-[#5B6474]">
                    Security Deposit
                  </div>
                  <div className="text-[20px] font-extrabold text-[#0B2A5B] mt-1">
                    ₹{booking.deposit.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-3.5">
                  <div className="text-[11.5px] font-semibold text-[#15803D]">Paid</div>
                  <div className="text-[20px] font-extrabold text-[#15803D] mt-1">
                    ₹{booking.paid.toLocaleString("en-IN")}
                  </div>
                </div>
                <div
                  className={`rounded-xl border p-3.5 ${
                    balance > 0
                      ? "bg-[#FEF2F2] border-[#FECACA]"
                      : "bg-[#ECFDF5] border-[#BBF7D0]"
                  }`}
                >
                  <div
                    className={`text-[11.5px] font-semibold ${
                      balance > 0 ? "text-[#C62828]" : "text-[#15803D]"
                    }`}
                  >
                    Balance Due
                  </div>
                  <div
                    className={`text-[20px] font-extrabold mt-1 ${
                      balance > 0 ? "text-[#C62828]" : "text-[#15803D]"
                    }`}
                  >
                    ₹{balance.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {!booking.isFreeUse && totalCharge > 0 && (
                <div>
                  <div className="w-full h-2 rounded-full bg-[#FAF5EB] overflow-hidden">
                    <div
                      style={{ width: `${collectedPct}%` }}
                      className="h-full bg-[#15803D] rounded-full transition-all"
                    />
                  </div>
                  <div className="text-[12px] text-[#5B6474] mt-1.5">
                    {collectedPct}% of ₹{totalCharge.toLocaleString("en-IN")} collected
                  </div>
                </div>
              )}
            </div>

            {/* Payment History Table */}
            <section
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #EFE4CC",
                borderRadius: "18px",
                padding: "20px",
              }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                  Payment History
                </h3>
                <Link
                  href="/payments"
                  className="text-[12.5px] font-bold text-[#0B2A5B] hover:text-[#C9971C] inline-flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record payment</span>
                </Link>
              </div>

              {bookingPayments.length === 0 ? (
                <div className="p-5 rounded-xl bg-[#FAF7F2] text-center text-[13.5px] text-[#5B6474]">
                  No payments recorded for this booking yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[520px] text-[13px]">
                    <thead>
                      <tr className="border-b border-[#F1ECE1] text-[12px] text-[#5B6474]">
                        <th className="py-2.5 pr-3 font-semibold">Receipt</th>
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 font-semibold">Type</th>
                        <th className="py-2.5 px-3 font-semibold">Mode</th>
                        <th className="py-2.5 pl-3 text-right font-semibold">Amount</th>
                        <th className="py-2.5 pl-3 text-right font-semibold">Print</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1ECE1]">
                      {bookingPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="notranslate py-3 pr-3 font-bold text-[#0B2A5B]">{p.receiptNo}</td>
                          <td className="py-3 px-3 text-[#5B6474]">{p.dateLabel}</td>
                          <td className="py-3 px-3 text-[#14213D]">{p.type}</td>
                          <td className="py-3 px-3 text-[#5B6474]">{p.mode}</td>
                          <td className="notranslate py-3 pl-3 text-right font-bold text-[#15803D]">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <Link
                              href={`/invoices/${booking.receiptNo}?type=payment`}
                              className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0B2A5B] hover:text-[#C9971C]"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Bottom 2 Cards: Notes + Inspections & Deposit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #EFE4CC",
                  borderRadius: "18px",
                  padding: "20px",
                }}
                className="space-y-2.5"
              >
                <h3 style={{ color: "#0B2A5B", fontSize: "15.5px", fontWeight: 700 }}>
                  Notes & Special Instructions
                </h3>
                <p className="text-[13.5px] text-[#5B6474] leading-relaxed">
                  {booking.notes || "No special instructions added for this booking."}
                </p>
                {booking.status === "Cancelled" && booking.cancellationReason && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[12.5px] text-[#C62828] font-medium">
                    <strong>Cancellation reason:</strong> {booking.cancellationReason}
                  </div>
                )}
              </section>

              <section
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #EFE4CC",
                  borderRadius: "18px",
                  padding: "20px",
                }}
                className="space-y-2.5"
              >
                <h3 style={{ color: "#0B2A5B", fontSize: "15.5px", fontWeight: 700 }}>
                  Inspections & Deposit
                </h3>

                <div className="space-y-2 text-[13px]">
                  <Link
                    href={`/inspections/${booking.receiptNo}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                      booking.preInspectionDone || booking.status === "Completed"
                        ? "bg-[#ECFDF5] border-[#BBF7D0]"
                        : "bg-[#FAF7F2] border-[#EFE4CC]"
                    }`}
                  >
                    <span className="text-[#5B6474] font-medium">Pre-event inspection</span>
                    <span
                      className={`font-bold ${
                        booking.preInspectionDone || booking.status === "Completed"
                          ? "text-[#15803D]"
                          : "text-[#0B2A5B]"
                      }`}
                    >
                      {booking.preInspectionDone || booking.status === "Completed"
                        ? "Passed 7/7"
                        : "Pending"}
                    </span>
                  </Link>

                  <Link
                    href={`/inspections/${booking.receiptNo}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]"
                  >
                    <span className="text-[#5B6474] font-medium">Post-event inspection</span>
                    <span className="font-bold text-[#0B2A5B]">
                      {booking.postInspectionDone || booking.status === "Completed"
                        ? "Passed"
                        : "After event"}
                    </span>
                  </Link>

                  <Link
                    href={`/deposits/${booking.receiptNo}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]"
                  >
                    <span className="text-[#5B6474] font-medium">Deposit refund</span>
                    <span className="font-bold text-[#0B2A5B]">
                      {relatedRefund?.status || booking.depositStatus || "Awaiting inspection"}
                    </span>
                  </Link>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT 5/4 COLS — 8-STEP BOOKING TIMELINE */}
          <aside
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #EFE4CC",
              borderRadius: "18px",
              padding: "22px",
            }}
            className="lg:col-span-5 xl:col-span-4 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                Booking Timeline
              </h3>
              <span className="text-[12px] font-semibold text-[#5B6474]">
                {doneCount} of {timelineSteps.length} done
              </span>
            </div>

            <div className="relative space-y-4 pl-2">
              {timelineSteps.map((step, idx) => {
                const isLast = idx === timelineSteps.length - 1;
                return (
                  <div key={step.title} className="relative flex items-start gap-3">
                    {!isLast && (
                      <span
                        className={`absolute left-[11px] top-6 bottom-[-18px] w-[2px] ${
                          step.state === "done" ? "bg-[#15803D]" : "bg-[#E5E7EB]"
                        }`}
                      />
                    )}

                    <span
                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        step.state === "done"
                          ? "bg-[#15803D] text-white"
                          : step.state === "current"
                          ? "bg-[#E2B544] border-2 border-[#C9971C]"
                          : step.state === "cancelled"
                          ? "bg-[#C62828] text-white"
                          : "bg-white border-2 border-[#D1D5DB]"
                      }`}
                    >
                      {step.state === "done" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {step.state === "cancelled" && <XCircle className="w-3.5 h-3.5" />}
                    </span>

                    <div className="min-w-0 pb-1">
                      <div
                        className={`text-[13.5px] font-bold leading-snug ${
                          step.state === "upcoming" ? "text-[#5B6474]" : "text-[#0B2A5B]"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-[12px] text-[#5B6474] mt-0.5">{step.subtitle}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading booking details...</div>}>
      <BookingDetailsContent />
    </Suspense>
  );
}
