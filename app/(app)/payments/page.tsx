"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  History,
  RotateCcw,
  ReceiptText,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { PaymentMode, PaymentRecord } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import StatusBadge from "@/components/common/StatusBadge";

type PaymentTab = "collect" | "history" | "refunds" | "expenses";

function PaymentsContent() {
  const searchParams = useSearchParams();
  const {
    bookings,
    payments,
    expenses,
    refunds,
    recordPayment,
    addExpense,
    processRefund,
  } = useDashboard();

  const initialTabParam = searchParams.get("tab");
  const resolvedParamTab: PaymentTab =
    initialTabParam === "refunds"
      ? "refunds"
      : initialTabParam === "history"
      ? "history"
      : initialTabParam === "expenses"
      ? "expenses"
      : "collect";
  const [tabState, setTabState] = useState<{ param: string | null; tab: PaymentTab }>({
    param: initialTabParam,
    tab: resolvedParamTab,
  });
  const activeTab = tabState.param === initialTabParam ? tabState.tab : resolvedParamTab;
  const setActiveTab = (tab: PaymentTab) => setTabState({ param: initialTabParam, tab });

  const bookingsWithBalance = bookings.filter(
    (b) => !b.isFreeUse && b.rent + b.deposit - b.paid > 0
  );

  const [selectedBookingId, setSelectedBookingId] = useState(
    bookingsWithBalance[0]?.id || bookings[0]?.id || ""
  );
  const [payType, setPayType] = useState<PaymentRecord["type"]>("Rent Balance");
  const [amount, setAmount] = useState<number>(4000);
  const [mode, setMode] = useState<PaymentMode>("Cash");
  const [reference, setReference] = useState("");
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);

  // Expense form
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState<"Cleaning" | "Electricity" | "Water" | "Repair" | "Supplies">("Cleaning");
  const [expAmount, setExpAmount] = useState(500);
  const [expPaidTo, setExpPaidTo] = useState("");
  const [expSaved, setExpSaved] = useState(false);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const selectedRemaining = selectedBooking
    ? Math.max(0, selectedBooking.rent + selectedBooking.deposit - selectedBooking.paid)
    : 0;

  const tabs: TabItem<PaymentTab>[] = [
    { id: "collect", label: "Collect Money", icon: Wallet },
    { id: "history", label: "Payment History", icon: History, count: payments.length },
    { id: "refunds", label: "Refund Deposit", icon: RotateCcw, count: refunds.length },
    { id: "expenses", label: "Expenses", icon: ReceiptText, count: expenses.length },
  ];

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rec = recordPayment({
      bookingId: selectedBookingId,
      type: payType,
      amount: Number(amount),
      mode,
      reference,
    });
    if (rec) {
      setLastReceipt(rec.receiptNo);
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
    setExpSaved(true);
  };

  return (
    <PageShell
      title="Payments & Money"
      subtitle="Collect booking money, give receipts, refund deposits, or log expenses."
    >
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Payments tabs" />

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "collect" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <form
              onSubmit={handleCollectSubmit}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid rgba(226, 181, 68, 0.35)",
                borderRadius: "18px",
                padding: "24px",
              }}
              className="lg:col-span-7 space-y-4"
            >
              <h2 style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }}>
                Record a Payment
              </h2>

              {lastReceipt && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 animate-check-pop">
                  <div className="flex items-center gap-2 text-emerald-800 text-[13.5px] font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Payment saved! Receipt {lastReceipt} created.</span>
                  </div>
                  <Link
                    href="/receipts"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2A5B] text-white text-[12.5px] font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </Link>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  1. Select Booking
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedBookingId(id);
                    const b = bookings.find((x) => x.id === id);
                    if (b) {
                      setAmount(Math.max(0, b.rent + b.deposit - b.paid));
                    }
                  }}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-medium text-[#0B2A5B]"
                >
                  {bookings.map((b) => {
                    const rem = Math.max(0, b.rent + b.deposit - b.paid);
                    return (
                      <option key={b.id} value={b.id}>
                        #{b.receiptNo} · {b.applicantName} ({b.eventTitle}) — Due: ₹
                        {rem.toLocaleString("en-IN")}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                    2. Payment For
                  </label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as PaymentRecord["type"])}
                    style={{ minHeight: "46px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
                  >
                    <option value="Rent Balance">Rent Balance</option>
                    <option value="Advance">Advance</option>
                    <option value="Security Deposit">Security Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                    3. Amount Received (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{ minHeight: "46px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[15px] font-bold text-[#0B2A5B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-2">
                  4. How was money paid?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(["Cash", "UPI", "Bank Transfer", "Cheque"] as PaymentMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      style={{ minHeight: "44px" }}
                      className={`rounded-xl text-[13px] font-semibold cursor-pointer transition-all ${
                        mode === m
                          ? "bg-[#0B2A5B] text-white border-2 border-[#E2B544] shadow-sm"
                          : "bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC] hover:border-[#E2B544]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Reference / Note (Optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="UPI ID, cheque number, or cash note"
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
                />
              </div>

              <button
                type="submit"
                style={{
                  minHeight: "48px",
                  background: "linear-gradient(135deg, #F7E6A9 0%, #E2B544 55%, #C9971C 100%)",
                  color: "#041535",
                  borderRadius: "12px",
                }}
                className="interactive-btn w-full text-[14.5px] font-bold cursor-pointer"
              >
                Save Payment & Make Receipt
              </button>
            </form>

            {/* Quick Pending Balances List */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid rgba(226, 181, 68, 0.35)",
                borderRadius: "18px",
                padding: "22px",
              }}
              className="lg:col-span-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                  Bookings With Balance Left
                </h3>
                <span className="text-[12px] font-bold text-[#C62828]">
                  Selected due: ₹{selectedRemaining.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-2.5">
                {bookingsWithBalance.map((b) => {
                  const due = Math.max(0, b.rent + b.deposit - b.paid);
                  const active = b.id === selectedBookingId;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBookingId(b.id);
                        setAmount(due);
                      }}
                      className={`interactive-row w-full text-left p-3.5 rounded-xl border cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? "bg-[#EFF6FF] border-[#0B2A5B]"
                          : "bg-[#FAF7F2] border-[#EFE4CC]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-[#0B2A5B] text-[13.5px] truncate">
                          {b.applicantName}
                        </div>
                        <div className="text-[12px] text-[#5B6474] truncate">
                          #{b.receiptNo} · {b.eventTitle} ({b.dateLabel})
                        </div>
                      </div>
                      <span className="font-extrabold text-[#C62828] text-[14px] shrink-0">
                        ₹{due.toLocaleString("en-IN")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            {payments.map((p, idx) => (
              <div
                key={p.id}
                style={{ animationDelay: `${idx * 35}ms` }}
                className="interactive-row animate-fade-up flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EFE4CC]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC]">
                      {p.receiptNo}
                    </span>
                    <span className="font-bold text-[#0B2A5B] text-[15px]">{p.applicantName}</span>
                  </div>
                  <p className="text-[13px] text-[#5B6474] mt-1">
                    {p.eventTitle} · {p.type} · Paid via <strong>{p.mode}</strong> on {p.dateLabel}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[18px] font-extrabold text-[#15803D]">
                    ₹{p.amount.toLocaleString("en-IN")}
                  </span>
                  <Link
                    href="/receipts"
                    style={{ minHeight: "40px" }}
                    className="interactive-btn px-3.5 py-2 rounded-xl bg-[#FAF5EB] border border-[#E2B544] text-[#0B2A5B] text-[12.5px] font-semibold inline-flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "refunds" && (
          <div className="space-y-3.5">
            {refunds.map((r) => {
              const netRefund = Math.max(0, r.heldAmount - r.deductionAmount);
              return (
                <div
                  key={r.id}
                  className="interactive-card bg-white rounded-2xl border border-[#EFE4CC] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-[#0B2A5B] text-[16px]">
                        {r.applicantName} · {r.eventTitle}
                      </h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-[13px] text-[#5B6474]">
                      Booking #{r.bookingReceiptNo} ({r.eventDate}) · {r.deductionNote}
                    </p>
                    <p className="text-[13px] text-[#14213D]">
                      Held: <strong>₹{r.heldAmount.toLocaleString("en-IN")}</strong> − Deduction:{" "}
                      <strong>₹{r.deductionAmount.toLocaleString("en-IN")}</strong> = Refund:{" "}
                      <strong className="text-[#15803D]">
                        ₹{netRefund.toLocaleString("en-IN")}
                      </strong>
                    </p>
                  </div>

                  {r.status === "Ready to Refund" && (
                    <button
                      type="button"
                      onClick={() => processRefund(r.id, r.deductionAmount, r.deductionNote)}
                      style={{
                        minHeight: "44px",
                        background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                        color: "#FFFFFF",
                        borderRadius: "10px",
                      }}
                      className="interactive-btn px-4 py-2 text-[13.5px] font-semibold cursor-pointer shrink-0"
                    >
                      Refund ₹{netRefund.toLocaleString("en-IN")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              {expenses.map((ex) => (
                <div
                  key={ex.id}
                  className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0B2A5B] text-[14.5px]">{ex.title}</span>
                      <StatusBadge status={ex.status} />
                    </div>
                    <p className="text-[12.5px] text-[#5B6474] mt-0.5">
                      {ex.category} · Paid to {ex.paidTo} · {ex.dateLabel}
                    </p>
                  </div>
                  <span className="text-[16px] font-extrabold text-[#C62828] shrink-0">
                    ₹{ex.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleExpenseSubmit}
              className="lg:col-span-5 bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3.5"
            >
              <h3 className="font-bold text-[#0B2A5B] text-[16px]">+ Add Centre Expense</h3>
              {expSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12.5px] font-semibold">
                  Expense added!
                </div>
              )}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1">
                  What was spent on?
                </label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Cleaning soap & brooms"
                  style={{ minHeight: "44px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1">
                    Type
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) =>
                      setExpCategory(
                        e.target.value as
                          | "Cleaning"
                          | "Electricity"
                          | "Water"
                          | "Repair"
                          | "Supplies"
                      )
                    }
                    style={{ minHeight: "44px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                  >
                    <option value="Cleaning">Cleaning</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Water">Water</option>
                    <option value="Repair">Repair</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    style={{ minHeight: "44px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px] font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1">
                  Paid To
                </label>
                <input
                  type="text"
                  value={expPaidTo}
                  onChange={(e) => setExpPaidTo(e.target.value)}
                  placeholder="Shop or person name"
                  style={{ minHeight: "44px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px]"
                />
              </div>
              <button
                type="submit"
                style={{ minHeight: "44px" }}
                className="interactive-btn w-full rounded-xl bg-[#0B2A5B] text-white text-[13.5px] font-bold cursor-pointer"
              >
                Save Expense
              </button>
            </form>
          </div>
        )}
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
