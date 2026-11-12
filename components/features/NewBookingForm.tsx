"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import type { BookingRecord, BookingStatus, HallName, PaymentMode } from "@/lib/mock/dashboard";
import {
  AC_SURCHARGE_PER_FLOOR,
  BASE_RENT_PER_FLOOR,
  DEFAULT_SECURITY_DEPOSIT,
  EVENT_TYPES,
  HALL_OPTIONS,
  countBookingDays,
  dateRangesOverlap,
  formatShortDate,
  getFloorCount,
  hallsConflict,
  isDateInRange,
} from "@/lib/utils/bookings";

interface NewBookingFormProps {
  editBooking?: BookingRecord;
  initialDateISO?: string;
  initialHall?: HallName;
  initialCustomerId?: string;
  onSaved?: (receiptNo: string) => void;
}

function splitTiming(timing: string): { startTime: string; endTime: string } {
  const parts = timing.split(/–|-/).map((p) => p.trim());
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { startTime: parts[0], endTime: parts[1] };
  }
  return { startTime: "10:00 AM", endTime: "10:00 PM" };
}

function addOneDayISO(iso: string): string {
  const dt = new Date(`${iso}T00:00:00`);
  dt.setDate(dt.getDate() + 1);
  return dt.toISOString().slice(0, 10);
}

