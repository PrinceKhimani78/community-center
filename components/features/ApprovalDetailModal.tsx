"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Receipt,
  User,
  Wrench,
  X,
} from "lucide-react";
import type {
  ApplicantRecord,
  ApprovalItem,
  BookingRecord,
  DepositRefundRecord,
  ExpenseRecord,
  MaintenanceTicket,
  PaymentRecord,
  StaffAttendanceLogEntry,
  StoredPhoto,
  SystemUser,
} from "@/lib/mock/dashboard";
import StatusBadge from "@/components/common/StatusBadge";
import { formatBookingCode } from "@/lib/utils/bookings";

interface ApprovalDetailModalProps {
  item: ApprovalItem | null;
  onClose: () => void;
  onDecide: (approvalId: string, decision: "Approved" | "Rejected") => Promise<void> | void;
  bookings: BookingRecord[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  refunds: DepositRefundRecord[];
  tickets: MaintenanceTicket[];
  applicants: ApplicantRecord[];
  users: SystemUser[];
  staffAttendanceLogs: StaffAttendanceLogEntry[];
}

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] px-3.5 py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7A8291]">
        {label}
      </div>
      <div className="text-[13.5px] font-bold text-[#0B2A5B] mt-0.5 break-words">{value}</div>
    </div>
  );
}

