"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  FolderOpen,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import type { HallCheckItem } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import { formatBookingCode } from "@/lib/utils/bookings";
import { compressImageFiles } from "@/lib/utils/imageCompression";

interface InspectionPhoto {
  id: string;
  bookingReceiptNo: string;
  mode: "Before Event" | "After Event";
  checklistItemId?: string;
  label: string;
  isIssue: boolean;
  dataUrl: string;
  sizeKb: number;
  uploadedBy?: string;
}

interface PropertyInspectionViewProps {
  initialBookingId?: string;
}

export default function PropertyInspectionView({
  initialBookingId = "",
}: PropertyInspectionViewProps) {
  const {
    bookings,
    hallCheckMode,
    setHallCheckMode,
    hallCheckItems: templateItems,
    saveInspectionToDepositRefund,
  } = useDashboard();

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "Cancelled"),
    [bookings]
  );

  const [selectedBookingNo, setSelectedBookingNo] = useState<string>(() => {
    const match = activeBookings.find(
      (b) => b.receiptNo === initialBookingId || b.id === initialBookingId
    );
    return match?.receiptNo || activeBookings[0]?.receiptNo || initialBookingId || "";
  });

  useEffect(() => {
    if (activeBookings.length === 0) return;
    const exists = activeBookings.some((b) => b.receiptNo === selectedBookingNo);
    if (!exists) {
      const initialMatch = activeBookings.find(
        (b) => b.receiptNo === initialBookingId || b.id === initialBookingId
      );
      setSelectedBookingNo(initialMatch?.receiptNo || activeBookings[0].receiptNo);
    }
  }, [activeBookings, selectedBookingNo, initialBookingId]);

  const booking = useMemo(
    () =>
      activeBookings.find((b) => b.receiptNo === selectedBookingNo) ||
      activeBookings[0] ||
      bookings[0],
    [activeBookings, bookings, selectedBookingNo]
  );

  // Per-booking isolated 7-point checklist state
  const [checkItems, setCheckItems] = useState<HallCheckItem[]>(() =>
    templateItems.map((i) => ({ ...i, status: "OK", issueCost: 0, note: "" }))
  );
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  const [uploadedPhotos, setUploadedPhotos] = useState<InspectionPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [photoTagItemId, setPhotoTagItemId] = useState<string>("");
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<InspectionPhoto | null>(null);

  const [savingInspection, setSavingInspection] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedToRefund, setSavedToRefund] = useState(false);

  const patchTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Fetch per-booking checklist AND photos from MariaDB whenever booking changes
  useEffect(() => {
    if (!booking?.receiptNo) return;
    let cancelled = false;
    setLoadingChecklist(true);
    setLoadingPhotos(true);
    setUploadError(null);
    setSaveError(null);
    setSavedToRefund(false);

    fetch(`/api/inspections/${encodeURIComponent(booking.receiptNo)}/checklist`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.items) && data.items.length > 0) {
          setCheckItems(data.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingChecklist(false);
      });

    fetch(`/api/inspections/${encodeURIComponent(booking.receiptNo)}/photos`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.photos)) {
          setUploadedPhotos(data.photos);
        } else if (!cancelled) {
          setUploadedPhotos([]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingPhotos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [booking?.receiptNo]);

  const persistChecklistItem = (
    receiptNo: string,
    itemId: string,
    status: "OK" | "Issue",
    issueCost: number,
    note: string,
    debounceMs = 0
  ) => {
    const key = `${receiptNo}:${itemId}`;
    if (patchTimersRef.current[key]) {
      clearTimeout(patchTimersRef.current[key]);
    }
    const run = async () => {
      try {
        const res = await fetch(
          `/api/inspections/${encodeURIComponent(receiptNo)}/checklist/${encodeURIComponent(itemId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, issueCost, note }),
          }
        );
        if (!res.ok) {
          const errPayload = await res.json().catch(() => null);
          setSaveError(errPayload?.message || "Could not save checklist change.");
        }
      } catch {
        setSaveError("Network error saving checklist item.");
      }
    };
    if (debounceMs > 0) {
      patchTimersRef.current[key] = setTimeout(() => void run(), debounceMs);
    } else {
      void run();
    }
  };

  const updateCheckItem = (
    itemId: string,
    status: "OK" | "Issue",
    rawCost = 0,
    note = "",
    debounceMs = 0
  ) => {
    if (!booking) return;
    const safeCost = status === "OK" ? 0 : Math.max(0, Math.round(Number(rawCost) || 0));
    const safeNote = status === "OK" ? "" : note;
    setSaveError(null);
    setCheckItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status, issueCost: safeCost, note: safeNote }
          : item
      )
    );
    persistChecklistItem(booking.receiptNo, itemId, status, safeCost, safeNote, debounceMs);
  };

  const okCount = checkItems.filter((i) => i.status === "OK").length;
  const issueItems = checkItems.filter((i) => i.status === "Issue");
  const totalDeduction = issueItems.reduce((sum, i) => sum + Math.max(0, i.issueCost || 0), 0);
  const exceedsHeldDeposit = booking ? totalDeduction > booking.deposit : false;

  const beforePhotos = useMemo(
    () => uploadedPhotos.filter((p) => p.mode === "Before Event"),
    [uploadedPhotos]
  );
  const afterPhotos = useMemo(
    () => uploadedPhotos.filter((p) => p.mode === "After Event"),
    [uploadedPhotos]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !booking) return;

    setCompressing(true);
    setUploadError(null);
    setUploadNotice(null);

    try {
      const compressed = await compressImageFiles(files, {
        maxDimension: 1200,
        initialQuality: 0.74,
        targetMaxKb: 180,
      });

      if (compressed.length === 0) {
        setUploadError("Please select valid image files (JPG, PNG, WebP).");
        return;
      }

      const linkedItemId =
        hallCheckMode === "After Event" && photoTagItemId ? photoTagItemId : undefined;

      const payloadPhotos = compressed.map((c) => ({
        label: c.name,
        mode: hallCheckMode,
        checklistItemId: linkedItemId,
        isIssue: hallCheckMode === "After Event" && (Boolean(linkedItemId) || issueItems.length > 0),
        dataUrl: c.dataUrl,
        sizeKb: c.sizeKb,
      }));

      const totalOrigKb = compressed.reduce((s, c) => s + c.originalSizeKb, 0);
      const totalCompKb = compressed.reduce((s, c) => s + c.sizeKb, 0);

      const res = await fetch(
        `/api/inspections/${encodeURIComponent(booking.receiptNo)}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos: payloadPhotos }),
        }
      );
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setUploadError(data?.message || `Could not save photo to database (HTTP ${res.status}).`);
        return;
      }

      if (Array.isArray(data?.photos)) {
        setUploadedPhotos(data.photos);
        setUploadNotice(
          `Saved ${compressed.length} photo${compressed.length > 1 ? "s" : ""} to DB (compressed ${totalOrigKb} KB → ${totalCompKb} KB).`
        );
      }
    } catch {
      setUploadError("Could not process image. Please try another photo.");
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const previous = uploadedPhotos;
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (previewPhoto?.id === photoId) setPreviewPhoto(null);

    const res = await fetch(`/api/inspections/photos/${encodeURIComponent(photoId)}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!res || !res.ok) {
      setUploadedPhotos(previous);
      setUploadError("Could not delete photo from database.");
    }
  };

  const handleSaveAndSend = async () => {
    if (!booking) return;
    setSaveError(null);
    setSavedToRefund(false);

    if (hallCheckMode === "After Event" && totalDeduction > booking.deposit) {
      setSaveError(
        `Total deduction (₹${totalDeduction.toLocaleString("en-IN")}) cannot exceed held security deposit (₹${booking.deposit.toLocaleString("en-IN")}).`
      );
      return;
    }

    setSavingInspection(true);
    try {
      await saveInspectionToDepositRefund(booking.receiptNo, hallCheckMode, checkItems);
      setSavedToRefund(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save inspection.");
    } finally {
      setSavingInspection(false);
    }
  };

  if (!booking) {
    return (
      <PageShell hideHeader>
        <div className="bg-white rounded-2xl border border-[#EFE4CC] p-8 text-center space-y-3">
          <h1 className="text-[18px] font-bold text-[#0B2A5B]">No bookings available to inspect</h1>
          <p className="text-[13px] text-[#5B6474]">
            Create or confirm a hall booking first to run Before/After Event inspections.
          </p>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold"
          >
            Go to Bookings
          </Link>
        </div>
      </PageShell>
    );
  }

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
            value={booking.receiptNo}
            onChange={(e) => {
              setSelectedBookingNo(e.target.value);
              setSavedToRefund(false);
              setUploadNotice(null);
              setSaveError(null);
              setPhotoTagItemId("");
            }}
            style={{ minHeight: "42px" }}
            aria-label="Select booking to inspect"
            className="rounded-xl border border-[#EFE4CC] bg-white px-3.5 text-[13px] font-bold text-[#0B2A5B]"
          >
            {activeBookings.map((b) => (
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
              {booking.applicantName} · Event on {booking.dateLabel} · Security Deposit: ₹
              {booking.deposit.toLocaleString("en-IN")}
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
                    setSaveError(null);
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

        {saveError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#C62828] text-[13px] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {savedToRefund && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[13px] font-semibold flex flex-wrap items-center justify-between gap-2 animate-check-pop">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {hallCheckMode} inspection saved to DB for{" "}
                <span className="notranslate">{formatBookingCode(booking.receiptNo)}</span>
                {hallCheckMode === "After Event" ? " and synced with Deposit Refund." : "."}
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
          {/* LEFT 7 COLS — 7-POINT CHECKLIST (SCOPED PER BOOKING) */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <h3 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                {checkItems.length}-Point Standard Checklist
              </h3>
              <span
                className={`text-[13px] font-extrabold ${
                  okCount === checkItems.length ? "text-[#15803D]" : "text-[#C62828]"
                }`}
              >
                {loadingChecklist ? "Loading..." : `${okCount} / ${checkItems.length} OK`}
              </span>
            </div>

            <div className="space-y-2.5">
              {checkItems.map((item) => {
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
                          updateCheckItem(
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
                          updateCheckItem(
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
                            updateCheckItem(item.id, "Issue", item.issueCost, e.target.value, 350)
                          }
                          placeholder="Describe issue (e.g. 2 chairs broken)"
                          className="sm:col-span-8 h-9 rounded-lg border border-[#FECACA] bg-white px-3 text-[12.5px] text-[#14213D]"
                        />
                        <div className="sm:col-span-4 flex items-center gap-1.5">
                          <span className="text-[12px] font-bold text-[#C62828]">₹</span>
                          <input
                            type="number"
                            min={0}
                            max={booking.deposit}
                            value={item.issueCost}
                            onChange={(e) =>
                              updateCheckItem(
                                item.id,
                                "Issue",
                                Math.max(0, Number(e.target.value || 0)),
                                item.note,
                                350
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
              Saved individually for{" "}
              <span className="font-bold text-[#0B2A5B]">{formatBookingCode(booking.receiptNo)}</span>.
              Click any item to toggle between OK and Issue.
            </p>
          </section>

          {/* RIGHT 5 COLS — PHOTOS + DAMAGE ESTIMATE */}
          <div className="lg:col-span-5 space-y-5">
            {/* Before & After Photos */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                    Before & After Photos
                  </h3>
                  <p className="text-[11.5px] text-[#5B6474]">
                    Adding to: <span className="font-bold text-[#0B2A5B]">{hallCheckMode}</span> ·
                    Auto-compressed for DB
                  </p>
                </div>
              </div>

              {hallCheckMode === "After Event" && issueItems.length > 0 && (
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#5B6474] mb-1">
                    Tag photo to flagged issue (optional)
                  </label>
                  <select
                    value={photoTagItemId}
                    onChange={(e) => setPhotoTagItemId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-[#EFE4CC] bg-[#FAF7F2] px-2.5 text-[12.5px] font-semibold text-[#0B2A5B]"
                  >
                    <option value="">General post-event photo</option>
                    {issueItems.map((iss) => (
                      <option key={iss.id} value={iss.id}>
                        {iss.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dual Upload Controls: PC/Phone Local Storage + Phone Camera */}
              <div className="grid grid-cols-2 gap-2.5">
                <label className="px-3 py-2.5 rounded-xl bg-[#FAF5EB] border border-[#E2B544] text-[#0B2A5B] text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#FEF5DD]/70 transition-colors">
                  {compressing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FolderOpen className="w-4 h-4 text-[#C9971C]" />
                  )}
                  <span>Device / Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={compressing}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <label className="px-3 py-2.5 rounded-xl bg-[#0B2A5B] text-white text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#071E47] transition-colors">
                  {compressing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-[#E2B544]" />
                  )}
                  <span>Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={compressing}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadNotice && (
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[12px] font-semibold">
                  {uploadNotice}
                </div>
              )}

              {uploadError && (
                <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-[#C62828] text-[12px] font-semibold">
                  {uploadError}
                </div>
              )}

              {loadingPhotos ? (
                <div className="py-6 text-center text-[12.5px] text-[#5B6474] inline-flex items-center justify-center gap-2 w-full">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B2A5B]" />
                  <span>Loading saved photos from database...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  {/* BEFORE COLUMN */}
                  <div className="space-y-2">
                    <div className="font-semibold text-[#5B6474] flex items-center justify-between">
                      <span>Before · {booking.dateLabel}</span>
                      <span className="text-[11px] font-bold text-[#0B2A5B]">
                        {beforePhotos.length}
                      </span>
                    </div>
                    {beforePhotos.length === 0 ? (
                      <div className="h-24 rounded-xl bg-[#FAF7F2] border border-dashed border-[#DFD2B7] flex flex-col items-center justify-center p-2 text-center text-[#5B6474]">
                        <Camera className="w-4 h-4 mb-1 opacity-60" />
                        <span className="text-[11px]">No before photos</span>
                      </div>
                    ) : (
                      beforePhotos.map((ph) => (
                        <div
                          key={ph.id}
                          className="group relative h-24 rounded-xl overflow-hidden border border-[#D5DEC8] bg-[#EEF2EB]"
                        >
                          <img
                            src={ph.dataUrl}
                            alt={ph.label}
                            onClick={() => setPreviewPhoto(ph)}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2 py-1 flex items-center justify-between gap-1 text-[10px] text-white">
                            <span className="truncate font-medium">{ph.label}</span>
                            <span className="shrink-0 opacity-90">{ph.sizeKb} KB</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(ph.id)}
                            aria-label={`Remove ${ph.label}`}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-[#C62828] cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* AFTER COLUMN */}
                  <div className="space-y-2">
                    <div className="font-semibold text-[#5B6474] flex items-center justify-between">
                      <span>After · Post-event</span>
                      <span className="text-[11px] font-bold text-[#0B2A5B]">
                        {afterPhotos.length}
                      </span>
                    </div>
                    {afterPhotos.length === 0 ? (
                      <div
                        className={`h-24 rounded-xl border flex flex-col items-center justify-center p-2 text-center ${
                          issueItems.length > 0
                            ? "bg-[#FEF2F2] border-dashed border-[#FECACA] text-[#C62828]"
                            : "bg-[#ECFDF5] border-[#BBF7D0] text-[#15803D]"
                        }`}
                      >
                        {issueItems.length > 0 ? (
                          <>
                            <Camera className="w-4 h-4 mb-1" />
                            <span className="text-[11px] font-semibold">
                              Upload damage proof
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mb-1" />
                            <span className="font-semibold text-[11.5px]">All clear</span>
                          </>
                        )}
                      </div>
                    ) : (
                      afterPhotos.map((ph) => (
                        <div
                          key={ph.id}
                          className={`group relative h-24 rounded-xl overflow-hidden border-2 ${
                            ph.isIssue ? "border-[#C62828]/80" : "border-[#D5DEC8]"
                          } bg-[#FAF7F2]`}
                        >
                          <img
                            src={ph.dataUrl}
                            alt={ph.label}
                            onClick={() => setPreviewPhoto(ph)}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2 py-1 flex items-center justify-between gap-1 text-[10px] text-white">
                            <span className="truncate font-medium">{ph.label}</span>
                            <span className="shrink-0 opacity-90">{ph.sizeKb} KB</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(ph.id)}
                            aria-label={`Remove ${ph.label}`}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-[#C62828] cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
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

              <div className="border-t border-[#F1ECE1] pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B2A5B] text-[14px]">Total deduction</span>
                  <span
                    className={`notranslate text-[18px] font-extrabold ${
                      totalDeduction > 0 ? "text-[#C62828]" : "text-[#15803D]"
                    }`}
                  >
                    ₹{totalDeduction.toLocaleString("en-IN")}
                  </span>
                </div>
                {exceedsHeldDeposit && (
                  <p className="text-[12px] font-semibold text-[#C62828]">
                    Exceeds held deposit (₹{booking.deposit.toLocaleString("en-IN")}). Reduce
                    deduction to continue.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={savingInspection || (hallCheckMode === "After Event" && exceedsHeldDeposit)}
                onClick={handleSaveAndSend}
                style={{
                  minHeight: "46px",
                  background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                }}
                className="interactive-btn w-full text-[13.5px] font-bold cursor-pointer disabled:opacity-50"
              >
                {savingInspection
                  ? "Saving..."
                  : hallCheckMode === "Before Event"
                  ? "Save Before-Event Inspection"
                  : "Save & Send to Deposit Refund"}
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full-Size Image Preview */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-[#EFE4CC] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-[#0B2A5B] text-[14px] truncate">
                  {previewPhoto.label}
                </div>
                <div className="text-[11.5px] text-[#5B6474]">
                  {previewPhoto.mode} · {previewPhoto.sizeKb} KB (compressed in DB)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="w-8 h-8 rounded-full bg-[#FAF5EB] text-[#0B2A5B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#0B1220] flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={previewPhoto.dataUrl}
                alt={previewPhoto.label}
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
