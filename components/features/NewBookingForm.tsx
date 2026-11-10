"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, CalendarCheck } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { HallName } from "@/lib/mock/dashboard";

interface NewBookingFormProps {
  onSaved?: (receiptNo: string) => void;
}

export default function NewBookingForm({ onSaved }: NewBookingFormProps) {
  const router = useRouter();
  const { applicants, bookings, addBooking, addApplicant } = useDashboard();

  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedApplicantId, setSelectedApplicantId] = useState(applicants[0]?.id || "");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [eventType, setEventType] = useState("Wedding");
  const [hall, setHall] = useState<HallName>("Ground + First Floor");
  const [isAC, setIsAC] = useState(true);
  const [dateISO, setDateISO] = useState("2026-10-30");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDateISO, setEndDateISO] = useState("2026-10-31");
  const [timing, setTiming] = useState("10:00 AM – 10:00 PM");
  const [guests, setGuests] = useState(250);

  const [isFreeUse, setIsFreeUse] = useState(false);
  const [rent, setRent] = useState(22000);
  const [deposit, setDeposit] = useState(5000);
  const [paid, setPaid] = useState(5000);
  const [notes, setNotes] = useState("");

  const [savedReceipt, setSavedReceipt] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const clashBooking = useMemo(() => {
    return bookings.find(
      (b) =>
        b.status !== "Cancelled" &&
        b.dateISO === dateISO &&
        (b.hall === hall ||
          b.hall === "Ground + First Floor" ||
          hall === "Ground + First Floor")
    );
  }, [bookings, dateISO, hall]);

  const totalCharge = isFreeUse ? 0 : Number(rent || 0) + Number(deposit || 0);
  const balanceDue = Math.max(0, totalCharge - (isFreeUse ? 0 : Number(paid || 0)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let applicantId = selectedApplicantId;
    let applicantName = applicants.find((a) => a.id === selectedApplicantId)?.name || "";
    let phone = applicants.find((a) => a.id === selectedApplicantId)?.phone || "";

    if (customerMode === "new") {
      if (!newName.trim() || !newPhone.trim()) {
        setFormError("Please enter the person's full name and mobile number.");
        return;
      }
      const createdApplicant = addApplicant({
        name: newName.trim(),
        phone: newPhone.trim(),
        address: newAddress.trim() || "Dhari, Gujarat",
        idProofMasked: "Verified at office",
        notes: "",
      });
      applicantId = createdApplicant.id;
      applicantName = createdApplicant.name;
      phone = createdApplicant.phone;
    }

    const formattedDate = new Date(dateISO + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const created = addBooking({
      eventTitle: isFreeUse ? `${eventType} (free use)` : eventType,
      eventType,
      applicantId,
      applicantName,
      phone,
      hall,
      isAC,
      dateISO,
      endDateISO: isMultiDay ? endDateISO : undefined,
      dateLabel: isMultiDay ? `${formattedDate} (Multi-day)` : formattedDate,
      timing,
      guests: Number(guests || 100),
      rent: isFreeUse ? 0 : Number(rent || 0),
      deposit: isFreeUse ? 0 : Number(deposit || 0),
      paid: isFreeUse ? 0 : Number(paid || 0),
      status: isFreeUse ? "Awaiting approval" : balanceDue === 0 ? "Confirmed" : "Pending",
      isFreeUse,
      notes,
    });

    setSavedReceipt(created.receiptNo);
    if (onSaved) {
      onSaved(created.receiptNo);
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
          Booking Saved (#{savedReceipt})
        </h2>
        <p style={{ color: "#5B6474", fontSize: "14px" }} className="mt-1.5">
          The booking is now added to your Bookings list and Calendar.
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
            onClick={() => setSavedReceipt(null)}
            style={{
              minHeight: "44px",
              backgroundColor: "#FAF5EB",
              border: "1px solid #E2B544",
              color: "#0B2A5B",
              borderRadius: "12px",
            }}
            className="interactive-btn px-5 py-2 text-[13.5px] font-semibold cursor-pointer"
          >
            Add Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Main Form Steps */}
      <div className="lg:col-span-8 space-y-5">
        {formError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold animate-check-pop">
            {formError}
          </div>
        )}

        {/* Step 1: Who is booking? */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid rgba(226, 181, 68, 0.35)",
            borderRadius: "18px",
            padding: "22px",
          }}
          className="animate-fade-up stagger-1"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
              Step 1 · Who is booking?
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCustomerMode("existing")}
                className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-all ${
                  customerMode === "existing"
                    ? "bg-[#0B2A5B] text-white"
                    : "bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC]"
                }`}
              >
                Saved Person
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode("new")}
                className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-all ${
                  customerMode === "new"
                    ? "bg-[#0B2A5B] text-white"
                    : "bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC]"
                }`}
              >
                + New Person
              </button>
            </div>
          </div>

          {customerMode === "existing" ? (
            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Select Person
              </label>
              <select
                value={selectedApplicantId}
                onChange={(e) => setSelectedApplicantId(e.target.value)}
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] text-[#0B2A5B] font-medium focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                {applicants.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.phone})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mr. Yusuf Patel"
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98..."
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Street / Area, Dhari"
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Which Hall & Date? */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid rgba(226, 181, 68, 0.35)",
            borderRadius: "18px",
            padding: "22px",
          }}
          className="animate-fade-up stagger-2 space-y-4"
        >
          <h2 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
            Step 2 · Which Hall & Date?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] text-[#0B2A5B] font-medium focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                <option value="Wedding">Wedding</option>
                <option value="Walima">Walima</option>
                <option value="Nikah">Nikah</option>
                <option value="Engagement">Engagement</option>
                <option value="Birthday">Birthday</option>
                <option value="Community Meeting">Community Meeting</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Select Hall
              </label>
              <select
                value={hall}
                onChange={(e) => setHall(e.target.value as HallName)}
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] text-[#0B2A5B] font-medium focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                <option value="Ground Floor">Ground Floor</option>
                <option value="Ground + First Floor">Ground + First Floor</option>
                <option value="Garden Lawn">Garden Lawn</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Event Date
              </label>
              <input
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Timing
              </label>
              <input
                type="text"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            {isMultiDay && (
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDateISO}
                  onChange={(e) => setEndDateISO(e.target.value)}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Expected Guests
              </label>
              <input
                type="number"
                min={10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#14213D] cursor-pointer">
              <input
                type="checkbox"
                checked={isAC}
                onChange={(e) => setIsAC(e.target.checked)}
                className="w-4 h-4 accent-[#0B2A5B]"
              />
              <span>Include A.C.</span>
            </label>
            <label className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#14213D] cursor-pointer">
              <input
                type="checkbox"
                checked={isMultiDay}
                onChange={(e) => setIsMultiDay(e.target.checked)}
                className="w-4 h-4 accent-[#0B2A5B]"
              />
              <span>More than 1 day</span>
            </label>
            <label className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#14213D] cursor-pointer">
              <input
                type="checkbox"
                checked={isFreeUse}
                onChange={(e) => setIsFreeUse(e.target.checked)}
                className="w-4 h-4 accent-[#0B2A5B]"
              />
              <span>Free community use (needs Admin approval)</span>
            </label>
          </div>

          {clashBooking && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-amber-900 text-[13px] animate-check-pop">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Date Note:</strong> {clashBooking.hall} already has{" "}
                <strong>{clashBooking.eventTitle}</strong> ({clashBooking.applicantName}) on this date.
              </span>
            </div>
          )}
        </div>

        {/* Step 3: Money Details */}
        {!isFreeUse && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid rgba(226, 181, 68, 0.35)",
              borderRadius: "18px",
              padding: "22px",
            }}
            className="animate-fade-up stagger-3 space-y-4"
          >
            <h2 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
              Step 3 · Money Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Hall Rent (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value))}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Advance Paid Now (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={paid}
                  onChange={(e) => setPaid(Number(e.target.value))}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Special Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra chairs, kitchen access..."
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Summary Panel */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid rgba(226, 181, 68, 0.4)",
          borderRadius: "18px",
          padding: "22px",
          boxShadow: "0 12px 26px -6px rgba(11, 42, 91, 0.08)",
        }}
        className="lg:col-span-4 lg:sticky lg:top-20 space-y-4 animate-fade-up stagger-2"
      >
        <div className="flex items-center gap-2 border-b border-[#F1ECE1] pb-3">
          <CalendarCheck className="w-5 h-5 text-[#C9971C]" />
          <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
            Booking Summary
          </h3>
        </div>

        <div className="space-y-2.5 text-[13.5px]">
          <div className="flex justify-between">
            <span className="text-[#5B6474]">Hall</span>
            <span className="font-semibold text-[#0B2A5B]">{hall}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6474]">Date</span>
            <span className="font-semibold text-[#0B2A5B]">{dateISO}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6474]">Total (Rent + Deposit)</span>
            <span className="font-bold text-[#0B2A5B]">
              ₹{totalCharge.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B6474]">Advance Paid</span>
            <span className="font-semibold text-[#15803D]">
              ₹{(isFreeUse ? 0 : Number(paid || 0)).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between pt-2.5 border-t border-[#F1ECE1] text-[15px]">
            <span className="font-bold text-[#0B2A5B]">Balance Remaining</span>
            <span className="font-extrabold text-[#C62828]">
              ₹{balanceDue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <button
          type="submit"
          style={{
            minHeight: "48px",
            background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
            border: "1.5px solid #E2B544",
            color: "#FFFFFF",
            borderRadius: "12px",
          }}
          className="interactive-btn w-full text-[14.5px] font-bold cursor-pointer mt-2"
        >
          Save Booking
        </button>
      </div>
    </form>
  );
}