export default function ApprovalDetailModal({
  item,
  onClose,
  onDecide,
  bookings,
  payments,
  expenses,
  refunds,
  tickets,
  applicants,
  users,
  staffAttendanceLogs,
}: ApprovalDetailModalProps) {
  const [ticketPhotos, setTicketPhotos] = useState<StoredPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<StoredPhoto | null>(null);
  const [submitting, setSubmitting] = useState<"Approved" | "Rejected" | null>(null);

  const refNo = item?.referenceNo || "";
  const refUpper = refNo.toUpperCase();

  const linkedTicket =
    item && (item.type === "Repair Cost" || item.type === "Hall Block")
      ? tickets.find((t) => t.ticketNo === refNo || t.id === refNo)
      : undefined;

  const linkedBooking =
    item &&
    (item.type === "Booking" ||
      item.type === "Free Hall Use" ||
      item.type === "Booking Cancellation")
      ? bookings.find((b) => b.receiptNo === refNo || b.id === refNo)
      : undefined;

  const linkedRefund =
    item && item.type === "Deposit Refund"
      ? refunds.find((r) => r.bookingReceiptNo === refNo || r.id === refNo)
      : undefined;

  const linkedRefundBooking = linkedRefund
    ? bookings.find((b) => b.receiptNo === linkedRefund.bookingReceiptNo)
    : undefined;

  const linkedPayment =
    item && item.type === "Record Payment"
      ? payments.find((p) => p.receiptNo === refNo || p.id === refNo)
      : undefined;

  const linkedExpense =
    item && item.type === "Expense"
      ? expenses.find((e) => e.id.toUpperCase() === refUpper || e.id === refNo)
      : undefined;

  const linkedUser =
    item && (item.type === "User Access" || item.type === "Password Reset")
      ? users.find((u) => u.userId.toLowerCase() === refNo.toLowerCase() || u.id === refNo)
      : undefined;

  const linkedAttendance =
    item && item.type === "Attendance Override"
      ? staffAttendanceLogs.find((l) => l.id === refNo)
      : undefined;

  const linkedApplicant =
    item && item.type === "Customer Edit"
      ? applicants.find((a) => a.customerCode === refNo || a.id === refNo)
      : undefined;

  // Lazy-load attached ticket photos whenever Admin opens a Repair Cost / Hall Block approval
  useEffect(() => {
    setPreviewPhoto(null);
    if (!linkedTicket) {
      setTicketPhotos([]);
      return;
    }

    const inline: StoredPhoto[] = (linkedTicket.photos || []).filter(
      (p): p is StoredPhoto =>
        typeof p === "object" &&
        p !== null &&
        typeof p.dataUrl === "string" &&
        p.dataUrl.startsWith("data:image/")
    );
    if (inline.length > 0) {
      setTicketPhotos(inline);
      return;
    }

    const photoCount = linkedTicket.photoCount ?? linkedTicket.photos?.length ?? 0;
    if (photoCount <= 0) {
      setTicketPhotos([]);
      return;
    }

    let cancelled = false;
    setLoadingPhotos(true);
    fetch(`/api/tickets/${encodeURIComponent(linkedTicket.id)}/photos`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const fetched = Array.isArray(data?.photos)
          ? (data.photos as StoredPhoto[]).filter(
              (p) => typeof p?.dataUrl === "string" && p.dataUrl.startsWith("data:image/")
            )
          : [];
        setTicketPhotos(fetched);
      })
      .catch(() => {
        if (!cancelled) setTicketPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPhotos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [linkedTicket?.id, linkedTicket?.photoCount]);

  if (!item) return null;

  const fullPageHref = linkedTicket
    ? "/maintenance"
    : linkedBooking
      ? `/bookings/${linkedBooking.receiptNo}`
      : linkedRefund
        ? `/deposits/${linkedRefund.bookingReceiptNo}`
        : linkedPayment
          ? `/bookings/${linkedPayment.bookingReceiptNo}`
          : linkedExpense
            ? "/payments"
            : linkedUser
              ? "/users"
              : linkedAttendance
                ? "/attendance"
                : linkedApplicant
                  ? `/customers/${linkedApplicant.id}`
                  : null;

  const handleDecision = async (decision: "Approved" | "Rejected") => {
    setSubmitting(decision);
    try {
      await onDecide(item.id, decision);
      onClose();
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Approval details: ${item.title}`}
    >
      <div
        className="bg-white rounded-2xl border border-[#EFE4CC] shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#EFE4CC] flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5D9BF] text-[#0B2A5B]">
                {item.type}
              </span>
              <StatusBadge status={item.status} />
              {item.referenceNo && (
                <span className="text-[11.5px] font-semibold text-[#5B6474]">
                  Ref: {item.referenceNo}
                </span>
              )}
            </div>
            <h2 className="text-[18px] font-extrabold text-[#0B2A5B] leading-snug">
              {item.title}
            </h2>
            <p className="text-[12.5px] text-[#5B6474]">{item.detail}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close approval details"
            className="w-9 h-9 rounded-xl bg-white border border-[#EFE4CC] text-[#0B2A5B] hover:border-[#E2B544] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Request Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DetailRow label="Amount / Impact" value={item.amountLabel} />
            <DetailRow label="Requested By" value={item.requester} />
            <DetailRow label="Current Status" value={item.status} />
          </div>

          {/* 1. Maintenance Ticket (Repair Cost / Hall Block) */}
          {linkedTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0B2A5B] uppercase tracking-wide">
                <Wrench className="w-4 h-4 text-[#C9971C]" />
                <span>Maintenance Ticket Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Ticket Number" value={linkedTicket.ticketNo} />
                <DetailRow label="Ticket Status" value={linkedTicket.status} />
                <DetailRow
                  label="Category"
                  value={
                    linkedTicket.subCategory
                      ? `${linkedTicket.category} · ${linkedTicket.subCategory}`
                      : linkedTicket.category
                  }
                />
                <DetailRow label="Location" value={linkedTicket.location} />
                <DetailRow label="Priority" value={linkedTicket.priority} />
                <DetailRow
                  label="Estimated Cost"
                  value={`₹${linkedTicket.estimatedCost.toLocaleString("en-IN")}`}
                />
                <DetailRow label="Raised By" value={linkedTicket.raisedBy} />
                <DetailRow label="Date Raised" value={linkedTicket.dateLabel} />
              </div>

              {linkedTicket.description && (
                <div className="rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] p-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7A8291] mb-1">
                    Issue Description
                  </div>
                  <p className="text-[13.5px] text-[#14213D] whitespace-pre-wrap">
                    {linkedTicket.description}
                  </p>
                </div>
              )}

              {linkedTicket.blockHall && (
                <div className="rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] p-3.5 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#6D28D9] mt-0.5 shrink-0" />
                  <div className="text-[13px] text-[#4C1D95]">
                    <span className="font-bold">Hall Calendar Block Requested: </span>
                    {linkedTicket.blockDateISO || "Scheduled date"}
                    {linkedTicket.blockFrom || linkedTicket.blockTo
                      ? ` (${linkedTicket.blockFrom || "Start"} – ${linkedTicket.blockTo || "End"})`
                      : ""}
                  </div>
                </div>
              )}

              {/* Vendor Quotations */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#0B2A5B]">
                  <FileText className="w-3.5 h-3.5 text-[#C9971C]" />
                  <span>Vendor Quotations ({linkedTicket.quotations?.length || 0})</span>
                </div>
                {linkedTicket.quotations && linkedTicket.quotations.length > 0 ? (
                  <div className="rounded-xl border border-[#EFE4CC] overflow-hidden">
                    <table className="w-full text-[13px]">
                      <thead className="bg-[#FAF7F2] text-[#5B6474] text-left">
                        <tr>
                          <th className="px-3.5 py-2 font-semibold">Vendor</th>
                          <th className="px-3.5 py-2 font-semibold">Reference / File</th>
                          <th className="px-3.5 py-2 font-semibold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE4CC]">
                        {linkedTicket.quotations.map((q) => (
                          <tr key={q.id}>
                            <td className="px-3.5 py-2 font-semibold text-[#0B2A5B]">{q.vendor}</td>
                            <td className="px-3.5 py-2 text-[#5B6474]">{q.fileName || "—"}</td>
                            <td className="px-3.5 py-2 font-bold text-[#0B2A5B] text-right">
                              ₹{Number(q.amount || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[12.5px] text-[#7A8291] italic">
                    No vendor quotations attached to this ticket.
                  </p>
                )}
              </div>

              {/* Ticket Photos */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#0B2A5B]">
                  <ImageIcon className="w-3.5 h-3.5 text-[#C9971C]" />
                  <span>
                    Attached Photos ({linkedTicket.photoCount ?? ticketPhotos.length})
                  </span>
                </div>
                {loadingPhotos ? (
                  <div className="flex items-center gap-2 text-[12.5px] text-[#5B6474] py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B2A5B]" />
                    <span>Loading photos...</span>
                  </div>
                ) : ticketPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ticketPhotos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPreviewPhoto(p)}
                        className="group relative rounded-xl overflow-hidden border border-[#EFE4CC] bg-[#FAF7F2] aspect-[4/3] cursor-pointer text-left"
                      >
                        <img
                          src={p.dataUrl}
                          alt={p.name || "Maintenance photo"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10.5px] text-white truncate">
                          {p.name} · {p.sizeKb} KB
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12.5px] text-[#7A8291] italic">
                    No photos uploaded for this ticket.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 2. Booking / Free Hall Use / Booking Cancellation */}
          {linkedBooking && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0B2A5B] uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-[#C9971C]" />
                <span>Booking Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Booking Code" value={formatBookingCode(linkedBooking.receiptNo)} />
                <DetailRow label="Booking Status" value={linkedBooking.status} />
                <DetailRow label="Event" value={`${linkedBooking.eventTitle} (${linkedBooking.eventType})`} />
                <DetailRow label="Applicant" value={`${linkedBooking.applicantName} · ${linkedBooking.phone}`} />
                <DetailRow
                  label="Hall & AC"
                  value={`${linkedBooking.hall} · ${linkedBooking.isAC ? "With AC" : "Non-AC"}`}
                />
                <DetailRow
                  label="Event Date & Timing"
                  value={`${linkedBooking.dateLabel}${linkedBooking.endDateISO && linkedBooking.endDateISO !== linkedBooking.dateISO ? ` → ${linkedBooking.endDateISO}` : ""} · ${linkedBooking.timing}`}
                />
                <DetailRow label="Expected Guests" value={`${linkedBooking.guests} guests`} />
                <DetailRow
                  label="Hall Rent"
                  value={
                    linkedBooking.isFreeUse
                      ? "₹0 (Free Community Use)"
                      : `₹${linkedBooking.rent.toLocaleString("en-IN")}`
                  }
                />
                <DetailRow
                  label="Security Deposit"
                  value={`₹${linkedBooking.deposit.toLocaleString("en-IN")}`}
                />
                <DetailRow
                  label="Paid / Balance"
                  value={`₹${linkedBooking.paid.toLocaleString("en-IN")} paid · ₹${Math.max(0, linkedBooking.rent + linkedBooking.deposit - linkedBooking.paid).toLocaleString("en-IN")} due`}
                />
                {linkedBooking.electricityRatePerUnit !== undefined && (
                  <DetailRow
                    label="Electricity Rate"
                    value={
                      linkedBooking.electricityWaived
                        ? "Waived"
                        : `₹${linkedBooking.electricityRatePerUnit}/unit`
                    }
                  />
                )}
                {linkedBooking.paymentMode && (
                  <DetailRow label="Payment Mode" value={linkedBooking.paymentMode} />
                )}
              </div>
              {linkedBooking.notes && (
                <DetailRow label="Booking Notes" value={linkedBooking.notes} />
              )}
              {linkedBooking.cancellationReason && (
                <DetailRow label="Cancellation Reason" value={linkedBooking.cancellationReason} />
              )}
            </div>
          )}

          {/* 3. Deposit Refund */}
          {linkedRefund && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0B2A5B] uppercase tracking-wide">
                <Receipt className="w-4 h-4 text-[#C9971C]" />
                <span>Deposit Refund Breakdown</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow
                  label="Booking"
                  value={`${formatBookingCode(linkedRefund.bookingReceiptNo)} · ${linkedRefund.eventTitle}`}
                />
                <DetailRow label="Applicant" value={linkedRefund.applicantName} />
                <DetailRow label="Event Date" value={linkedRefund.eventDate} />
                <DetailRow label="Refund Status" value={linkedRefund.status} />
                <DetailRow
                  label="Held Deposit"
                  value={`₹${linkedRefund.heldAmount.toLocaleString("en-IN")}`}
                />
                <DetailRow
                  label="Total Deductions"
                  value={`₹${linkedRefund.deductionAmount.toLocaleString("en-IN")}`}
                />
                <DetailRow
                  label="Net Refund Payable"
                  value={`₹${Math.max(0, linkedRefund.heldAmount - linkedRefund.deductionAmount).toLocaleString("en-IN")}`}
                />
                <DetailRow
                  label="Refund Mode"
                  value={`${linkedRefund.refundMode}${linkedRefund.upiOrAccount ? ` (${linkedRefund.upiOrAccount})` : ""}`}
                />
              </div>

              {linkedRefundBooking &&
                linkedRefundBooking.meterOpeningUnit !== undefined &&
                linkedRefundBooking.meterClosingUnit !== undefined && (
                  <DetailRow
                    label="Electricity Meter Reading"
                    value={`Opening ${linkedRefundBooking.meterOpeningUnit} → Closing ${linkedRefundBooking.meterClosingUnit} (${Math.max(0, linkedRefundBooking.meterClosingUnit - linkedRefundBooking.meterOpeningUnit)} units @ ₹${linkedRefundBooking.electricityRatePerUnit ?? 12}/unit)`}
                  />
                )}

              {linkedRefund.deductionItems && linkedRefund.deductionItems.length > 0 && (
                <div className="rounded-xl border border-[#EFE4CC] overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#FAF7F2] text-[#5B6474] text-left">
                      <tr>
                        <th className="px-3.5 py-2 font-semibold">Deduction Item</th>
                        <th className="px-3.5 py-2 font-semibold">Location / Detail</th>
                        <th className="px-3.5 py-2 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE4CC]">
                      {linkedRefund.deductionItems.map((d) => (
                        <tr key={d.id}>
                          <td className="px-3.5 py-2 font-semibold text-[#0B2A5B]">{d.item}</td>
                          <td className="px-3.5 py-2 text-[#5B6474]">
                            {d.location} {d.photosCount > 0 ? `· ${d.photosCount} photo(s)` : ""}
                          </td>
                          <td className="px-3.5 py-2 font-bold text-[#C62828] text-right">
                            ₹{Number(d.amount || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {linkedRefund.deductionNote && (
                <DetailRow label="Deduction Note" value={linkedRefund.deductionNote} />
              )}
              {linkedRefund.remarks && <DetailRow label="Remarks" value={linkedRefund.remarks} />}
            </div>
          )}

          {/* 4. Record Payment */}
          {linkedPayment && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0B2A5B] uppercase tracking-wide">
                <Receipt className="w-4 h-4 text-[#C9971C]" />
                <span>Payment Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Payment Receipt" value={linkedPayment.receiptNo} />
                <DetailRow
                  label="Booking"
                  value={`${formatBookingCode(linkedPayment.bookingReceiptNo)} · ${linkedPayment.eventTitle}`}
                />
                <DetailRow label="Applicant" value={linkedPayment.applicantName} />
                <DetailRow label="Payment Type" value={linkedPayment.type} />
                <DetailRow
                  label="Amount"
                  value={`₹${linkedPayment.amount.toLocaleString("en-IN")}`}
                />
                <DetailRow
                  label="Mode & Reference"
                  value={`${linkedPayment.mode}${linkedPayment.reference ? ` · ${linkedPayment.reference}` : ""}`}
                />
                <DetailRow label="Date" value={linkedPayment.dateLabel} />
              </div>
            </div>
          )}

          {/* 5. Expense */}
          {linkedExpense && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0B2A5B] uppercase tracking-wide">
                <Receipt className="w-4 h-4 text-[#C9971C]" />
                <span>Expense Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Title" value={linkedExpense.title} />
                <DetailRow label="Category" value={linkedExpense.category} />
                <DetailRow
                  label="Amount"
                  value={`₹${linkedExpense.amount.toLocaleString("en-IN")}`}
                />
                <DetailRow label="Paid To" value={linkedExpense.paidTo} />
                <DetailRow label="Date" value={linkedExpense.dateLabel} />
                <DetailRow label="Status" value={linkedExpense.status} />
              </div>
            </div>
          )}

          {/* 6. User Access / Password Reset */}
          {linkedUser && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0B2A5B] uppercase tracking-wide">
                <User className="w-4 h-4 text-[#C9971C]" />
                <span>User Account Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Full Name" value={linkedUser.name} />
                <DetailRow label="User ID" value={linkedUser.userId} />
                <DetailRow label="Role" value={linkedUser.role} />
                <DetailRow label="Account Active" value={linkedUser.active ? "Active" : "Inactive"} />
                <DetailRow label="Approval Status" value={linkedUser.approvalStatus || "Pending"} />
                <DetailRow label="Last Login" value={linkedUser.lastLogin} />
              </div>
            </div>
          )}

          {/* 7. Attendance Override */}
          {linkedAttendance && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0B2A5B] uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-[#C9971C]" />
                <span>Attendance Override Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Staff Name" value={`${linkedAttendance.name} (${linkedAttendance.roleTitle})`} />
                <DetailRow label="Date" value={linkedAttendance.dateISO} />
                <DetailRow label="Check-In" value={linkedAttendance.checkInTime} />
                <DetailRow label="Check-Out" value={linkedAttendance.checkOutTime} />
                <DetailRow
                  label="Geo-Fence Verified"
                  value={linkedAttendance.geoVerified ? "Inside Geo-Fence" : "Outside Geo-Fence"}
                />
                <DetailRow label="Attendance Status" value={linkedAttendance.status} />
              </div>
            </div>
          )}

          {/* 8. Customer Edit */}
          {linkedApplicant && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0B2A5B] uppercase tracking-wide">
                <User className="w-4 h-4 text-[#C9971C]" />
                <span>Customer Profile</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Customer Name" value={linkedApplicant.name} />
                <DetailRow label="Phone" value={linkedApplicant.phone} />
                <DetailRow label="Address" value={linkedApplicant.address} />
                <DetailRow label="ID Proof" value={linkedApplicant.idProofMasked} />
              </div>
              {linkedApplicant.notes && <DetailRow label="Notes" value={linkedApplicant.notes} />}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#EFE4CC] flex flex-wrap items-center justify-between gap-3">
          {fullPageHref ? (
            <Link
              href={fullPageHref}
              onClick={onClose}
              className="text-[13px] font-bold text-[#0B2A5B] hover:text-[#C9971C] inline-flex items-center gap-1.5"
            >
              <span>Open Full Record</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2.5">
            {item.status === "Pending" ? (
              <>
                <button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => handleDecision("Rejected")}
                  style={{ minHeight: "40px" }}
                  className="interactive-btn px-4 py-2 rounded-xl bg-white border border-red-300 text-[#C62828] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <X className="w-4 h-4" />
                  <span>{submitting === "Rejected" ? "Rejecting..." : "Reject"}</span>
                </button>
                <button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => handleDecision("Approved")}
                  style={{ minHeight: "40px" }}
                  className="interactive-btn px-4 py-2 rounded-xl bg-[#15803D] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting === "Approved" ? "Approving..." : "Approve"}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                style={{ minHeight: "40px" }}
                className="interactive-btn px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-bold cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for ticket photo preview */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewPhoto(null);
          }}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              aria-label="Close photo preview"
              className="self-end w-9 h-9 rounded-full bg-white/90 text-[#0B2A5B] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto.dataUrl}
              alt={previewPhoto.name || "Photo preview"}
              className="max-w-full max-h-[80vh] rounded-xl object-contain"
            />
            <div className="text-[12px] text-white/90 font-medium">
              {previewPhoto.name} · {previewPhoto.sizeKb} KB
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
