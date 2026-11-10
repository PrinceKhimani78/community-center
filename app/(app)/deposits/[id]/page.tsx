"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Camera, Check, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import type { DepositDeductionItem, PaymentMode } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import { formatBookingCode } from "@/lib/utils/bookings";

function DepositRefundContent() {
  const params = useParams<{ id: string }>();
  const { refunds, role, updateDepositRefund } = useDashboard();

  const currentRefund =
    refunds.find((r) => r.bookingReceiptNo === params.id || r.id === params.id) ||
    refunds[0];

  const [showAddDeduction, setShowAddDeduction] = useState(false);
  const [dedItem, setDedItem] = useState("");
  const [dedLocation, setDedLocation] = useState("Ground Floor · hall");
  const [dedAmount, setDedAmount] = useState(500);
  const [dedPhotos, setDedPhotos] = useState(1);

  const [refundMode, setRefundMode] = useState<PaymentMode>(currentRefund.refundMode);
  const [upiOrAccount, setUpiOrAccount] = useState(currentRefund.upiOrAccount || "");
  const [remarks, setRemarks] = useState(currentRefund.remarks || "");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const items: DepositDeductionItem[] = useMemo(
    () => currentRefund.deductionItems || [],
    [currentRefund.deductionItems]
  );

  const totalDeductions =
    items.length > 0
      ? items.reduce((s, d) => s + d.amount, 0)
      : currentRefund.deductionAmount;

  const refundAmount = Math.max(0, currentRefund.heldAmount - totalDeductions);

  const steps = useMemo(() => {
    const isApprovalStep = currentRefund.status === "Sent for Approval";
    const isRefunded = currentRefund.status === "Refunded";
    return [
      {
        num: 1,
        title: "Deposit collected",
        sub: currentRefund.collectedLabel || `₹${currentRefund.heldAmount.toLocaleString("en-IN")}`,
        state: "done" as const,
      },
      {
        num: 2,
        title: "Post-event inspection",
        sub: currentRefund.inspectionRef || "Checked after event",
        state: "done" as const,
      },
      {
        num: 3,
        title: "Deductions",
        sub: `₹${totalDeductions.toLocaleString("en-IN")}`,
        state: "done" as const,
      },
      {
        num: 4,
        title: "Approval",
        sub: isRefunded
          ? "Approved by Admin"
          : isApprovalStep
          ? "Waiting for Admin"
          : "Ready to submit",
        state: isRefunded ? ("done" as const) : ("current" as const),
      },
      {
        num: 5,
        title: "Refunded",
        sub: isRefunded ? "Payout completed" : "Pending",
        state: isRefunded ? ("done" as const) : ("upcoming" as const),
      },
    ];
  }, [currentRefund, totalDeductions]);

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dedItem.trim()) return;
    const nextItems: DepositDeductionItem[] = [
      ...items,
      {
        id: `ded-${Date.now()}`,
        item: dedItem.trim(),
        location: dedLocation.trim() || "Ground Floor",
        photosCount: Number(dedPhotos || 1),
        amount: Number(dedAmount || 0),
      },
    ];
    const nextTotal = nextItems.reduce((s, d) => s + d.amount, 0);
    updateDepositRefund(currentRefund.id, {
      deductionItems: nextItems,
      deductionAmount: nextTotal,
      deductionNote: nextItems.map((i) => i.item).join(", "),
    });
    setDedItem("");
    setShowAddDeduction(false);
  };

  const handleRemoveDeduction = (dedId: string) => {
    const nextItems = items.filter((d) => d.id !== dedId);
    const nextTotal = nextItems.reduce((s, d) => s + d.amount, 0);
    updateDepositRefund(currentRefund.id, {
      deductionItems: nextItems,
      deductionAmount: nextTotal,
      deductionNote: nextItems.length
        ? nextItems.map((i) => i.item).join(", ")
        : "No deductions",
    });
  };

  const handleSubmitSettlement = () => {
    const nextStatus = role === "admin" ? "Refunded" : "Sent for Approval";
    updateDepositRefund(currentRefund.id, {
      refundMode,
      upiOrAccount: upiOrAccount.trim(),
      remarks: remarks.trim(),
      deductionAmount: totalDeductions,
      status: nextStatus,
    });
    setActionMsg(
      nextStatus === "Refunded"
        ? `Approved & refunded ₹${refundAmount.toLocaleString("en-IN")} via ${refundMode}.`
        : `Sent ₹${refundAmount.toLocaleString("en-IN")} refund settlement for Admin approval.`
    );
  };

  return (
    <PageShell hideHeader>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-[#5B6474]">
              Finance · Deposit refund workflow
            </div>
            <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>
              Deposit Refund · {formatBookingCode(currentRefund.bookingReceiptNo)}
            </h1>
          </div>

          <Link
            href="/payments"
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
            <span>Payments & Expenses</span>
          </Link>
        </div>

        {/* 5-Step Progress Strip (matches 4.11) */}
        <section className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5 overflow-x-auto">
          <div className="flex items-center justify-between gap-3 min-w-[680px]">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${
                      s.state === "done"
                        ? "bg-[#15803D] text-white"
                        : s.state === "current"
                        ? "bg-[#F5B700] text-[#041535]"
                        : "bg-[#F3F4F6] text-[#5B6474]"
                    }`}
                  >
                    {s.state === "done" ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </span>
                  <div>
                    <div className="text-[13px] font-bold text-[#0B2A5B] leading-tight">
                      {s.title}
                    </div>
                    <div className="text-[11.5px] text-[#5B6474]">{s.sub}</div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] min-w-[20px] ${
                      s.state === "done" ? "bg-[#15803D]" : "bg-[#E5E7EB]"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {actionMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[13px] font-semibold flex items-center gap-2 animate-check-pop">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 8 COLS */}
          <div className="lg:col-span-8 space-y-5">
            {/* Summary Strip */}
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
              <div>
                <div className="text-[11.5px] text-[#5B6474]">Customer</div>
                <div className="font-bold text-[#0B2A5B] mt-0.5">
                  {currentRefund.applicantName}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-[#5B6474]">Event</div>
                <div className="font-bold text-[#0B2A5B] mt-0.5">
                  {currentRefund.eventTitle} · {currentRefund.eventDate}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-[#5B6474]">Deposit Collected</div>
                <div className="notranslate font-bold text-[#0B2A5B] mt-0.5">
                  {currentRefund.collectedLabel ||
                    `₹${currentRefund.heldAmount.toLocaleString("en-IN")}`}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] text-[#5B6474]">Inspection</div>
                <Link
                  href={`/inspections/${currentRefund.bookingReceiptNo}`}
                  className="font-bold text-[#0B2A5B] hover:text-[#C9971C] mt-0.5 inline-block"
                >
                  {currentRefund.inspectionRef || "View Hall Check →"}
                </Link>
              </div>
            </div>

            {/* Damage Deductions Card */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                  Damage Deductions
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddDeduction((v) => !v)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-[#0B2A5B]/30 text-[#0B2A5B] text-[12.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add deduction</span>
                </button>
              </div>

              {showAddDeduction && (
                <form
                  onSubmit={handleAddDeduction}
                  className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2B544] grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
                >
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#14213D] mb-1">
                      Damage Item *
                    </label>
                    <input
                      type="text"
                      required
                      value={dedItem}
                      onChange={(e) => setDedItem(e.target.value)}
                      placeholder="e.g. Broken chair"
                      className="w-full h-9 rounded-lg border border-[#E5D9BF] bg-white px-2.5 text-[12.5px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#14213D] mb-1">
                      Found In
                    </label>
                    <input
                      type="text"
                      value={dedLocation}
                      onChange={(e) => setDedLocation(e.target.value)}
                      className="w-full h-9 rounded-lg border border-[#E5D9BF] bg-white px-2.5 text-[12.5px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#14213D] mb-1">
                      Photos / Amount (₹)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={dedPhotos}
                        onChange={(e) => setDedPhotos(Number(e.target.value))}
                        className="w-14 h-9 rounded-lg border border-[#E5D9BF] bg-white px-2 text-[12.5px]"
                        title="Photo count"
                      />
                      <input
                        type="number"
                        min={0}
                        value={dedAmount}
                        onChange={(e) => setDedAmount(Number(e.target.value))}
                        className="flex-1 h-9 rounded-lg border border-[#E5D9BF] bg-white px-2.5 text-[12.5px] font-bold"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="h-9 px-3 rounded-lg bg-[#0B2A5B] text-white text-[12.5px] font-bold cursor-pointer"
                  >
                    Add Item
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px] text-[13.5px]">
                  <thead>
                    <tr className="border-b border-[#F1ECE1] text-[12px] text-[#5B6474]">
                      <th className="py-2.5 pr-3 font-semibold">Item</th>
                      <th className="py-2.5 px-3 font-semibold">Found in</th>
                      <th className="py-2.5 px-3 font-semibold">Evidence</th>
                      <th className="py-2.5 pl-3 text-right font-semibold">Amount</th>
                      <th className="py-2.5 pl-2 text-right font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1ECE1]">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-5 text-center text-[#5B6474]">
                          Zero damage deductions — full deposit ready to refund.
                        </td>
                      </tr>
                    ) : (
                      items.map((d) => (
                        <tr key={d.id}>
                          <td className="py-3 pr-3 font-bold text-[#0B2A5B]">{d.item}</td>
                          <td className="py-3 px-3 text-[#5B6474]">{d.location}</td>
                          <td className="py-3 px-3 font-semibold text-[#0B2A5B]">
                            <span className="inline-flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5 text-[#C9971C]" />
                              <span>
                                {d.photosCount} {d.photosCount === 1 ? "photo" : "photos"}
                              </span>
                            </span>
                          </td>
                          <td className="notranslate py-3 pl-3 text-right font-bold text-[#0B2A5B]">
                            ₹{d.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 pl-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveDeduction(d.id)}
                              className="p-1 text-[#5B6474] hover:text-[#C62828] cursor-pointer"
                              aria-label="Remove deduction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-[#FAF7F2]/60 font-bold">
                      <td colSpan={3} className="py-3 pr-3 text-[#0B2A5B]">
                        Total deductions
                      </td>
                      <td className="notranslate py-3 pl-3 text-right text-[#C62828]">
                        ₹{totalDeductions.toLocaleString("en-IN")}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Refund Details Card */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4">
              <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                Refund Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[12px] font-semibold text-[#14213D] mb-1.5">
                    Refund Mode
                  </label>
                  <select
                    value={refundMode}
                    onChange={(e) => setRefundMode(e.target.value as PaymentMode)}
                    style={{ minHeight: "42px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13.5px] font-semibold text-[#0B2A5B]"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#14213D] mb-1.5">
                    UPI ID / Account
                  </label>
                  <input
                    type="text"
                    value={upiOrAccount}
                    onChange={(e) => setUpiOrAccount(e.target.value)}
                    placeholder="e.g. imranpatel@okaxis"
                    style={{ minHeight: "42px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#14213D] mb-1.5">
                  Remarks
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Agreement notes with customer..."
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] p-3 text-[13.5px]"
                />
              </div>
            </section>
          </div>

          {/* RIGHT 4 COLS — NAVY SETTLEMENT + RECENT REFUNDS */}
          <div className="lg:col-span-4 space-y-5">
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
              <h3 className="text-[16px] font-bold">Settlement</h3>

              <div className="space-y-2 text-[13.5px] border-b border-white/15 pb-3.5">
                <div className="flex justify-between text-white/85">
                  <span>Deposit held</span>
                  <span className="notranslate font-semibold text-white">
                    ₹{currentRefund.heldAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-white/85">
                  <span>Deductions</span>
                  <span className="notranslate font-semibold text-white">
                    − ₹{totalDeductions.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-[13.5px] font-semibold text-white/90">Refund amount</span>
                <span className="notranslate text-[24px] font-extrabold text-[#F4CF6A]">
                  ₹{refundAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSubmitSettlement}
                  style={{
                    minHeight: "46px",
                    background: "linear-gradient(135deg, #F7E6A9 0%, #E2B544 55%, #C9971C 100%)",
                    color: "#041535",
                    borderRadius: "12px",
                  }}
                  className="interactive-btn w-full text-[13.5px] font-bold cursor-pointer"
                >
                  {currentRefund.status === "Refunded"
                    ? "Refund Completed"
                    : role === "admin"
                    ? "Approve & Mark Refunded"
                    : "Send for Approval"}
                </button>

                <Link
                  href={`/invoices/${currentRefund.bookingReceiptNo}?type=refund`}
                  style={{ minHeight: "44px" }}
                  className="w-full rounded-xl border border-white/25 text-white/90 hover:bg-white/10 text-[13px] font-semibold inline-flex items-center justify-center transition-colors"
                >
                  Preview Refund Receipt
                </Link>
              </div>
            </section>

            {/* Recent Refunds List */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3">
              <h3 style={{ color: "#0B2A5B", fontSize: "15.5px", fontWeight: 700 }}>
                Recent Refunds
              </h3>
              <div className="divide-y divide-[#F1ECE1]">
                {refunds.map((r) => {
                  const net = Math.max(0, r.heldAmount - r.deductionAmount);
                  const active = r.id === currentRefund.id;
                  return (
                    <Link
                      key={r.id}
                      href={`/deposits/${r.bookingReceiptNo}`}
                      className={`py-3 flex items-center justify-between gap-2 transition-colors ${
                        active ? "text-[#C9971C]" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-[#0B2A5B] text-[13.5px] truncate">
                          {r.applicantName}
                        </div>
                        <div className="text-[12px] text-[#5B6474] truncate">
                          {r.eventDate} ·{" "}
                          {r.deductionAmount > 0
                            ? `₹${r.deductionAmount.toLocaleString("en-IN")} deducted`
                            : "no deductions"}
                        </div>
                      </div>
                      <span className="notranslate font-bold text-[#15803D] text-[13.5px] shrink-0">
                        ₹{net.toLocaleString("en-IN")}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function DepositRefundPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading deposit refund...</div>}>
      <DepositRefundContent />
    </Suspense>
  );
}

