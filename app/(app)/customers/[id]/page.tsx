"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, Pencil, Phone } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import StatusBadge from "@/components/common/StatusBadge";
import { formatBookingCode, getBookingBalance } from "@/lib/utils/bookings";

type ProfileTab = "history" | "ledger" | "notes";

function getInitials(name: string): string {
  const cleaned = name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const PREF_COLORS = [
  "bg-[#FEF5DD] text-[#92400E] border-[#F4DD9D]",
  "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  "bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]",
];

function CustomerProfileContent() {
  const params = useParams<{ id: string }>();
  const { applicants, bookings, payments, updateApplicant } = useDashboard();

  const customer = applicants.find((a) => a.id === params.id) || applicants[0];

  const [activeTab, setActiveTab] = useState<ProfileTab>("history");
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState(customer?.name || "");
  const [editPhone, setEditPhone] = useState(customer?.phone || "");
  const [editAddress, setEditAddress] = useState(customer?.address || "");
  const [editIdProof, setEditIdProof] = useState(customer?.idProofMasked || "");
  const [editPrefs, setEditPrefs] = useState((customer?.preferences || []).join(", "));
  const [notesDraft, setNotesDraft] = useState(customer?.notes || "");
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const customerBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.applicantId === customer.id)
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
    [bookings, customer.id]
  );

  const customerPayments = useMemo(
    () =>
      payments.filter((p) =>
        customerBookings.some(
          (b) => b.id === p.bookingId || b.receiptNo === p.bookingReceiptNo
        )
      ),
    [payments, customerBookings]
  );

  const totals = useMemo(() => {
    const activeBookings = customerBookings.filter((b) => b.status !== "Cancelled");
    const billed = activeBookings.reduce(
      (s, b) => s + (b.isFreeUse ? 0 : b.rent + b.deposit),
      0
    );
    const paid = activeBookings.reduce((s, b) => s + b.paid, 0);
    const outstanding = activeBookings.reduce((s, b) => s + getBookingBalance(b), 0);
    return { count: customerBookings.length, billed, paid, outstanding };
  }, [customerBookings]);

  const ledgerRows = useMemo(() => {
    const rows: Array<{
      id: string;
      date: string;
      description: string;
      ref: string;
      debit: number;
      credit: number;
    }> = [];

    for (const b of [...customerBookings].reverse()) {
      if (b.status === "Cancelled" || b.isFreeUse) continue;
      rows.push({
        id: `deb-${b.id}`,
        date: b.dateLabel,
        description: `${b.eventTitle} · ${b.hall}`,
        ref: formatBookingCode(b.receiptNo),
        debit: b.rent + b.deposit,
        credit: 0,
      });
    }

    for (const p of [...customerPayments].reverse()) {
      rows.push({
        id: `crd-${p.id}`,
        date: p.dateLabel,
        description: `${p.type} (${p.mode})`,
        ref: p.receiptNo,
        debit: 0,
        credit: p.amount,
      });
    }

    let running = 0;
    return rows.map((row) => {
      running += row.debit - row.credit;
      return { ...row, balance: Math.max(0, running) };
    });
  }, [customerBookings, customerPayments]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateApplicant(customer.id, {
      name: editName.trim() || customer.name,
      phone: editPhone.trim() || customer.phone,
      address: editAddress.trim() || customer.address,
      idProofMasked: editIdProof.trim() || customer.idProofMasked,
      preferences: editPrefs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setIsEditing(false);
    setSavedNotice("Customer profile updated.");
  };

  const handleSaveNotes = () => {
    updateApplicant(customer.id, { notes: notesDraft.trim() });
    setSavedNotice("Customer notes saved.");
  };

  return (
    <PageShell hideHeader>
      <div className="space-y-5">
        {/* Top Breadcrumb + Back */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-[#5B6474]">
              <Link href="/customers" className="hover:text-[#0B2A5B]">
                Customers
              </Link>{" "}
              · Customer profile
            </div>
            <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>
              {customer.name}
            </h1>
          </div>

          <Link
            href="/customers"
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
            <span>All Customers</span>
          </Link>
        </div>

        {savedNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[13px] font-semibold flex items-center gap-2 animate-check-pop">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PROFILE COLUMN */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Avatar & Actions */}
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-6 text-center space-y-3 shadow-2xs">
              <div className="notranslate w-20 h-20 rounded-full bg-[#0B2A5B] text-[#F4CF6A] text-[24px] font-extrabold flex items-center justify-center mx-auto shadow-sm">
                {getInitials(customer.name)}
              </div>
              <div>
                <h2 className="text-[19px] font-bold text-[#0B2A5B]">{customer.name}</h2>
                <p className="text-[12.5px] text-[#5B6474] mt-0.5">
                  Customer since {customer.memberSince || "Oct 2026"} ·{" "}
                  <span className="notranslate">{customer.customerCode || "CU-0100"}</span>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <Link
                  href={`/bookings/new?customer=${customer.id}`}
                  style={{ minHeight: "40px" }}
                  className="interactive-btn px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-bold inline-flex items-center"
                >
                  New Booking
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(customer.name);
                    setEditPhone(customer.phone);
                    setEditAddress(customer.address);
                    setEditIdProof(customer.idProofMasked);
                    setEditPrefs((customer.preferences || []).join(", "));
                    setIsEditing((v) => !v);
                  }}
                  style={{ minHeight: "40px" }}
                  className="interactive-btn px-4 py-2 rounded-xl bg-white border border-[#0B2A5B]/30 text-[#0B2A5B] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            {isEditing ? (
              <form
                onSubmit={handleSaveProfile}
                className="bg-white rounded-2xl border border-[#E2B544] p-5 space-y-3 animate-tab-enter"
              >
                <h3 className="font-bold text-[#0B2A5B] text-[15px]">Edit Customer</h3>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#5B6474] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#5B6474] mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#5B6474] mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#5B6474] mb-1">
                    ID Proof (Masked)
                  </label>
                  <input
                    type="text"
                    value={editIdProof}
                    onChange={(e) => setEditIdProof(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#5B6474] mb-1">
                    Preferences (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editPrefs}
                    onChange={(e) => setEditPrefs(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-2 rounded-xl border border-[#EFE4CC] text-[12.5px] font-semibold text-[#0B2A5B] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[12.5px] font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Contact Details */}
                <div className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3 shadow-2xs">
                  <h3 className="font-bold text-[#0B2A5B] text-[15px]">Contact Details</h3>
                  <div className="space-y-2.5 text-[13px] text-[#5B6474]">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#C9971C] shrink-0" />
                      <span className="notranslate font-medium text-[#14213D]">
                        {customer.phone}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#C9971C] shrink-0 mt-0.5" />
                      <span>{customer.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-[#C9971C] shrink-0" />
                      <span className="notranslate">ID proof: {customer.idProofMasked}</span>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3 shadow-2xs">
                  <h3 className="font-bold text-[#0B2A5B] text-[15px]">Preferences</h3>
                  {!customer.preferences || customer.preferences.length === 0 ? (
                    <p className="text-[12.5px] text-[#5B6474]">No preferences saved yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {customer.preferences.map((pref, i) => (
                        <span
                          key={pref}
                          className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${
                            PREF_COLORS[i % PREF_COLORS.length]
                          }`}
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>

          {/* RIGHT SUMMARY & TABS COLUMN */}
          <div className="lg:col-span-8 space-y-5">
            {/* 4 Totals KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
                <div className="text-[12px] font-medium text-[#5B6474]">Total Bookings</div>
                <div className="text-[24px] font-extrabold text-[#0B2A5B] mt-1">
                  {totals.count}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
                <div className="text-[12px] font-medium text-[#5B6474]">Total Billed</div>
                <div className="notranslate text-[24px] font-extrabold text-[#0B2A5B] mt-1">
                  ₹{totals.billed.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
                <div className="text-[12px] font-medium text-[#5B6474]">Total Paid</div>
                <div className="notranslate text-[24px] font-extrabold text-[#15803D] mt-1">
                  ₹{totals.paid.toLocaleString("en-IN")}
                </div>
              </div>
              <div
                className={`rounded-2xl border p-4 ${
                  totals.outstanding > 0
                    ? "bg-[#FEF2F2] border-[#FECACA]"
                    : "bg-[#ECFDF5] border-[#BBF7D0]"
                }`}
              >
                <div
                  className={`text-[12px] font-medium ${
                    totals.outstanding > 0 ? "text-[#C62828]" : "text-[#15803D]"
                  }`}
                >
                  Outstanding
                </div>
                <div
                  className={`notranslate text-[24px] font-extrabold mt-1 ${
                    totals.outstanding > 0 ? "text-[#C62828]" : "text-[#15803D]"
                  }`}
                >
                  ₹{totals.outstanding.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Tabbed Card */}
            <div className="bg-white rounded-2xl border border-[#EFE4CC] overflow-hidden shadow-2xs">
              <div className="flex items-center gap-6 px-5 border-b border-[#F1ECE1]">
                {(
                  [
                    { id: "history", label: "Booking History" },
                    { id: "ledger", label: "Ledger" },
                    { id: "notes", label: "Notes" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`py-3.5 text-[14px] font-bold border-b-2 cursor-pointer transition-colors ${
                      activeTab === t.id
                        ? "border-[#0B2A5B] text-[#0B2A5B]"
                        : "border-transparent text-[#5B6474] hover:text-[#0B2A5B]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === "history" && (
                  <div className="overflow-x-auto">
                    {customerBookings.length === 0 ? (
                      <p className="text-[13.5px] text-[#5B6474] py-4">
                        No bookings found for this customer.
                      </p>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[560px] text-[13.5px]">
                        <thead>
                          <tr className="border-b border-[#F1ECE1] text-[12px] text-[#5B6474]">
                            <th className="py-2.5 pr-3 font-semibold">Booking</th>
                            <th className="py-2.5 px-3 font-semibold">Date</th>
                            <th className="py-2.5 px-3 font-semibold">Hall</th>
                            <th className="py-2.5 px-3 font-semibold">Rent</th>
                            <th className="py-2.5 pl-3 text-right font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1ECE1]">
                          {customerBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-[#FAF7F2]/70">
                              <td className="py-3.5 pr-3">
                                <Link
                                  href={`/bookings/${b.receiptNo}`}
                                  className="font-bold text-[#0B2A5B] hover:text-[#C9971C] block"
                                >
                                  {b.eventTitle}
                                </Link>
                                <span className="notranslate text-[11.5px] text-[#5B6474]">
                                  {formatBookingCode(b.receiptNo)}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-[#5B6474]">{b.dateLabel}</td>
                              <td className="py-3.5 px-3 text-[#14213D]">{b.hall}</td>
                              <td className="notranslate py-3.5 px-3 font-bold text-[#0B2A5B]">
                                {b.isFreeUse ? "Free" : `₹${b.rent.toLocaleString("en-IN")}`}
                              </td>
                              <td className="py-3.5 pl-3 text-right">
                                <StatusBadge status={b.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === "ledger" && (
                  <div className="overflow-x-auto">
                    {ledgerRows.length === 0 ? (
                      <p className="text-[13.5px] text-[#5B6474] py-4">
                        No ledger transactions yet.
                      </p>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[600px] text-[13px]">
                        <thead>
                          <tr className="border-b border-[#F1ECE1] text-[12px] text-[#5B6474]">
                            <th className="py-2.5 pr-3 font-semibold">Date</th>
                            <th className="py-2.5 px-3 font-semibold">Particulars</th>
                            <th className="py-2.5 px-3 font-semibold">Ref</th>
                            <th className="py-2.5 px-3 text-right font-semibold">Debit</th>
                            <th className="py-2.5 px-3 text-right font-semibold">Credit</th>
                            <th className="py-2.5 pl-3 text-right font-semibold">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1ECE1]">
                          {ledgerRows.map((row) => (
                            <tr key={row.id}>
                              <td className="py-3 pr-3 text-[#5B6474]">{row.date}</td>
                              <td className="py-3 px-3 font-medium text-[#0B2A5B]">
                                {row.description}
                              </td>
                              <td className="notranslate py-3 px-3 text-[#5B6474]">{row.ref}</td>
                              <td className="notranslate py-3 px-3 text-right font-semibold text-[#0B2A5B]">
                                {row.debit > 0 ? `₹${row.debit.toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="notranslate py-3 px-3 text-right font-semibold text-[#15803D]">
                                {row.credit > 0 ? `₹${row.credit.toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td className="notranslate py-3 pl-3 text-right font-extrabold text-[#0B2A5B]">
                                ₹{row.balance.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Add preferences, special requirements, or follow-up notes..."
                      className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] p-3.5 text-[13.5px] text-[#14213D]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="interactive-btn px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-bold cursor-pointer"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading customer profile...</div>}>
      <CustomerProfileContent />
    </Suspense>
  );
}

