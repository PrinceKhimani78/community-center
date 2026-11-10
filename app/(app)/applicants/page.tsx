"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, UserPlus, BookOpen, Search, CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";

type ApplicantsTab = "list" | "add" | "ledger";

export default function ApplicantsPage() {
  const { applicants, bookings, payments, addApplicant } = useDashboard();
  const [activeTab, setActiveTab] = useState<ApplicantsTab>("list");
  const [query, setQuery] = useState("");
  const [onlyDues, setOnlyDues] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(applicants[0]?.id || "");

  // Add person form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [addedOk, setAddedOk] = useState(false);

  const getApplicantTotals = (applicantId: string) => {
    const personBookings = bookings.filter((b) => b.applicantId === applicantId);
    const billed = personBookings.reduce((s, b) => s + b.rent + b.deposit, 0);
    const paid = personBookings.reduce((s, b) => s + b.paid, 0);
    const due = Math.max(0, billed - paid);
    return { count: personBookings.length, billed, paid, due, personBookings };
  };

  const filtered = applicants.filter((a) => {
    const q = query.trim().toLowerCase();
    const matchesQ =
      !q || a.name.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q);
    const totals = getApplicantTotals(a.id);
    const matchesDue = !onlyDues || totals.due > 0;
    return matchesQ && matchesDue;
  });

  const selectedApplicant =
    applicants.find((a) => a.id === selectedApplicantId) || applicants[0];
  const selectedTotals = selectedApplicant
    ? getApplicantTotals(selectedApplicant.id)
    : { count: 0, billed: 0, paid: 0, due: 0, personBookings: [] };

  const selectedPayments = payments.filter((p) =>
    selectedTotals.personBookings.some((b) => b.id === p.bookingId)
  );

  const tabs: TabItem<ApplicantsTab>[] = [
    { id: "list", label: "All People", icon: Users, count: applicants.length },
    { id: "add", label: "Add Person", icon: UserPlus },
    { id: "ledger", label: "Person Ledger", icon: BookOpen },
  ];

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const created = addApplicant({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || "Dhari, Gujarat",
      idProofMasked: "Office ID verified",
      notes: notes.trim(),
    });
    setName("");
    setPhone("");
    setAddress("");
    setNotes("");
    setSelectedApplicantId(created.id);
    setAddedOk(true);
  };

  return (
    <PageShell
      title="Booking Applicants"
      subtitle="See customer phone numbers, past bookings, and pending balances."
    >
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Applicants tabs"
      />

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="w-4 h-4 text-[#5B6474] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or mobile number..."
                  style={{ minHeight: "44px" }}
                  className="w-full pl-10 pr-4 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px]"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#0B2A5B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyDues}
                  onChange={(e) => setOnlyDues(e.target.checked)}
                  className="w-4 h-4 accent-[#0B2A5B]"
                />
                <span>Only show people with balance due</span>
              </label>
            </div>

            <div className="space-y-3">
              {filtered.map((a) => {
                const t = getApplicantTotals(a.id);
                return (
                  <div
                    key={a.id}
                    className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-[#0B2A5B] text-[16px]">{a.name}</div>
                      <p className="text-[13px] text-[#5B6474] mt-0.5">
                        {a.phone} · {a.address} · {t.count} booking(s)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right mr-2">
                        <div className="text-[11.5px] text-[#5B6474]">Pending Balance</div>
                        <div
                          className={`text-[16px] font-extrabold ${
                            t.due > 0 ? "text-[#C62828]" : "text-[#15803D]"
                          }`}
                        >
                          ₹{t.due.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApplicantId(a.id);
                          setActiveTab("ledger");
                        }}
                        style={{ minHeight: "42px" }}
                        className="interactive-btn px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold cursor-pointer"
                      >
                        View Ledger
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <form
            onSubmit={handleAddPerson}
            className="bg-white rounded-2xl border border-[#EFE4CC] p-6 max-w-xl space-y-4"
          >
            <h2 className="font-bold text-[#0B2A5B] text-[17px]">Add a New Person</h2>

            {addedOk && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold flex items-center gap-2 animate-check-pop">
                <CheckCircle2 className="w-4 h-4" />
                <span>Person added to your list!</span>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mr. Hanif Patel"
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98..."
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, Dhari"
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any helpful note"
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
              />
            </div>

            <button
              type="submit"
              style={{ minHeight: "46px" }}
              className="interactive-btn px-6 py-2 rounded-xl bg-[#0B2A5B] text-white text-[14px] font-bold cursor-pointer"
            >
              Save Person
            </button>
          </form>
        )}

        {activeTab === "ledger" && selectedApplicant && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-[19px] font-bold text-[#0B2A5B]">{selectedApplicant.name}</h2>
                <p className="text-[13.5px] text-[#5B6474]">
                  {selectedApplicant.phone} · {selectedApplicant.address}
                </p>
              </div>
              <Link
                href="/bookings/new"
                style={{ minHeight: "42px" }}
                className="interactive-btn px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold inline-flex items-center"
              >
                + New Booking for Them
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
                <div className="text-[12px] text-[#5B6474] font-semibold">Total Billed</div>
                <div className="text-[22px] font-extrabold text-[#0B2A5B] mt-1">
                  ₹{selectedTotals.billed.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
                <div className="text-[12px] text-[#5B6474] font-semibold">Total Paid</div>
                <div className="text-[22px] font-extrabold text-[#15803D] mt-1">
                  ₹{selectedTotals.paid.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
                <div className="text-[12px] text-[#5B6474] font-semibold">Balance Due</div>
                <div className="text-[22px] font-extrabold text-[#C62828] mt-1">
                  ₹{selectedTotals.due.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3">
              <h3 className="font-bold text-[#0B2A5B] text-[16px]">Payment History</h3>
              {selectedPayments.length === 0 ? (
                <p className="text-[13.5px] text-[#5B6474]">No payments recorded yet.</p>
              ) : (
                selectedPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#0B2A5B] text-[14px]">
                        {p.receiptNo} · {p.eventTitle}
                      </div>
                      <div className="text-[12.5px] text-[#5B6474]">
                        {p.dateLabel} · {p.mode}
                      </div>
                    </div>
                    <span className="font-extrabold text-[#15803D] text-[15px]">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