export default function NewBookingForm({
  editBooking,
  initialDateISO,
  initialHall,
  initialCustomerId,
  onSaved,
}: NewBookingFormProps) {
  const router = useRouter();
  const { applicants, bookings, tickets, addBooking, updateBooking, addApplicant } = useDashboard();

  const isEdit = Boolean(editBooking);
  const initialTimes = splitTiming(editBooking?.timing || "10:00 AM – 10:00 PM");

  const initialCustomer = initialCustomerId
    ? applicants.find((a) => a.id === initialCustomerId)
    : undefined;

  const [customerName, setCustomerName] = useState(
    editBooking?.applicantName || initialCustomer?.name || ""
  );

  const isPresetEventType = (val?: string) =>
    Boolean(val && EVENT_TYPES.includes(val as (typeof EVENT_TYPES)[number]) && val !== "Others");

  const [eventType, setEventType] = useState(
    editBooking?.eventType
      ? isPresetEventType(editBooking.eventType)
        ? editBooking.eventType
        : "Others"
      : "Wedding"
  );
  const [customOccasion, setCustomOccasion] = useState(
    editBooking?.eventType && !isPresetEventType(editBooking.eventType)
      ? editBooking.eventType === "Others"
        ? ""
        : editBooking.eventType
      : ""
  );
  const [hall, setHall] = useState<HallName>(
    editBooking?.hall || initialHall || "Ground + First Floor"
  );
  const [isAC, setIsAC] = useState(editBooking ? editBooking.isAC : true);
  const [guests, setGuests] = useState(editBooking?.guests ?? 250);

  const defaultStartISO = editBooking?.dateISO || initialDateISO || "2026-10-30";
  const [dateISO, setDateISO] = useState(defaultStartISO);
  const [isMultiDay, setIsMultiDay] = useState(
    Boolean(editBooking?.endDateISO && editBooking.endDateISO > editBooking.dateISO)
  );
  const [endDateISO, setEndDateISO] = useState(
    editBooking?.endDateISO || addOneDayISO(defaultStartISO)
  );
  const [startTime, setStartTime] = useState(initialTimes.startTime);
  const [endTime, setEndTime] = useState(initialTimes.endTime);

  const initialEditDays = editBooking
    ? countBookingDays(editBooking.dateISO, editBooking.endDateISO)
    : 1;
  const initialEditFloors = editBooking ? getFloorCount(editBooking.hall) : 2;
  const initialEditStdAc =
    editBooking?.isAC ? initialEditFloors * AC_SURCHARGE_PER_FLOOR * initialEditDays : 0;
  const initialManualAc =
    editBooking?.isFreeUse && editBooking.isAC
      ? editBooking.rent >= initialEditStdAc
        ? initialEditStdAc
        : editBooking.rent
      : 0;
  const initialManualHall =
    editBooking?.isFreeUse ? Math.max(0, editBooking.rent - initialManualAc) : 0;

  const [isFreeUse, setIsFreeUse] = useState(Boolean(editBooking?.isFreeUse));
  const [manualHallRent, setManualHallRent] = useState(initialManualHall);
  const [manualAcCharge, setManualAcCharge] = useState(initialManualAc);
  const [manualDeposit, setManualDeposit] = useState(
    editBooking?.isFreeUse ? editBooking.deposit : 0
  );
  const [paid, setPaid] = useState(editBooking?.paid ?? 5000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(editBooking?.paymentMode || "UPI");
  const [status, setStatus] = useState<BookingStatus>(editBooking?.status || "Pending");
  const [notes, setNotes] = useState(editBooking?.notes || "");

  const [savedReceipt, setSavedReceipt] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showAdvanceErrorDialog, setShowAdvanceErrorDialog] = useState(false);

  const effectiveEndISO = isMultiDay && endDateISO >= dateISO ? endDateISO : undefined;
  const totalDays = countBookingDays(dateISO, effectiveEndISO);

  const hallAvailability = useMemo(() => {
    return HALL_OPTIONS.map((optionHall) => {
      const bookingClash = bookings.find(
        (b) =>
          b.id !== editBooking?.id &&
          b.status !== "Cancelled" &&
          hallsConflict(b.hall, optionHall) &&
          dateRangesOverlap(dateISO, effectiveEndISO, b.dateISO, b.endDateISO)
      );
      const maintenanceClash = tickets.find(
        (t) =>
          t.blockHall &&
          t.blockDateISO &&
          hallsConflict(t.location, optionHall) &&
          isDateInRange(t.blockDateISO, dateISO, effectiveEndISO)
      );

      if (bookingClash) {
        return {
          hall: optionHall,
          available: false,
          note: `Booked · ${bookingClash.eventTitle} (${bookingClash.timing})`,
        };
      }
      if (maintenanceClash) {
        return {
          hall: optionHall,
          available: false,
          note: `Maintenance · ${maintenanceClash.ticketNo}`,
        };
      }
      return {
        hall: optionHall,
        available: true,
        note: totalDays > 1 ? `Available all ${totalDays} days` : "Available",
      };
    });
  }, [bookings, tickets, editBooking?.id, dateISO, effectiveEndISO, totalDays]);

  const selectedHallStatus = hallAvailability.find((h) => h.hall === hall);

  const floorCount = getFloorCount(hall);
  const fixedHallRent = floorCount * BASE_RENT_PER_FLOOR * Math.max(1, totalDays);
  const fixedAcCharge = isAC
    ? floorCount * AC_SURCHARGE_PER_FLOOR * Math.max(1, totalDays)
    : 0;
  const effectiveHallRent = isFreeUse ? Number(manualHallRent || 0) : fixedHallRent;
  const effectiveAcCharge = isFreeUse ? Number(manualAcCharge || 0) : fixedAcCharge;
  const effectiveRent = effectiveHallRent + effectiveAcCharge;
  const effectiveDeposit = isFreeUse ? Number(manualDeposit || 0) : DEFAULT_SECURITY_DEPOSIT;
  const effectivePaid = Number(paid || 0);
  const totalCharge = effectiveRent + effectiveDeposit;
  const hasExcessAdvance = effectivePaid > totalCharge;
  const balanceDue = Math.max(0, totalCharge - effectivePaid);

  const dateRangeLabel = useMemo(() => {
    if (effectiveEndISO && effectiveEndISO > dateISO) {
      return `${formatShortDate(dateISO)} – ${formatShortDate(effectiveEndISO)}`;
    }
    return formatShortDate(dateISO);
  }, [dateISO, effectiveEndISO]);

  const handleToggleFreeUse = (checked: boolean) => {
    setIsFreeUse(checked);
    if (checked) {
      setStatus("Awaiting approval");
      setManualHallRent(0);
      setManualAcCharge(0);
      setManualDeposit(0);
      setPaid(0);
    } else if (status === "Awaiting approval") {
      setStatus("Pending");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!dateISO) {
      setFormError("Please select a start date.");
      return;
    }
    if (isMultiDay && endDateISO < dateISO) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }

    const resolvedEventType =
      eventType === "Others" ? customOccasion.trim() : eventType;

    if (!resolvedEventType) {
      setFormError("Please enter the name of the occasion.");
      return;
    }

    const trimmedCustomerName = customerName.trim();
    if (!trimmedCustomerName) {
      setFormError("Please enter the customer's name.");
      return;
    }

    if (effectivePaid > totalCharge) {
      setShowAdvanceErrorDialog(true);
      setFormError(
        `Advance paid (₹${effectivePaid.toLocaleString("en-IN")}) cannot exceed the total booking amount (₹${totalCharge.toLocaleString("en-IN")}).`
      );
      return;
    }

    const matchedApplicant = applicants.find(
      (a) => a.name.trim().toLowerCase() === trimmedCustomerName.toLowerCase()
    );

    let applicantId = "";
    let applicantName = trimmedCustomerName;
    let phone = "";

    if (
      editBooking &&
      trimmedCustomerName.toLowerCase() === editBooking.applicantName.trim().toLowerCase()
    ) {
      applicantId = editBooking.applicantId;
      applicantName = editBooking.applicantName;
      phone = editBooking.phone;
    } else if (matchedApplicant) {
      applicantId = matchedApplicant.id;
      applicantName = matchedApplicant.name;
      phone = matchedApplicant.phone;
    } else {
      const createdApplicant = addApplicant({
        name: trimmedCustomerName,
        phone: "",
        address: "Dhari, Gujarat",
        idProofMasked: "Verified at office",
        notes: "",
      });
      applicantId = createdApplicant.id;
      applicantName = createdApplicant.name;
      phone = createdApplicant.phone;
    }

    const formattedStart = formatShortDate(dateISO);
    const dateLabel =
      effectiveEndISO && effectiveEndISO > dateISO
        ? `${dateISO.slice(8, 10)}–${formatShortDate(effectiveEndISO)}`
        : formattedStart;
    const combinedTiming = `${startTime.trim() || "10:00 AM"} – ${endTime.trim() || "10:00 PM"}`;
    const baseTitle =
      totalDays > 1 ? `${resolvedEventType} (${totalDays} days)` : resolvedEventType;
    const eventTitle = isFreeUse
      ? `${baseTitle} (${effectiveRent === 0 ? "free use" : "trustee"})`
      : baseTitle;

    const payload = {
      eventTitle,
      eventType: resolvedEventType,
      applicantId,
      applicantName,
      phone,
      hall,
      isAC: isFreeUse ? isAC || effectiveAcCharge > 0 : isAC,
      dateISO,
      endDateISO: effectiveEndISO,
      dateLabel,
      timing: combinedTiming,
      guests: Number(guests || 100),
      rent: effectiveRent,
      deposit: effectiveDeposit,
      paid: effectivePaid,
      status,
      isFreeUse,
      notes: notes.trim(),
      paymentMode,
    };

    if (editBooking) {
      updateBooking(editBooking.id, payload);
      setSavedReceipt(editBooking.receiptNo);
      onSaved?.(editBooking.receiptNo);
    } else {
      const created = addBooking(payload);
      setSavedReceipt(created.receiptNo);
      onSaved?.(created.receiptNo);
    }
  };

  if (savedReceipt) {
    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #BBF7D0",
          borderRadius: "20px",
          padding: "32px 24px",
        }}
        className="text-center max-w-lg mx-auto animate-check-pop shadow-sm"
      >
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2 style={{ color: "#0B2A5B", fontSize: "20px", fontWeight: 700 }}>
          {isEdit ? `Booking Updated (#${savedReceipt})` : `Booking Saved (#${savedReceipt})`}
        </h2>
        <p style={{ color: "#5B6474", fontSize: "14px" }} className="mt-1.5">
          {isEdit
            ? "All changes have been saved and logged in the activity history."
            : "The booking is now listed in Bookings and shown on the Calendar."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.push(`/bookings/${savedReceipt}`)}
            style={{
              minHeight: "44px",
              background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
              color: "#FFFFFF",
              borderRadius: "12px",
            }}
            className="interactive-btn px-5 py-2 text-[13.5px] font-semibold cursor-pointer"
          >
            View Booking #{savedReceipt}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isEdit) {
                router.push("/bookings");
              } else {
                setSavedReceipt(null);
              }
            }}
            style={{
              minHeight: "44px",
              backgroundColor: "#FAF5EB",
              border: "1px solid #E2B544",
              color: "#0B2A5B",
              borderRadius: "12px",
            }}
            className="interactive-btn px-5 py-2 text-[13.5px] font-semibold cursor-pointer"
          >
            {isEdit ? "Back to Bookings" : "Add Another Booking"}
          </button>
        </div>
      </div>
    );
  }

  const eventTypeField = (
    <div>
      <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
        Event Type *
      </label>
      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        style={{ minHeight: "44px" }}
        className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] text-[#0B2A5B] font-medium focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
      >
        {EVENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {eventType === "Others" && (
        <div className="mt-2.5 animate-tab-enter">
          <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
            Name of Occasion *
          </label>
          <input
            type="text"
            required
            value={customOccasion}
            onChange={(e) => setCustomOccasion(e.target.value)}
            placeholder="e.g. Aqiqah, Naming Ceremony, Majlis..."
            style={{ minHeight: "44px" }}
            className="w-full rounded-xl border border-[#E2B544] bg-[#FFFDF7] px-3.5 text-[13.5px] text-[#0B2A5B] font-medium focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
          />
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT COLUMN — FORM CARDS */}
      <div className="lg:col-span-8 space-y-5">
        {formError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#C62828] text-[13px] font-semibold animate-check-pop">
            {formError}
          </div>
        )}

        {/* 1. Customer & Event */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid rgba(226, 181, 68, 0.35)",
            borderRadius: "18px",
            padding: "22px",
          }}
          className="animate-fade-up stagger-1 space-y-4"
        >
          <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
            Customer & Event
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer full name"
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] text-[#0B2A5B] font-medium focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            {eventTypeField}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                Hall / Venue *
              </label>
              <select
                value={hall}
                onChange={(e) => setHall(e.target.value as HallName)}
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] text-[#0B2A5B] font-medium focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                {HALL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                Expected Guests
              </label>
              <input
                type="number"
                min={10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0B2A5B] cursor-pointer">
              <input
                type="checkbox"
                checked={isAC}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsAC(checked);
                  if (isFreeUse && !checked) {
                    setManualAcCharge(0);
                  }
                }}
                className="w-4 h-4 accent-[#0B2A5B] rounded"
              />
              <span>
                With A.C. (+₹{(floorCount * AC_SURCHARGE_PER_FLOOR).toLocaleString("en-IN")})
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0B2A5B] cursor-pointer">
              <input
                type="checkbox"
                checked={isFreeUse}
                onChange={(e) => handleToggleFreeUse(e.target.checked)}
                className="w-4 h-4 accent-[#0B2A5B] rounded"
              />
              <span>Free Community / Trustee Use (₹0 · manual pricing)</span>
            </label>
          </div>
        </section>

        {/* 2. Date & Time */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid rgba(226, 181, 68, 0.35)",
            borderRadius: "18px",
            padding: "22px",
          }}
          className="animate-fade-up stagger-2 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
              Date & Time
            </h2>
            <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0B2A5B] cursor-pointer">
              <input
                type="checkbox"
                checked={isMultiDay}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsMultiDay(checked);
                  if (checked && endDateISO <= dateISO) {
                    setEndDateISO(addOneDayISO(dateISO));
                  }
                }}
                className="w-4 h-4 accent-[#0B2A5B] rounded"
              />
              <span>Multi-day booking</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={dateISO}
                onChange={(e) => {
                  const next = e.target.value;
                  setDateISO(next);
                  if (isMultiDay && endDateISO < next) {
                    setEndDateISO(addOneDayISO(next));
                  }
                }}
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            {isMultiDay && (
              <div>
                <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  min={dateISO}
                  value={endDateISO}
                  onChange={(e) => setEndDateISO(e.target.value)}
                  style={{ minHeight: "44px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
            )}

            <div>
              <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00 AM"
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:00 PM"
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
          </div>

          {/* Mobile inline availability status banner (matches 5.7) */}
          {selectedHallStatus && (
            <div
              className={`lg:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold border ${
                selectedHallStatus.available
                  ? "bg-[#ECFDF5] border-[#BBF7D0] text-[#15803D]"
                  : "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]"
              }`}
            >
              {selectedHallStatus.available ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>
                {selectedHallStatus.hall}: {selectedHallStatus.note}
              </span>
            </div>
          )}
        </section>

        {/* 3. Charges & Payment */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid rgba(226, 181, 68, 0.35)",
            borderRadius: "18px",
            padding: "22px",
          }}
          className="animate-fade-up stagger-3 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
              Charges & Payment
            </h2>
            {isFreeUse ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-[11.5px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Manual pricing · Admin approval required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF5EB] border border-[#EFE4CC] text-[#5B6474] text-[11.5px] font-semibold">
                <Lock className="w-3 h-3" />
                <span>Fixed pricing</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="flex items-center gap-1 text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                {!isFreeUse && <Lock className="w-3 h-3 text-[#5B6474]" />}
                <span>Hall Rent (₹)</span>
              </label>
              <input
                type="number"
                min={0}
                disabled={!isFreeUse}
                placeholder="0"
                value={isFreeUse ? (manualHallRent === 0 ? "" : manualHallRent) : effectiveHallRent}
                onChange={(e) => setManualHallRent(Math.max(0, Number(e.target.value || 0)))}
                onBlur={() => {
                  if (effectivePaid > totalCharge) setShowAdvanceErrorDialog(true);
                }}
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-bold text-[#0B2A5B] disabled:bg-[#F3EFE6] disabled:text-[#0B2A5B]/80 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                {!isFreeUse && <Lock className="w-3 h-3 text-[#5B6474]" />}
                <span>A.C. Charges (₹)</span>
              </label>
              <input
                type="number"
                min={0}
                disabled={!isFreeUse}
                placeholder="0"
                value={isFreeUse ? (manualAcCharge === 0 ? "" : manualAcCharge) : effectiveAcCharge}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value || 0));
                  setManualAcCharge(val);
                  if (val > 0 && !isAC) setIsAC(true);
                }}
                onBlur={() => {
                  if (effectivePaid > totalCharge) setShowAdvanceErrorDialog(true);
                }}
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-bold text-[#0B2A5B] disabled:bg-[#F3EFE6] disabled:text-[#0B2A5B]/80 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                {!isFreeUse && <Lock className="w-3 h-3 text-[#5B6474]" />}
                <span>Security Deposit (₹)</span>
              </label>
              <input
                type="number"
                min={0}
                disabled={!isFreeUse}
                placeholder="0"
                value={isFreeUse ? (manualDeposit === 0 ? "" : manualDeposit) : effectiveDeposit}
                onChange={(e) => setManualDeposit(Math.max(0, Number(e.target.value || 0)))}
                onBlur={() => {
                  if (effectivePaid > totalCharge) setShowAdvanceErrorDialog(true);
                }}
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-bold text-[#0B2A5B] disabled:bg-[#F3EFE6] disabled:text-[#0B2A5B]/80 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                {isEdit ? "Paid So Far (₹)" : "Advance Paid (₹)"}
              </label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={paid === 0 ? "" : paid}
                onChange={(e) => setPaid(Math.max(0, Number(e.target.value || 0)))}
                onBlur={() => {
                  if (effectivePaid > totalCharge) setShowAdvanceErrorDialog(true);
                }}
                style={{ minHeight: "44px" }}
                className={`w-full rounded-xl border bg-[#FAF7F2] px-3.5 text-[14px] font-bold focus:outline-none focus:ring-2 ${
                  hasExcessAdvance
                    ? "border-[#C62828] text-[#C62828] focus:ring-[#C62828]"
                    : "border-[#E5D9BF] text-[#15803D] focus:ring-[#E2B544]"
                }`}
              />
            </div>
          </div>

          {hasExcessAdvance && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#C62828] text-[12.5px] font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Advance paid (₹{effectivePaid.toLocaleString("en-IN")}) cannot exceed total booking
                amount (₹{totalCharge.toLocaleString("en-IN")}).
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] text-[12px] text-[#5B6474]">
            {isFreeUse ? (
              <span>
                Manual pricing unlocked — enter custom amounts for Hall Rent, A.C. Charges, and
                Security Deposit above.
              </span>
            ) : (
              <span>
                {floorCount === 2 ? "Double floor" : "Single floor"} ₹
                {(floorCount * BASE_RENT_PER_FLOOR).toLocaleString("en-IN")}
                {isAC
                  ? ` + A.C. ₹${(floorCount * AC_SURCHARGE_PER_FLOOR).toLocaleString("en-IN")}`
                  : " (Non-A.C.)"}
                {totalDays > 1 ? ` × ${totalDays} days` : ""} + Deposit ₹
                {DEFAULT_SECURITY_DEPOSIT.toLocaleString("en-IN")} ={" "}
                <strong className="text-[#0B2A5B]">
                  ₹{totalCharge.toLocaleString("en-IN")}
                </strong>
                . Check Free Community / Trustee Use above to edit manually.
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                style={{ minHeight: "44px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] text-[#0B2A5B] font-medium focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div className="sm:hidden flex items-center justify-between px-4 py-3 rounded-xl bg-[#FEF5DD] border border-[#F4DD9D]">
              <span className="text-[13px] font-bold text-[#0B2A5B]">Balance Due</span>
              <span className="text-[18px] font-extrabold text-[#0B2A5B]">
                ₹{balanceDue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </section>

        {/* 4. Notes & Special Instructions */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid rgba(226, 181, 68, 0.35)",
            borderRadius: "18px",
            padding: "22px",
          }}
          className="animate-fade-up stagger-4 space-y-3"
        >
          <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
            Notes & Special Instructions
          </h2>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Stage decoration, kitchen access, separate seating, generator backup..."
            className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] p-3.5 text-[13.5px] text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
          />
        </section>
      </div>

      {/* RIGHT COLUMN — LIVE AVAILABILITY + NAVY SUMMARY PANEL */}
      <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-[76px]">
        {/* Live Availability Panel */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid rgba(226, 181, 68, 0.35)",
            borderRadius: "18px",
            padding: "20px",
          }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 style={{ color: "#0B2A5B", fontSize: "15px", fontWeight: 700 }}>
              Availability · {dateRangeLabel}
            </h3>
            <Calendar className="w-4 h-4 text-[#C9971C] shrink-0" />
          </div>

          <div className="space-y-2">
            {hallAvailability.map((item) => {
              const isSelected = item.hall === hall;
              return (
                <div
                  key={item.hall}
                  style={{
                    borderRadius: "12px",
                    padding: "10px 12px",
                  }}
                  className={`flex items-start gap-2.5 text-[12.5px] border transition-all ${
                    item.available
                      ? "bg-[#ECFDF5] border-[#BBF7D0] text-[#14532D]"
                      : "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]"
                  } ${isSelected ? "ring-2 ring-[#0B2A5B]/25" : ""}`}
                >
                  {item.available ? (
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold">
                      {item.hall}
                      {isSelected ? " (Selected)" : ""}
                    </div>
                    <div className="text-[11.5px] opacity-90">{item.note}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/calendar"
            className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#0B2A5B] hover:text-[#C9971C] pt-1"
          >
            <span>Open calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        {/* Navy Booking Summary Card */}
        <section
          style={{
            background: "linear-gradient(160deg, #071E47 0%, #0B2A5B 100%)",
            border: "1.5px solid rgba(226, 181, 68, 0.45)",
            borderRadius: "18px",
            padding: "22px",
            color: "#FFFFFF",
          }}
          className="space-y-4 shadow-lg"
        >
          <h3 className="text-[16px] font-bold text-white">Booking Summary</h3>

          <div className="space-y-2.5 text-[13px] border-b border-white/15 pb-3.5">
            <div className="flex justify-between text-white/85">
              <span>Hall rent {totalDays > 1 ? `(${totalDays} days)` : ""}</span>
              <span className="font-semibold text-white">
                {effectiveHallRent === 0 && isFreeUse
                  ? "Free (₹0)"
                  : `₹${effectiveHallRent.toLocaleString("en-IN")}`}
              </span>
            </div>
            <div className="flex justify-between text-white/85">
              <span>A.C. charges</span>
              <span className="font-semibold text-white">
                ₹{effectiveAcCharge.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-white/85">
              <span>Security deposit (refundable)</span>
              <span className="font-semibold text-white">
                ₹{effectiveDeposit.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-white/85">
              <span>{isEdit ? "Paid so far" : "Advance paid"}</span>
              <span className="font-semibold text-white">
                − ₹{effectivePaid.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-[13.5px] font-semibold text-white/90">Balance due</span>
            <span className="text-[24px] font-extrabold text-[#F4CF6A]">
              ₹{balanceDue.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-white/80 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              style={{ minHeight: "42px" }}
              className="w-full rounded-xl bg-white px-3.5 text-[13.5px] font-bold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Awaiting approval">Awaiting approval</option>
              {isEdit && <option value="Completed">Completed</option>}
              {isEdit && <option value="Cancelled">Cancelled</option>}
            </select>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="submit"
              style={{
                minHeight: "46px",
                background: "linear-gradient(135deg, #F7E6A9 0%, #E2B544 55%, #C9971C 100%)",
                color: "#041535",
                borderRadius: "12px",
              }}
              className="interactive-btn w-full text-[14px] font-bold cursor-pointer"
            >
              {isEdit ? "Update Booking" : "Submit Request"}
            </button>

            <Link
              href={editBooking ? `/bookings/${editBooking.receiptNo}` : "/bookings"}
              style={{ minHeight: "44px" }}
              className="w-full rounded-xl border border-white/25 text-white/90 hover:bg-white/10 text-[13.5px] font-semibold inline-flex items-center justify-center transition-colors"
            >
              Cancel
            </Link>
          </div>
        </section>
      </div>

      {showAdvanceErrorDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="advance-error-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]"
        >
          <div className="bg-white rounded-2xl border border-[#FECACA] max-w-md w-full p-6 shadow-2xl space-y-4 animate-check-pop">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#C62828]" />
              </div>
              <div>
                <h3
                  id="advance-error-dialog-title"
                  className="text-[17px] font-bold text-[#0B2A5B]"
                >
                  Invalid Advance Amount
                </h3>
                <p className="text-[13.5px] text-[#5B6474] mt-1">
                  Advance paid cannot be more than the total booking amount. Please reduce the
                  advance or update the charges.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] p-3.5 space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#5B6474]">Total Booking Amount</span>
                <span className="font-bold text-[#0B2A5B]">
                  ₹{totalCharge.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6474]">Advance Paid Entered</span>
                <span className="font-bold text-[#C62828]">
                  ₹{effectivePaid.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanceErrorDialog(false)}
                className="px-4 py-2.5 rounded-xl border border-[#EFE4CC] text-[#0B2A5B] text-[13px] font-bold hover:bg-[#FAF5EB] cursor-pointer"
              >
                Edit Manually
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaid(totalCharge);
                  setFormError(null);
                  setShowAdvanceErrorDialog(false);
                }}
                className="interactive-btn px-4 py-2.5 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-bold cursor-pointer"
              >
                Set Advance to ₹{totalCharge.toLocaleString("en-IN")}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
