"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Download, FileText, Printer } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import { countBookingDays, formatBookingCode, getBookingBalance } from "@/lib/utils/bookings";

export type DocumentType = "invoice" | "payment" | "deposit" | "refund";

interface InvoicesReceiptsViewProps {
  initialBookingId?: string;
  initialType?: DocumentType;
}

const DOC_TYPES: Array<{ id: DocumentType; label: string; heading: string; prefix: string }> = [
  { id: "invoice", label: "Booking Invoice", heading: "INVOICE", prefix: "INV-2026-" },
  { id: "payment", label: "Payment Receipt", heading: "PAYMENT RECEIPT", prefix: "REC-2026-" },
  { id: "deposit", label: "Deposit Receipt", heading: "DEPOSIT RECEIPT", prefix: "DEP-2026-" },
  { id: "refund", label: "Refund Receipt", heading: "REFUND RECEIPT", prefix: "REF-2026-" },
];

export default function InvoicesReceiptsView({
  initialBookingId,
  initialType = "invoice",
}: InvoicesReceiptsViewProps) {
  const { bookings, applicants, payments, refunds } = useDashboard();

  const [docType, setDocType] = useState<DocumentType>(initialType);
  const [selectedBookingNo, setSelectedBookingNo] = useState<string>(() => {
    if (initialBookingId) {
      const found = bookings.find(
        (b) => b.receiptNo === initialBookingId || b.id === initialBookingId
      );
      if (found) return found.receiptNo;
    }
    return bookings[0]?.receiptNo || "1048";
  });

  const booking = useMemo(
    () => bookings.find((b) => b.receiptNo === selectedBookingNo) || bookings[0],
    [bookings, selectedBookingNo]
  );

  const customer = useMemo(
    () => applicants.find((a) => a.id === booking.applicantId),
    [applicants, booking]
  );

  const bookingPayments = useMemo(
    () =>
      payments.filter(
        (p) => p.bookingReceiptNo === booking.receiptNo || p.bookingId === booking.id
      ),
    [payments, booking]
  );

  const relatedRefund = useMemo(
    () => refunds.find((r) => r.bookingReceiptNo === booking.receiptNo),
    [refunds, booking]
  );

  const activeDocMeta = DOC_TYPES.find((d) => d.id === docType) || DOC_TYPES[0];
  const days = countBookingDays(booking.dateISO, booking.endDateISO);
  const totalBilled = booking.isFreeUse ? 0 : booking.rent + booking.deposit;
  const balanceDue = getBookingBalance(booking);

  const handlePrintOrPdf = () => {
    window.print();
  };

  return (
    <PageShell hideHeader>
      <div className="space-y-4">
        <div className="no-print">
          <div className="text-[12px] font-medium text-[#5B6474]">
            Finance · Invoice generator
          </div>
          <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>
            Invoices & Receipts
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 4 COLS — DOCUMENT TYPE + BOOKING PICKER + ACTIONS */}
          <aside className="no-print lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 space-y-2.5">
              <h2 className="font-bold text-[#0B2A5B] text-[15px] mb-1">Document Type</h2>
              {DOC_TYPES.map((dt) => {
                const active = docType === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setDocType(dt.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold border flex items-center gap-2.5 cursor-pointer transition-all ${
                      active
                        ? "bg-[#FEF5DD] border-[#E2B544] text-[#0B2A5B]"
                        : "bg-white border-[#EFE4CC] text-[#14213D] hover:border-[#E2B544]/60"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-[#0B2A5B] shrink-0" />
                    <span>{dt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 space-y-3">
              <div>
                <label className="block font-bold text-[#0B2A5B] text-[14px] mb-2">
                  Booking
                </label>
                <select
                  value={selectedBookingNo}
                  onChange={(e) => setSelectedBookingNo(e.target.value)}
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px] font-semibold text-[#0B2A5B]"
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.receiptNo}>
                      {formatBookingCode(b.receiptNo)} · {b.applicantName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handlePrintOrPdf}
                style={{
                  minHeight: "44px",
                  background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                }}
                className="interactive-btn w-full text-[13.5px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handlePrintOrPdf}
                style={{ minHeight: "42px" }}
                className="interactive-btn w-full rounded-xl bg-white border border-[#0B2A5B]/30 text-[#0B2A5B] text-[13.5px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <p className="text-[12px] text-[#5B6474] leading-relaxed">
                WhatsApp / Email sharing arrives with Phase 2 notifications.
              </p>
            </div>
          </aside>

          {/* RIGHT 8 COLS — A4 PRINTABLE DOCUMENT PREVIEW */}
          <div className="lg:col-span-8">
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #EFE4CC",
                borderTop: "5px solid #0B2A5B",
                borderRadius: "18px",
                padding: "clamp(20px, 4vw, 38px)",
              }}
              className="shadow-md space-y-6"
            >
              {/* Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E2B544] pb-5">
                <div className="flex items-center gap-3.5">
                  <Image
                    src="/logo.png"
                    alt="Valibhoy Community Centre logo"
                    width={62}
                    height={62}
                    className="rounded-full object-contain border border-[#E2B544] shrink-0"
                  />
                  <div>
                    <h2 className="text-[16.5px] font-bold text-[#0B2A5B] leading-snug">
                      Haji Mohamed Yunus Valibhoy Community Centre
                    </h2>
                    <p lang="gu" className="notranslate text-[13px] font-bold text-[#C9971C]">
                      હાજી મોહમ્મદ યુનુસ વલીભોય કોમ્યુનિટી સેન્ટર
                    </p>
                    <p className="text-[12px] text-[#5B6474] mt-0.5">
                      Dhari, Gujarat, India · [CENTRE PHONE]
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-[20px] font-extrabold text-[#0B2A5B] tracking-tight">
                    {activeDocMeta.heading}
                  </div>
                  <div className="notranslate text-[12.5px] font-bold text-[#5B6474] mt-0.5">
                    No. {activeDocMeta.prefix}
                    {booking.receiptNo.padStart(4, "0")}
                  </div>
                  <div className="text-[12px] text-[#5B6474]">
                    Date: {booking.createdAtLabel?.split(",")[0] || "20 Oct 2026"}
                  </div>
                </div>
              </div>

              {/* Billed To & Booking Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px]">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#C9971C]">
                    {docType === "refund"
                      ? "Refunded To"
                      : docType === "invoice"
                      ? "Billed To"
                      : "Received From"}
                  </div>
                  <div className="font-bold text-[#0B2A5B] text-[15px] mt-1">
                    {booking.applicantName}
                  </div>
                  <div className="text-[#5B6474] text-[13px]">
                    {customer?.address || "Dhari, Gujarat"}
                  </div>
                  {booking.phone && (
                    <div className="notranslate text-[#5B6474] text-[13px]">{booking.phone}</div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#C9971C]">
                    Booking
                  </div>
                  <div className="font-bold text-[#0B2A5B] text-[15px] mt-1">
                    <span className="notranslate">{formatBookingCode(booking.receiptNo)}</span> ·{" "}
                    {booking.eventTitle}
                  </div>
                  <div className="text-[#5B6474] text-[13px]">
                    {booking.hall} · {booking.dateLabel}
                  </div>
                  <div className="text-[#5B6474] text-[13px]">{booking.timing}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-[#EFE4CC] rounded-xl overflow-hidden">
                <div className="bg-[#0B2A5B] text-white px-4 py-2.5 flex justify-between text-[13px] font-bold">
                  <span>Description</span>
                  <span>Amount</span>
                </div>

                {docType === "invoice" && (
                  <div className="divide-y divide-[#F1ECE1] text-[13.5px]">
                    <div className="px-4 py-3.5 flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-[#0B2A5B]">
                          Hall rent · {booking.hall} {booking.isAC ? "(A.C.)" : ""}
                        </div>
                        <div className="text-[12px] text-[#5B6474]">
                          {days} {days === 1 ? "day" : "days"} · {booking.eventTitle}
                        </div>
                      </div>
                      <span className="notranslate font-bold text-[#0B2A5B]">
                        {booking.isFreeUse ? "₹0 (Free)" : `₹${booking.rent.toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    <div className="px-4 py-3.5 flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-[#0B2A5B]">Security deposit</div>
                        <div className="text-[12px] text-[#5B6474]">
                          Refundable after post-event inspection
                        </div>
                      </div>
                      <span className="notranslate font-bold text-[#0B2A5B]">
                        ₹{booking.deposit.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="px-4 py-3.5 bg-[#FAF7F2]/60 space-y-2">
                      <div className="flex justify-between text-[#0B2A5B] font-bold">
                        <span>Total</span>
                        <span className="notranslate">
                          ₹{totalBilled.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#15803D] font-semibold">
                        <span>Paid</span>
                        <span className="notranslate">
                          − ₹{booking.paid.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#0B2A5B]/30 pt-2 text-[#C62828] font-extrabold text-[15px]">
                        <span>Balance Due</span>
                        <span className="notranslate">
                          ₹{balanceDue.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {docType === "payment" && (
                  <div className="divide-y divide-[#F1ECE1] text-[13.5px]">
                    {bookingPayments.length === 0 ? (
                      <div className="px-4 py-5 text-[#5B6474] text-center">
                        No payment receipts recorded for this booking yet.
                      </div>
                    ) : (
                      bookingPayments.map((p) => (
                        <div
                          key={p.id}
                          className="px-4 py-3.5 flex justify-between items-start gap-4"
                        >
                          <div>
                            <div className="font-bold text-[#0B2A5B]">
                              {p.type} · <span className="notranslate">{p.receiptNo}</span>
                            </div>
                            <div className="text-[12px] text-[#5B6474]">
                              {p.dateLabel} · Mode: {p.mode} · Ref:{" "}
                              <span className="notranslate">{p.reference}</span>
                            </div>
                          </div>
                          <span className="notranslate font-bold text-[#15803D]">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))
                    )}
                    <div className="px-4 py-3 bg-[#FAF7F2]/60 flex justify-between font-extrabold text-[#0B2A5B]">
                      <span>Total Received</span>
                      <span className="notranslate text-[#15803D]">
                        ₹{booking.paid.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                {docType === "deposit" && (
                  <div className="divide-y divide-[#F1ECE1] text-[13.5px]">
                    <div className="px-4 py-4 flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-[#0B2A5B]">
                          Refundable Security Deposit Held
                        </div>
                        <div className="text-[12px] text-[#5B6474]">
                          Held against Hall Check & damages for {booking.dateLabel}
                        </div>
                      </div>
                      <span className="notranslate font-bold text-[#0B2A5B]">
                        ₹{booking.deposit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="px-4 py-3 bg-[#FAF7F2]/60 flex justify-between font-extrabold text-[#0B2A5B]">
                      <span>Deposit Status</span>
                      <span>{booking.depositStatus || "Held"}</span>
                    </div>
                  </div>
                )}

                {docType === "refund" && (
                  <div className="divide-y divide-[#F1ECE1] text-[13.5px]">
                    {(() => {
                      const held = relatedRefund?.heldAmount ?? booking.deposit;
                      const ded = relatedRefund?.deductionAmount ?? 0;
                      const net = Math.max(0, held - ded);
                      return (
                        <>
                          <div className="px-4 py-3.5 flex justify-between">
                            <span className="font-bold text-[#0B2A5B]">
                              Security deposit held
                            </span>
                            <span className="notranslate font-bold text-[#0B2A5B]">
                              ₹{held.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="px-4 py-3.5 flex justify-between">
                            <div>
                              <div className="font-bold text-[#0B2A5B]">Damage deductions</div>
                              <div className="text-[12px] text-[#5B6474]">
                                {relatedRefund?.deductionNote || "Zero damage"}
                              </div>
                            </div>
                            <span className="notranslate font-bold text-[#C62828]">
                              − ₹{ded.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="px-4 py-3.5 bg-[#FAF7F2]/60 flex justify-between font-extrabold text-[#15803D] text-[15px]">
                            <span>
                              Net Refund ({relatedRefund?.refundMode || "Cash / UPI"})
                            </span>
                            <span className="notranslate">₹{net.toLocaleString("en-IN")}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Footer & Signature */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 text-[12px] text-[#5B6474]">
                <div className="space-y-1 max-w-md">
                  <p>
                    Balance to be paid before the event date. Security deposit is refunded after
                    inspection, less any damages.
                  </p>
                  <p>Thank you for choosing our community centre. Serving Humanity.</p>
                </div>

                <div className="text-center shrink-0">
                  <div className="w-40 border-b border-[#0B2A5B]/50 mb-1.5" />
                  <span className="font-semibold text-[#0B2A5B]">Authorised Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
