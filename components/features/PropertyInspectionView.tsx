"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Camera, Check, CheckCircle2, Upload } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import { formatBookingCode } from "@/lib/utils/bookings";

interface PropertyInspectionViewProps {
  initialBookingId?: string;
}

export default function PropertyInspectionView({
  initialBookingId = "1048",
}: PropertyInspectionViewProps) {
  const {
    bookings,
    hallCheckMode,
    setHallCheckMode,
    hallCheckItems,
    setHallCheckItemStatus,
    saveInspectionToDepositRefund,
  } = useDashboard();

  const [selectedBookingNo, setSelectedBookingNo] = useState<string>(() => {
    const match = bookings.find(
      (b) => b.receiptNo === initialBookingId || b.id === initialBookingId
    );
    return match?.receiptNo || bookings[0]?.receiptNo || "1048";
  });

  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; label: string; isIssue: boolean }>>([
    { id: "ph-b1", label: "Seating area (Before)", isIssue: false },
    { id: "ph-b2", label: "Stage wall (Before)", isIssue: false },
  ]);
  const [savedToRefund, setSavedToRefund] = useState(false);

  const booking = useMemo(
    () => bookings.find((b) => b.receiptNo === selectedBookingNo) || bookings[0],
    [bookings, selectedBookingNo]
  );

  const okCount = hallCheckItems.filter((i) => i.status === "OK").length;
  const issueItems = hallCheckItems.filter((i) => i.status === "Issue");
  const totalDeduction = issueItems.reduce((sum, i) => sum + (i.issueCost || 0), 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added = Array.from(files).map((f, idx) => ({
      id: `up-${Date.now()}-${idx}`,
      label: `${f.name} (${hallCheckMode})`,
      isIssue: hallCheckMode === "After Event" && issueItems.length > 0,
    }));
    setUploadedPhotos((prev) => [...prev, ...added]);
    e.target.value = "";
  };

  const handleSaveAndSend = () => {
    saveInspectionToDepositRefund(booking.receiptNo, hallCheckMode);
    setSavedToRefund(true);
  };

  return (
    <PageShell hideHeader>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-[#5B6474]">
              Facility · Inspections
            </div>
            <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>
              Property Inspection ·{" "}
              <span className="notranslate">{formatBookingCode(booking.receiptNo)}</span>
            </h1>
          </div>

          <select
            value={selectedBookingNo}
            onChange={(e) => {
              setSelectedBookingNo(e.target.value);
              setSavedToRefund(false);
            }}
            style={{ minHeight: "42px" }}
            aria-label="Select booking to inspect"
            className="rounded-xl border border-[#EFE4CC] bg-white px-3.5 text-[13px] font-bold text-[#0B2A5B]"
          >
            {bookings
              .filter((b) => b.status !== "Cancelled")
              .map((b) => (
                <option key={b.id} value={b.receiptNo}>
                  {formatBookingCode(b.receiptNo)} · {b.eventTitle} ({b.applicantName})
                </option>
              ))}
          </select>
        </div>

        {/* Header Summary Card + Before / After Event Toggle */}
        <section className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <h2 className="text-[17px] font-bold text-[#0B2A5B]">
              {booking.eventTitle} · {booking.hall}
            </h2>
            <p className="text-[13px] text-[#5B6474] mt-0.5">
              {booking.applicantName} · Event on {booking.dateLabel} · Inspector: Yakub Mansuri
            </p>
          </div>

          <div className="inline-flex items-center bg-[#FAF5EB] border border-[#EFE4CC] rounded-xl p-1 self-start sm:self-auto">
            {(["Before Event", "After Event"] as const).map((modeOpt) => {
              const active = hallCheckMode === modeOpt;
              return (
                <button
                  key={modeOpt}
                  type="button"
                  onClick={() => {
                    setHallCheckMode(modeOpt);
                    setSavedToRefund(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-[13px] font-bold cursor-pointer transition-all ${
                    active ? "bg-[#0B2A5B] text-white shadow-xs" : "text-[#14213D]"
                  }`}
                >
                  {modeOpt}
                </button>
              );
            })}
          </div>
        </section>

        {savedToRefund && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[13px] font-semibold flex flex-wrap items-center justify-between gap-2 animate-check-pop">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {hallCheckMode} inspection saved for{" "}
                <span className="notranslate">{formatBookingCode(booking.receiptNo)}</span> and
                synced with Deposit Refund.
              </span>
            </span>
            <Link
              href={`/deposits/${booking.receiptNo}`}
              className="text-[#0B2A5B] underline font-bold"
            >
              Open Deposit Refund →
            </Link>
          </div>
        )}

        {/* MAIN 2-COLUMN BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 7 COLS — 7-POINT CHECKLIST */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <h3 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                Standard Checklist
              </h3>
              <span
                className={`text-[13px] font-extrabold ${
                  okCount === hallCheckItems.length ? "text-[#15803D]" : "text-[#C62828]"
                }`}
              >
                {okCount} / {hallCheckItems.length} OK
              </span>
            </div>

            <div className="space-y-2.5">
              {hallCheckItems.map((item) => {
                const isOk = item.status === "OK";
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-3.5 transition-all ${
                      isOk
                        ? "bg-white border-[#EFE4CC]"
                        : "bg-[#FEF2F2] border-[#FECACA]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setHallCheckItemStatus(
                            item.id,
                            isOk ? "Issue" : "OK",
                            isOk ? item.issueCost || 500 : 0,
                            isOk ? item.note || "Needs attention" : ""
                          )
                        }
                        className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isOk ? "bg-[#15803D] text-white" : "bg-[#C62828] text-white"
                          }`}
                        >
                          {isOk ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-[#0B2A5B] text-[14px]">
                            {item.label}
                          </div>
                          <div className="text-[12px] text-[#5B6474] truncate">
                            {isOk ? item.helper : item.note || item.helper}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHallCheckItemStatus(
                            item.id,
                            isOk ? "Issue" : "OK",
                            isOk ? item.issueCost || 500 : 0,
                            isOk ? item.note || "Needs attention" : ""
                          )
                        }
                        className={`text-[12.5px] font-extrabold shrink-0 cursor-pointer ${
                          isOk ? "text-[#15803D]" : "text-[#C62828]"
                        }`}
                      >
                        {isOk ? "OK" : "Issue"}
                      </button>
                    </div>

                    {!isOk && (
                      <div className="mt-3 pt-3 border-t border-[#FECACA] grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) =>
                            setHallCheckItemStatus(
                              item.id,
                              "Issue",
                              item.issueCost,
                              e.target.value
                            )
                          }
                          placeholder="Describe issue (e.g. 2 chairs broken)"
                          className="sm:col-span-8 h-9 rounded-lg border border-[#FECACA] bg-white px-3 text-[12.5px] text-[#14213D]"
                        />
                        <div className="sm:col-span-4 flex items-center gap-1.5">
                          <span className="text-[12px] font-bold text-[#C62828]">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={item.issueCost}
                            onChange={(e) =>
                              setHallCheckItemStatus(
                                item.id,
                                "Issue",
                                Number(e.target.value || 0),
                                item.note
                              )
                            }
                            aria-label={`Cost estimate for ${item.label}`}
                            className="w-full h-9 rounded-lg border border-[#FECACA] bg-white px-2.5 text-[13px] font-bold text-[#C62828]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[12px] text-[#5B6474] pt-1">
              Click any item to toggle between OK and Issue, and enter custom damage costs if any.
            </p>
          </section>

          {/* RIGHT 5 COLS — PHOTOS + DAMAGE ESTIMATE */}
          <div className="lg:col-span-5 space-y-5">
            {/* Before & After Photos */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                  Before & After Photos
                </h3>
                <label className="px-3.5 py-1.5 rounded-xl bg-white border border-[#0B2A5B]/30 text-[#0B2A5B] text-[12.5px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#FAF5EB]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="space-y-2">
                  <div className="font-semibold text-[#5B6474]">
                    Before · {booking.dateLabel}
                  </div>
                  {uploadedPhotos.slice(0, 2).map((ph) => (
                    <div
                      key={ph.id}
                      className="h-24 rounded-xl bg-[#EEF2EB] border border-[#D5DEC8] flex flex-col items-center justify-center p-2 text-center text-[#5B6474]"
                    >
                      <Camera className="w-4 h-4 mb-1 opacity-70" />
                      <span className="truncate w-full font-medium">{ph.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-[#5B6474]">
                    After · Post-event
                  </div>
                  {issueItems.length > 0 ? (
                    issueItems.slice(0, 2).map((iss) => (
                      <div
                        key={iss.id}
                        className="h-24 rounded-xl bg-[#FEF2F2] border-2 border-[#C62828]/70 flex flex-col items-center justify-center p-2 text-center text-[#C62828]"
                      >
                        <Camera className="w-4 h-4 mb-1" />
                        <span className="truncate w-full font-bold">
                          {iss.note || iss.label}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-24 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] flex flex-col items-center justify-center p-2 text-center text-[#15803D]">
                      <CheckCircle2 className="w-4 h-4 mb-1" />
                      <span className="font-semibold">All clear</span>
                    </div>
                  )}
                </div>
              </div>

              {uploadedPhotos.length > 2 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {uploadedPhotos.slice(2).map((ph) => (
                    <span
                      key={ph.id}
                      className="px-2.5 py-1 rounded-full bg-[#FAF5EB] border border-[#EFE4CC] text-[11.5px] font-semibold text-[#0B2A5B]"
                    >
                      {ph.label}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Damage Records & Cost Estimate */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs">
              <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                Damage Records & Cost Estimate
              </h3>

              {issueItems.length === 0 ? (
                <p className="text-[13px] text-[#15803D] font-semibold">
                  No damages flagged — ₹0 deduction.
                </p>
              ) : (
                <div className="divide-y divide-[#F1ECE1]">
                  {issueItems.map((iss) => (
                    <div
                      key={iss.id}
                      className="py-2.5 flex items-start justify-between gap-3 text-[13.5px]"
                    >
                      <div>
                        <div className="font-bold text-[#0B2A5B]">{iss.label}</div>
                        <div className="text-[12px] text-[#5B6474]">
                          {iss.note || "Repair / replacement"}
                        </div>
                      </div>
                      <span className="notranslate font-bold text-[#0B2A5B] shrink-0">
                        ₹{iss.issueCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-[#F1ECE1] pt-3 flex items-center justify-between">
                <span className="font-bold text-[#0B2A5B] text-[14px]">Total deduction</span>
                <span
                  className={`notranslate text-[18px] font-extrabold ${
                    totalDeduction > 0 ? "text-[#C62828]" : "text-[#15803D]"
                  }`}
                >
                  ₹{totalDeduction.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveAndSend}
                style={{
                  minHeight: "46px",
                  background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                }}
                className="interactive-btn w-full text-[13.5px] font-bold cursor-pointer"
              >
                Save & Send to Deposit Refund
              </button>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

