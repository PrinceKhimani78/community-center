"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Search, X } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import { getBookingBalance } from "@/lib/utils/bookings";

const AVATAR_TONES = [
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#DCFCE7", text: "#15803D" },
  { bg: "#F3E8FF", text: "#6D28D9" },
  { bg: "#FFE4E6", text: "#9F1239" },
];

function getInitials(name: string): string {
  const cleaned = name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function CustomersDirectoryView() {
  const { applicants, bookings, addApplicant } = useDashboard();

  const [query, setQuery] = useState("");
  const [onlyDues, setOnlyDues] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idProof, setIdProof] = useState("");
  const [preferencesInput, setPreferencesInput] = useState("");
  const [notes, setNotes] = useState("");
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const enrichedCustomers = useMemo(() => {
    return applicants.map((a, idx) => {
      const personBookings = bookings.filter((b) => b.applicantId === a.id);
      const sorted = [...personBookings].sort((x, y) => y.dateISO.localeCompare(x.dateISO));
      const outstanding = personBookings.reduce((sum, b) => sum + getBookingBalance(b), 0);
      const bookedInOct = personBookings.some((b) => b.dateISO.startsWith("2026-10"));
      return {
        ...a,
        initials: getInitials(a.name),
        tone: AVATAR_TONES[idx % AVATAR_TONES.length],
        bookingCount: personBookings.length,
        lastBookingLabel: sorted[0]?.dateLabel || "No bookings",
        outstanding,
        bookedInOct,
      };
    });
  }, [applicants, bookings]);

  const kpis = useMemo(() => {
    const total = enrichedCustomers.length;
    const bookedThisMonth = enrichedCustomers.filter((c) => c.bookedInOct).length;
    const withDues = enrichedCustomers.filter((c) => c.outstanding > 0).length;
    const repeatCount = enrichedCustomers.filter((c) => c.bookingCount >= 2).length;
    const repeatPct = total > 0 ? Math.round((repeatCount / total) * 100) : 0;
    return { total, bookedThisMonth, withDues, repeatPct };
  }, [enrichedCustomers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrichedCustomers.filter((c) => {
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q);
      const matchesDue = !onlyDues || c.outstanding > 0;
      return matchesQ && matchesDue;
    });
  }, [enrichedCustomers, query, onlyDues]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const prefs = preferencesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const created = addApplicant({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || "Dhari, Gujarat",
      idProofMasked: idProof.trim() || "Verified at office",
      notes: notes.trim(),
      preferences: prefs,
    });
    setName("");
    setPhone("");
    setAddress("");
    setIdProof("");
    setPreferencesInput("");
    setNotes("");
    setShowAddForm(false);
    setAddedMessage(`Added ${created.name} (${created.customerCode || "New Customer"}).`);
  };

  return (
    <PageShell hideHeader>
      <div className="space-y-4">
        <div>
          <div className="text-[12px] font-medium text-[#5B6474]">
            Bookings · Customer directory
          </div>
          <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>Customers</h1>
        </div>

        {/* 4 KPI Cards (matches 4.8) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
            <div className="text-[12px] font-medium text-[#5B6474]">Total Customers</div>
            <div className="text-[26px] font-extrabold text-[#0B2A5B] mt-1">{kpis.total}</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
            <div className="text-[12px] font-medium text-[#5B6474]">Booked this Month</div>
            <div className="text-[26px] font-extrabold text-[#0B2A5B] mt-1">
              {kpis.bookedThisMonth}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
            <div className="text-[12px] font-medium text-[#5B6474]">With Outstanding Dues</div>
            <div className="text-[26px] font-extrabold text-[#C62828] mt-1">{kpis.withDues}</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
            <div className="text-[12px] font-medium text-[#5B6474]">Repeat Customers</div>
            <div className="text-[26px] font-extrabold text-[#0B2A5B] mt-1">
              {kpis.repeatPct}%
            </div>
          </div>
        </div>

        {/* Search + Filter + Add Customer Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[230px]">
            <Search className="w-4 h-4 text-[#5B6474] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone or address"
              style={{ minHeight: "42px" }}
              className="w-full pl-10 pr-4 rounded-xl border border-[#EFE4CC] bg-white text-[13.5px] text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
            />
          </div>

          <label className="inline-flex items-center gap-2 bg-white border border-[#EFE4CC] rounded-xl px-3.5 h-[42px] text-[13px] font-semibold text-[#0B2A5B] cursor-pointer">
            <input
              type="checkbox"
              checked={onlyDues}
              onChange={(e) => setOnlyDues(e.target.checked)}
              className="w-4 h-4 accent-[#0B2A5B]"
            />
            <span>Only with dues</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setShowAddForm((v) => !v);
              setAddedMessage(null);
            }}
            style={{
              minHeight: "42px",
              background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
              color: "#FFFFFF",
              borderRadius: "10px",
            }}
            className="interactive-btn px-4 py-2 text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        {addedMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[13px] font-semibold flex items-center gap-2 animate-check-pop">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{addedMessage}</span>
          </div>
        )}

        {/* Inline Add Customer Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomer}
            className="bg-white rounded-2xl border border-[#E2B544]/60 p-5 space-y-4 animate-tab-enter shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#0B2A5B] text-[16px]">Add New Customer</h2>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 text-[#5B6474] hover:text-[#0B2A5B] cursor-pointer"
                aria-label="Close form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mr. Hanif Patel"
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98..."
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Dhari"
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                  ID Proof (Masked)
                </label>
                <input
                  type="text"
                  value={idProof}
                  onChange={(e) => setIdProof(e.target.value)}
                  placeholder="Aadhaar · XXXX 1234"
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                  Preferences (comma-separated)
                </label>
                <input
                  type="text"
                  value={preferencesInput}
                  onChange={(e) => setPreferencesInput(e.target.value)}
                  placeholder="Pays by UPI, A.C. hall"
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional note"
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-[#EFE4CC] text-[13px] font-semibold text-[#0B2A5B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="interactive-btn px-5 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-bold cursor-pointer"
              >
                Save Customer
              </button>
            </div>
          </form>
        )}

        {/* MOBILE CUSTOMER CARDS */}
        <div className="md:hidden space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-[#EFE4CC] p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    style={{ backgroundColor: c.tone.bg, color: c.tone.text }}
                    className="notranslate w-10 h-10 rounded-full flex items-center justify-center text-[12.5px] font-extrabold shrink-0"
                  >
                    {c.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#0B2A5B] text-[15px] truncate">{c.name}</div>
                    <div className="notranslate text-[12.5px] text-[#5B6474]">{c.phone}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-[#5B6474]">Outstanding</div>
                  <div
                    className={`notranslate text-[14px] font-extrabold ${
                      c.outstanding > 0 ? "text-[#C62828]" : "text-[#15803D]"
                    }`}
                  >
                    {c.outstanding > 0 ? `₹${c.outstanding.toLocaleString("en-IN")}` : "No dues"}
                  </div>
                </div>
              </div>

              <div className="text-[12px] text-[#5B6474] flex items-center justify-between border-t border-[#F1ECE1] pt-2.5">
                <span>
                  {c.bookingCount} booking(s) · Last: {c.lastBookingLabel}
                </span>
                <div className="flex items-center gap-3 font-bold text-[#0B2A5B] text-[13px]">
                  <Link href={`/customers/${c.id}`}>Profile</Link>
                  <Link href={`/bookings/new?customer=${c.id}`}>Book</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP CUSTOMER TABLE (matches 4.8) */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #EFE4CC",
            borderRadius: "18px",
          }}
          className="hidden md:block overflow-hidden shadow-2xs"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="border-b border-[#F1ECE1] bg-[#FAF7F2]/70 text-[12px] font-semibold text-[#5B6474]">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4 text-center">Bookings</th>
                  <th className="py-3.5 px-4">Last Booking</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE1] text-[13.5px]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#5B6474]">
                      No customers match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF7F2]/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <Link
                          href={`/customers/${c.id}`}
                          className="inline-flex items-center gap-3 group"
                        >
                          <span
                            style={{ backgroundColor: c.tone.bg, color: c.tone.text }}
                            className="notranslate w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold shrink-0"
                          >
                            {c.initials}
                          </span>
                          <span className="font-bold text-[#0B2A5B] group-hover:text-[#C9971C]">
                            {c.name}
                          </span>
                        </Link>
                      </td>
                      <td className="notranslate py-3.5 px-4 text-[#5B6474]">{c.phone}</td>
                      <td className="py-3.5 px-4 text-[#5B6474]">{c.address}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#0B2A5B]">
                        {c.bookingCount}
                      </td>
                      <td className="py-3.5 px-4 text-[#5B6474]">{c.lastBookingLabel}</td>
                      <td className="notranslate py-3.5 px-4 text-right font-bold">
                        {c.outstanding > 0 ? (
                          <span className="text-[#C62828]">
                            ₹{c.outstanding.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-[#15803D]">No dues</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3 font-bold text-[13px] text-[#0B2A5B]">
                          <Link href={`/customers/${c.id}`} className="hover:text-[#C9971C]">
                            Profile
                          </Link>
                          <Link
                            href={`/bookings/new?customer=${c.id}`}
                            className="hover:text-[#C9971C]"
                          >
                            Book
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-[#F1ECE1] text-[12.5px] text-[#5B6474]">
            Showing {filtered.length} of {applicants.length} customers
          </div>
        </div>
      </div>
    </PageShell>
  );
}

