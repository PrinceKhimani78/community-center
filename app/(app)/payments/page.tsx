"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Plus, Printer } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import type { PaymentMode, PaymentRecord } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import StatusBadge from "@/components/common/StatusBadge";
import { getBookingBalance } from "@/lib/utils/bookings";

type FinanceTab = "payments" | "expenses" | "refunds";
type PaymentFilter = "All" | "Rent" | "Deposit";

function PaymentsContent() {
  const searchParams = useSearchParams();
  const {
    bookings,
    payments,
    expenses,
    refunds,
    recordPayment,
    addExpense,
    sendPaymentReminders,
  } = useDashboard();

  const tabParam = searchParams.get("tab");
  const bookingParam = searchParams.get("booking");

  const resolvedTab: FinanceTab =
    tabParam === "expenses"
      ? "expenses"
      : tabParam === "refunds"
      ? "refunds"
      : "payments";

  const [tabState, setTabState] = useState<{ param: string | null; tab: FinanceTab }>({
    param: tabParam,
    tab: resolvedTab,
  });
  const activeTab = tabState.param === tabParam ? tabState.tab : resolvedTab;
  const setActiveTab = (tab: FinanceTab) => setTabState({ param: tabParam, tab });

  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("All");
  const [remindersSentMsg, setRemindersSentMsg] = useState<string | null>(null);

  const bookingsWithBalance = useMemo(
    () => bookings.filter((b) => getBookingBalance(b) > 0),
    [bookings]
  );

  const defaultSelectedBooking = useMemo(() => {
    if (bookingParam) {
      const match = bookings.find(
        (b) => b.receiptNo === bookingParam || b.id === bookingParam
      );
      if (match) return match.id;
    }
    return bookingsWithBalance[0]?.id || bookings[0]?.id || "";
  }, [bookingParam, bookings, bookingsWithBalance]);

  const [selectedBookingId, setSelectedBookingId] = useState(defaultSelectedBooking);
  const [payType, setPayType] = useState<PaymentRecord["type"]>("Rent Balance");
  const [amount, setAmount] = useState<number>(() => {
    const target = bookings.find((b) => b.id === defaultSelectedBooking);
    return target ? getBookingBalance(target) || 5000 : 5000;
  });
  const [mode, setMode] = useState<PaymentMode>("UPI");
  const [reference, setReference] = useState("");
  const [savedReceiptInfo, setSavedReceiptInfo] = useState<{
    receiptNo: string;
    bookingNo: string;
  } | null>(null);

  // Expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState<
    "Cleaning" | "Electricity" | "Water" | "Repair" | "Supplies"
  >("Cleaning");
  const [expAmount, setExpAmount] = useState(500);
  const [expPaidTo, setExpPaidTo] = useState("");
  const [expSaved, setExpSaved] = useState(false);

  const kpis = useMemo(() => {
    const collected = payments.reduce((s, p) => s + p.amount, 0);
    const pending = bookingsWithBalance.reduce((s, b) => s + getBookingBalance(b), 0);
    const overdueBookings = bookingsWithBalance.filter((b) =>
      (b.notes || "").toLowerCase().includes("overdue")
    );
    const overdueAmt = overdueBookings.reduce((s, b) => s + getBookingBalance(b), 0);
    const depositsHeld = refunds
      .filter((r) => r.status !== "Refunded")
      .reduce((s, r) => s + r.heldAmount, 0) +
      bookings
        .filter(
          (b) =>
            b.status !== "Cancelled" &&
            b.deposit > 0 &&
            !refunds.some((r) => r.bookingReceiptNo === b.receiptNo)
        )
        .reduce((s, b) => s + b.deposit, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    return {
      collected,
      pending,
      overdueAmt,
      overdueBookings,
      depositsHeld,
      totalExpenses,
    };
  }, [payments, bookingsWithBalance, refunds, bookings, expenses]);

  const filteredPayments = useMemo(() => {
    if (paymentFilter === "All") return payments;
    if (paymentFilter === "Deposit") {
      return payments.filter((p) => p.type === "Security Deposit");
    }
    return payments.filter((p) => p.type !== "Security Deposit");
  }, [payments, paymentFilter]);

  const handleBookingChange = (nextId: string) => {
    setSelectedBookingId(nextId);
    const target = bookings.find((b) => b.id === nextId);
    if (target) {
      const due = getBookingBalance(target);
      if (due > 0) setAmount(due);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const rec = recordPayment({
      bookingId: selectedBookingId,
      type: payType,
      amount: Number(amount),
      mode,
      reference,
    });
    if (rec) {
      setSavedReceiptInfo({ receiptNo: rec.receiptNo, bookingNo: rec.bookingReceiptNo });
      setReference("");
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim()) return;
    addExpense({
      title: expTitle.trim(),
      category: expCategory,
      amount: Number(expAmount || 0),
      paidTo: expPaidTo.trim() || "Local Vendor",
    });
    setExpTitle("");
    setExpPaidTo("");
    setShowExpenseForm(false);
    setExpSaved(true);
  };

  const handleSendReminders = () => {
    const count = Math.max(1, kpis.overdueBookings.length);
    sendPaymentReminders(count);
    setRemindersSentMsg(
      `In-app payment reminder logged for ${count} booking(s). WhatsApp/SMS delivery arrives in Phase 2.`
    );
  };

  return (
    <PageShell hideHeader>
      <div className="space-y-4">
        {/* Heading + Deposit Refunds shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-[#5B6474]">
              Finance · Rent, deposits & expenses
            </div>
            <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>
              Payments & Expenses
            </h1>
          </div>

          <Link
            href="/deposits/1045"
            style={{ minHeight: "40px" }}
            className="interactive-btn px-4 py-2 rounded-xl bg-white border border-[#EFE4CC] text-[#0B2A5B] text-[13px] font-bold inline-flex items-center gap-1.5"
          >
            <span>Deposit Refunds</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C9971C]" />
          </Link>
        </div>

        {/* 5 KPI Cards (matches 4.10) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
            <div className="text-[12px] font-medium text-[#5B6474]">Collected · Oct</div>
            <div className="notranslate text-[22px] font-extrabold text-[#15803D] mt-1">
              ₹{kpis.collected.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
            <div className="text-[12px] font-medium text-[#5B6474]">Pending</div>
            <div className="notranslate text-[22px] font-extrabold text-[#0B2A5B] mt-1">
              ₹{kpis.pending.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <div className="text-[12px] font-medium text-[#C62828]">Overdue</div>
            <div className="notranslate text-[22px] font-extrabold text-[#C62828] mt-1">
              ₹{kpis.overdueAmt.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
            <div className="text-[12px] font-medium text-[#5B6474]">Deposits Held</div>
            <div className="notranslate text-[22px] font-extrabold text-[#0B2A5B] mt-1">
              ₹{kpis.depositsHeld.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 col-span-2 md:col-span-1">
            <div className="text-[12px] font-medium text-[#5B6474]">Expenses · Oct</div>
            <div className="notranslate text-[22px] font-extrabold text-[#8A6510] mt-1">
              ₹{kpis.totalExpenses.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Overdue Alert Banner */}
        {bookingsWithBalance.length > 0 && (
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 text-[13px] text-[#991B1B]">
              <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>
                  {Math.max(1, kpis.overdueBookings.length)} payment(s) need attention.
                </strong>{" "}
                {kpis.overdueBookings[0]
                  ? `${kpis.overdueBookings[0].eventTitle} · ${kpis.overdueBookings[0].applicantName} (₹${getBookingBalance(
                      kpis.overdueBookings[0]
                    ).toLocaleString("en-IN")} due).`
                  : `${bookingsWithBalance.length} bookings have open balances.`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSendReminders}
              className="interactive-btn px-4 py-2 rounded-xl bg-[#C62828] text-white text-[12.5px] font-bold shrink-0 cursor-pointer"
            >
              Send reminders
            </button>
          </div>
        )}

        {remindersSentMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[13px] font-semibold flex items-center gap-2 animate-check-pop">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{remindersSentMsg}</span>
          </div>
        )}

        {/* MAIN 2-COLUMN BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 8 COLS — PAYMENTS / EXPENSES / DEPOSIT REFUNDS */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EFE4CC] overflow-hidden shadow-2xs">
            {/* Tabs + Filter Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 border-b border-[#F1ECE1]">
              <div className="flex items-center gap-6">
                {(
                  [
                    { id: "payments", label: "Payments" },
                    { id: "expenses", label: "Expenses" },
                    { id: "refunds", label: "Deposit Refunds" },
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

              {activeTab === "payments" && (
                <div className="flex items-center gap-1.5 py-2">
                  {(["All", "Rent", "Deposit"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPaymentFilter(f)}
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold cursor-pointer border transition-all ${
                        paymentFilter === f
                          ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                          : "bg-white text-[#14213D] border-[#EFE4CC]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "expenses" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseForm((v) => !v);
                    setExpSaved(false);
                  }}
                  className="my-2 px-3 py-1.5 rounded-xl bg-[#0B2A5B] text-white text-[12px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              )}
            </div>

            {/* Payments Tab Table */}
            {activeTab === "payments" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] text-[13.5px]">
                  <thead>
                    <tr className="border-b border-[#F1ECE1] bg-[#FAF7F2]/60 text-[12px] text-[#5B6474]">
                      <th className="py-3 px-5 font-semibold">Customer</th>
                      <th className="py-3 px-3 font-semibold">Type</th>
                      <th className="py-3 px-3 font-semibold">Mode</th>
                      <th className="py-3 px-3 font-semibold">Date</th>
                      <th className="py-3 px-3 text-right font-semibold">Amount</th>
                      <th className="py-3 px-5 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1ECE1]">
                    {filteredPayments.map((p) => {
                      const booking = bookings.find(
                        (b) => b.id === p.bookingId || b.receiptNo === p.bookingReceiptNo
                      );
                      const balance = booking ? getBookingBalance(booking) : 0;
                      const statusLabel =
                        p.type === "Security Deposit"
                          ? "Held"
                          : balance > 0
                          ? "Pending"
                          : "Confirmed";

                      return (
                        <tr key={p.id} className="hover:bg-[#FAF7F2]/70">
                          <td className="py-3.5 px-5">
                            <Link
                              href={`/invoices/${p.bookingReceiptNo}?type=payment`}
                              className="font-bold text-[#0B2A5B] hover:text-[#C9971C] block"
                            >
                              {p.applicantName}
                            </Link>
                            <span className="notranslate text-[11.5px] text-[#5B6474]">
                              {p.receiptNo}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-[#14213D]">{p.type}</td>
                          <td className="py-3.5 px-3 text-[#5B6474]">{p.mode}</td>
                          <td className="py-3.5 px-3 text-[#5B6474]">{p.dateLabel}</td>
                          <td className="notranslate py-3.5 px-3 text-right font-bold text-[#0B2A5B]">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <StatusBadge
                                status={
                                  statusLabel === "Confirmed"
                                    ? "Paid"
                                    : statusLabel === "Pending"
                                    ? "Partial"
                                    : "Held"
                                }
                              />
                              <Link
                                href={`/invoices/${p.bookingReceiptNo}?type=payment`}
                                className="text-[#0B2A5B] hover:text-[#C9971C]"
                                title="View Receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === "expenses" && (
              <div className="p-5 space-y-4">
                {expSaved && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[13px] font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Expense logged and sent for approval if required.</span>
                  </div>
                )}

                {showExpenseForm && (
                  <form
                    onSubmit={handleExpenseSubmit}
                    className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2B544] space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                          Expense Description *
                        </label>
                        <input
                          type="text"
                          required
                          value={expTitle}
                          onChange={(e) => setExpTitle(e.target.value)}
                          placeholder="e.g. Hall cleaning supplies"
                          className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-white px-3 text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                          Category
                        </label>
                        <select
                          value={expCategory}
                          onChange={(e) =>
                            setExpCategory(e.target.value as typeof expCategory)
                          }
                          className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-white px-3 text-[13px]"
                        >
                          <option value="Cleaning">Cleaning</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Water">Water</option>
                          <option value="Repair">Repair</option>
                          <option value="Supplies">Supplies</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={expAmount}
                          onChange={(e) => setExpAmount(Number(e.target.value))}
                          className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-white px-3 text-[13px] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                          Paid To
                        </label>
                        <input
                          type="text"
                          value={expPaidTo}
                          onChange={(e) => setExpPaidTo(e.target.value)}
                          placeholder="Vendor name"
                          className="w-full h-10 rounded-xl border border-[#E5D9BF] bg-white px-3 text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExpenseForm(false)}
                        className="px-3 py-1.5 rounded-lg border border-[#EFE4CC] text-[12.5px] font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#0B2A5B] text-white text-[12.5px] font-bold cursor-pointer"
                      >
                        Save Expense
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[540px] text-[13.5px]">
                    <thead>
                      <tr className="border-b border-[#F1ECE1] text-[12px] text-[#5B6474]">
                        <th className="py-2.5 pr-3 font-semibold">Expense</th>
                        <th className="py-2.5 px-3 font-semibold">Category</th>
                        <th className="py-2.5 px-3 font-semibold">Paid To</th>
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Amount</th>
                        <th className="py-2.5 pl-3 text-right font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1ECE1]">
                      {expenses.map((ex) => (
                        <tr key={ex.id}>
                          <td className="py-3.5 pr-3 font-bold text-[#0B2A5B]">{ex.title}</td>
                          <td className="py-3.5 px-3 text-[#5B6474]">{ex.category}</td>
                          <td className="py-3.5 px-3 text-[#14213D]">{ex.paidTo}</td>
                          <td className="py-3.5 px-3 text-[#5B6474]">{ex.dateLabel}</td>
                          <td className="notranslate py-3.5 px-3 text-right font-bold text-[#C62828]">
                            ₹{ex.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 pl-3 text-right">
                            <StatusBadge status={ex.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Deposit Refunds Quick List */}
            {activeTab === "refunds" && (
              <div className="p-5 space-y-3">
                {refunds.map((r) => {
                  const net = Math.max(0, r.heldAmount - r.deductionAmount);
                  return (
                    <div
                      key={r.id}
                      className="rounded-xl border border-[#EFE4CC] bg-[#FAF7F2]/60 p-4 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#0B2A5B] text-[15px]">
                            {r.applicantName} · {r.eventTitle}
                          </span>
                          <StatusBadge status={r.status} />
                        </div>
                        <p className="text-[12.5px] text-[#5B6474] mt-0.5">
                          <span className="notranslate">#{r.bookingReceiptNo}</span> ·{" "}
                          {r.eventDate} · Held ₹{r.heldAmount.toLocaleString("en-IN")} − Deduction ₹
                          {r.deductionAmount.toLocaleString("en-IN")} = Refund{" "}
                          <strong className="text-[#15803D]">
                            ₹{net.toLocaleString("en-IN")}
                          </strong>
                        </p>
                      </div>

                      <Link
                        href={`/deposits/${r.bookingReceiptNo}`}
                        className="interactive-btn px-3.5 py-2 rounded-xl bg-[#0B2A5B] text-white text-[12.5px] font-bold inline-flex items-center gap-1"
                      >
                        <span>Open Workflow</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT 4 COLS — RECORD PAYMENT FORM (matches 4.10) */}
          <form
            onSubmit={handleRecordPayment}
            className="lg:col-span-4 bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs"
          >
            <h2 style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }}>
              Record Payment
            </h2>

            {savedReceiptInfo && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[12.5px] font-semibold space-y-1.5 animate-check-pop">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Saved receipt {savedReceiptInfo.receiptNo}</span>
                </div>
                <Link
                  href={`/invoices/${savedReceiptInfo.bookingNo}?type=payment`}
                  className="inline-flex items-center gap-1 text-[#0B2A5B] underline font-bold"
                >
                  Open Printable Receipt →
                </Link>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-[#14213D] mb-1.5">
                Booking
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => handleBookingChange(e.target.value)}
                style={{ minHeight: "42px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                {bookings
                  .filter((b) => b.status !== "Cancelled" && !b.isFreeUse)
                  .map((b) => {
                    const due = getBookingBalance(b);
                    return (
                      <option key={b.id} value={b.id}>
                        BK-2026-{b.receiptNo} · {b.applicantName} ·{" "}
                        {due > 0 ? `₹${due.toLocaleString("en-IN")} due` : "Paid"}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#14213D] mb-1.5">
                Payment Type
              </label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value as PaymentRecord["type"])}
                style={{ minHeight: "42px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px] font-semibold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                <option value="Rent Balance">Rent (balance)</option>
                <option value="Advance">Rent advance</option>
                <option value="Security Deposit">Security deposit</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#14213D] mb-1.5">
                Amount (₹)
              </label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ minHeight: "42px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-bold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#14213D] mb-1.5">
                Mode
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { value: "UPI", label: "UPI" },
                    { value: "Cash", label: "Cash" },
                    { value: "Bank Transfer", label: "Bank" },
                    { value: "Cheque", label: "Cheque" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMode(m.value)}
                    className={`py-2 rounded-xl text-[12px] font-bold border cursor-pointer transition-all ${
                      mode === m.value
                        ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                        : "bg-white text-[#14213D] border-[#EFE4CC]"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#14213D] mb-1.5">
                Reference / UTR
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. 4291 8833 1102"
                style={{ minHeight: "42px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              />
            </div>

            <button
              type="submit"
              style={{
                minHeight: "46px",
                background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                color: "#FFFFFF",
                borderRadius: "12px",
              }}
              className="interactive-btn w-full text-[13.5px] font-bold cursor-pointer"
            >
              Save & Generate Receipt
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading payments...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
