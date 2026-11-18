"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import type {
  MaintenanceQuotation,
  MaintenanceTicket,
  StoredPhoto,
} from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import { getTodayISO, hallsConflict, isDateInRange } from "@/lib/utils/bookings";
import { compressImageFiles } from "@/lib/utils/imageCompression";

const SUB_CATEGORIES: Record<MaintenanceTicket["category"], string[]> = {
  Electrical: ["Lighting", "Audio & Stage", "Fans", "Wiring & Panels"],
  Plumbing: ["Leakage", "Washroom Taps", "Water Supply"],
  "AC / Fans": ["Air Conditioner", "Gas Refill", "Ceiling Fans"],
  Carpentry: ["Fixtures", "Doors & Hinges", "Furniture"],
  Civil: ["Gates", "Painting", "Flooring"],
  Furniture: ["Chairs & Tables", "Stage"],
  Cleaning: ["Deep Cleaning", "Tank Cleaning"],
};

const LOCATIONS = [
  "Ground Floor",
  "Ground + First Floor",
  "Ground Floor Washroom",
  "Kitchen",
  "Entrance",
];

export default function NewMaintenanceRequestPage() {
  const router = useRouter();
  const { bookings, addMaintenanceTicket } = useDashboard();

  const [category, setCategory] = useState<MaintenanceTicket["category"]>("Electrical");
  const [subCategory, setSubCategory] = useState("Lighting");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("High");
  const [location, setLocation] = useState("Ground Floor");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [estimatedCost, setEstimatedCost] = useState(5000);
  const [quotations, setQuotations] = useState<MaintenanceQuotation[]>([
    { id: "q-1", vendor: "Shree Electricals", fileName: "quotation.pdf", amount: 5000 },
    { id: "q-2", vendor: "Patel Light House", fileName: "quote-photo.jpg", amount: 6200 },
  ]);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [quoteVendor, setQuoteVendor] = useState("");
  const [quoteAmount, setQuoteAmount] = useState(4500);

  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [compressingPhotos, setCompressingPhotos] = useState(false);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);

  const [blockHall, setBlockHall] = useState(true);
  const [blockDateISO, setBlockDateISO] = useState(() => getTodayISO());
  const [blockFrom, setBlockFrom] = useState("9:00 AM");
  const [blockTo, setBlockTo] = useState("5:00 PM");

  const [savedTicket, setSavedTicket] = useState<MaintenanceTicket | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const lowestQuoteAmount = useMemo(() => {
    if (quotations.length === 0) return null;
    return Math.min(...quotations.map((q) => q.amount));
  }, [quotations]);

  const calendarClash = useMemo(() => {
    if (!blockHall || !blockDateISO) return null;
    return bookings.find(
      (b) =>
        b.status !== "Cancelled" &&
        hallsConflict(b.hall, location) &&
        isDateInRange(blockDateISO, b.dateISO, b.endDateISO)
    );
  }, [bookings, blockHall, blockDateISO, location]);

  const handleCategoryChange = (nextCat: MaintenanceTicket["category"]) => {
    setCategory(nextCat);
    setSubCategory(SUB_CATEGORIES[nextCat]?.[0] || "General");
  };

  const handleAddQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteVendor.trim()) return;
    setQuotations((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        vendor: quoteVendor.trim(),
        fileName: "vendor-quote.pdf",
        amount: Number(quoteAmount || 0),
      },
    ]);
    setQuoteVendor("");
    setShowAddQuote(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setCompressingPhotos(true);
    setPhotoNotice(null);
    try {
      const compressed = await compressImageFiles(files, {
        maxDimension: 1200,
        initialQuality: 0.74,
        targetMaxKb: 180,
      });
      if (compressed.length > 0) {
        setPhotos((prev) => [
          ...prev,
          ...compressed.map((c) => ({
            id: c.id,
            name: c.name,
            dataUrl: c.dataUrl,
            sizeKb: c.sizeKb,
          })),
        ]);
        const origKb = compressed.reduce((s, c) => s + c.originalSizeKb, 0);
        const compKb = compressed.reduce((s, c) => s + c.sizeKb, 0);
        setPhotoNotice(
          `Added ${compressed.length} compressed photo${compressed.length > 1 ? "s" : ""} (${origKb} KB → ${compKb} KB) ready to store in DB.`
        );
      }
    } finally {
      setCompressingPhotos(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSave = async (asDraft: boolean) => {
    setFormError(null);
    setIsSaving(true);
    try {
      const resolvedTitle =
        title.trim() || `${category} (${subCategory}) issue in ${location}`;
      const created = await addMaintenanceTicket({
        title: resolvedTitle,
        category,
        subCategory,
        location,
        priority,
        estimatedCost: Math.max(0, Number(estimatedCost || 0)),
        description: description.trim(),
        quotations,
        photos,
        attachmentsLabel: `${quotations.length} quotation(s), ${photos.length} photo(s)`,
        blockHall,
        blockDateISO: blockHall ? blockDateISO : undefined,
        blockFrom: blockHall ? blockFrom : undefined,
        blockTo: blockHall ? blockTo : undefined,
        status: asDraft ? "Draft" : "Pending",
      });
      setSavedTicket(created);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save maintenance request."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (savedTicket) {
    return (
      <PageShell hideHeader>
        <div className="bg-white rounded-2xl border border-[#BBF7D0] p-8 max-w-lg mx-auto text-center space-y-4 animate-check-pop shadow-sm mt-6">
          <CheckCircle2 className="w-12 h-12 text-[#15803D] mx-auto" />
          <h2 className="text-[20px] font-bold text-[#0B2A5B]">
            {savedTicket.status === "Draft" ? "Draft Saved" : "Request Submitted"} (
            <span className="notranslate">{savedTicket.ticketNo}</span>)
          </h2>
          <p className="text-[13.5px] text-[#5B6474]">
            {savedTicket.title} · {savedTicket.location}
            {savedTicket.blockHall && savedTicket.blockDateISO
              ? ` · Calendar blocked on ${savedTicket.blockDateISO}`
              : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/maintenance")}
              className="interactive-btn px-5 py-2.5 rounded-xl bg-[#0B2A5B] text-white text-[13.5px] font-bold cursor-pointer"
            >
              View All Requests
            </button>
            <button
              type="button"
              onClick={() => setSavedTicket(null)}
              className="interactive-btn px-5 py-2.5 rounded-xl bg-[#FAF5EB] border border-[#E2B544] text-[#0B2A5B] text-[13.5px] font-bold cursor-pointer"
            >
              Add Another
            </button>
          </div>
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
              Facility · Maintenance · New
            </div>
            <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>
              New Maintenance Request
            </h1>
          </div>

          <Link
            href="/maintenance"
            style={{ minHeight: "40px" }}
            className="interactive-btn px-3.5 py-2 rounded-xl bg-white border border-[#EFE4CC] text-[#0B2A5B] text-[13px] font-semibold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Maintenance</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 8 COLS */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Issue Details */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs">
              <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                Issue Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value as MaintenanceTicket["category"])
                    }
                    style={{ minHeight: "44px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] font-semibold text-[#0B2A5B]"
                  >
                    {(Object.keys(SUB_CATEGORIES) as MaintenanceTicket["category"][]).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                    Sub Category
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    style={{ minHeight: "44px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] font-semibold text-[#0B2A5B]"
                  >
                    {(SUB_CATEGORIES[category] || []).map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Low", "Medium", "High"] as const).map((p) => {
                      const active = priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          style={{ minHeight: "44px" }}
                          className={`rounded-xl text-[13px] font-bold border cursor-pointer transition-all ${
                            active
                              ? p === "High"
                                ? "bg-[#FEF2F2] border-[#C62828] text-[#C62828]"
                                : p === "Medium"
                                ? "bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]"
                                : "bg-[#ECFDF5] border-[#15803D] text-[#15803D]"
                              : "bg-white border-[#EFE4CC] text-[#14213D]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ minHeight: "44px" }}
                    className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] font-semibold text-[#0B2A5B]"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                  Request Summary
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lights not working in Ground Floor hall"
                  style={{ minHeight: "44px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the repair work needed..."
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] p-3.5 text-[13.5px]"
                />
              </div>
            </section>

            {/* 2. Expense & Quotations */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs">
              <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                Expense & Quotations
              </h2>

              <div className="max-w-xs">
                <label className="block text-[12.5px] font-semibold text-[#14213D] mb-1.5">
                  Estimated Cost (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  style={{ minHeight: "44px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-bold text-[#0B2A5B]"
                />
              </div>

              <div className="space-y-2">
                {quotations.map((q) => {
                  const isLowest = lowestQuoteAmount === q.amount;
                  return (
                    <div
                      key={q.id}
                      className="rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] px-4 py-3 flex items-center justify-between gap-3 text-[13.5px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#C9971C] shrink-0" />
                        <span className="font-bold text-[#0B2A5B] truncate">{q.vendor}</span>
                        <span className="text-[#5B6474] text-[12.5px] truncate">
                          · {q.fileName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="notranslate font-bold text-[#0B2A5B]">
                          ₹{q.amount.toLocaleString("en-IN")}
                        </span>
                        {isLowest && (
                          <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold">
                            Lowest
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {showAddQuote ? (
                  <form
                    onSubmit={handleAddQuotation}
                    className="p-3 rounded-xl border border-[#E2B544] bg-[#FFFDF7] flex flex-wrap items-end gap-2.5"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[11.5px] font-semibold mb-1">
                        Vendor Name
                      </label>
                      <input
                        type="text"
                        required
                        value={quoteVendor}
                        onChange={(e) => setQuoteVendor(e.target.value)}
                        placeholder="Vendor name"
                        className="w-full h-9 rounded-lg border border-[#E5D9BF] bg-white px-2.5 text-[13px]"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-[11.5px] font-semibold mb-1">
                        Quote (₹)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={quoteAmount}
                        onChange={(e) => setQuoteAmount(Number(e.target.value))}
                        className="w-full h-9 rounded-lg border border-[#E5D9BF] bg-white px-2.5 text-[13px] font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-9 px-3.5 rounded-lg bg-[#0B2A5B] text-white text-[12.5px] font-bold cursor-pointer"
                    >
                      Save Quote
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddQuote(true)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-[#C9971C] text-[#0B2A5B] text-[13px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer hover:bg-[#FFFDF7]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add quotation</span>
                  </button>
                )}
              </div>
            </section>

            {/* 3. Photos */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                  Photos ({photos.length})
                </h2>
                <span className="text-[12px] text-[#5B6474]">
                  PC / Phone Gallery or Camera · Auto-compressed for DB
                </span>
              </div>

              {photoNotice && (
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[12px] font-semibold">
                  {photoNotice}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative h-28 rounded-xl overflow-hidden bg-[#EFECE3] border border-[#E5D9BF]"
                  >
                    <img
                      src={photo.dataUrl}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2 py-1 flex items-center justify-between gap-1 text-[10px] text-white">
                      <span className="truncate font-medium">{photo.name}</span>
                      {photo.sizeKb ? (
                        <span className="shrink-0 opacity-90">{photo.sizeKb} KB</span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      aria-label={`Remove ${photo.name}`}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-[#C62828] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <label className="h-28 rounded-xl border-2 border-dashed border-[#C9971C]/60 bg-[#FFFDF7] flex flex-col items-center justify-center p-2 text-center text-[#8A6510] text-[12px] font-bold cursor-pointer hover:bg-[#FEF5DD]/40">
                  {compressingPhotos ? (
                    <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                  ) : (
                    <FolderOpen className="w-5 h-5 mb-1" />
                  )}
                  <span>Upload from Device</span>
                  <span className="text-[10px] font-medium text-[#5B6474] mt-0.5">
                    PC / Phone Storage
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={compressingPhotos}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <label className="h-28 rounded-xl border-2 border-dashed border-[#0B2A5B]/35 bg-[#FAF5EB] flex flex-col items-center justify-center p-2 text-center text-[#0B2A5B] text-[12px] font-bold cursor-pointer hover:bg-[#F1E8D6]/60">
                  {compressingPhotos ? (
                    <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 mb-1 text-[#C9971C]" />
                  )}
                  <span>Take Photo</span>
                  <span className="text-[10px] font-medium text-[#5B6474] mt-0.5">
                    Phone Camera
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={compressingPhotos}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </section>

            {/* 4. Optional Calendar Block */}
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs">
              <label className="inline-flex items-center gap-2.5 text-[14.5px] font-bold text-[#0B2A5B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockHall}
                  onChange={(e) => setBlockHall(e.target.checked)}
                  className="w-4 h-4 accent-[#6D28D9] rounded"
                />
                <span>Block this location on the calendar during work</span>
              </label>

              {blockHall && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={blockDateISO}
                        onChange={(e) => setBlockDateISO(e.target.value)}
                        style={{ minHeight: "42px" }}
                        className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                        From
                      </label>
                      <input
                        type="text"
                        value={blockFrom}
                        onChange={(e) => setBlockFrom(e.target.value)}
                        style={{ minHeight: "42px" }}
                        className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                        To
                      </label>
                      <input
                        type="text"
                        value={blockTo}
                        onChange={(e) => setBlockTo(e.target.value)}
                        style={{ minHeight: "42px" }}
                        className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                      />
                    </div>
                  </div>

                  {calendarClash ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12.5px] font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        Booking clash: {calendarClash.eventTitle} ({calendarClash.applicantName}) is
                        booked in {calendarClash.hall} on {blockDateISO}.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] text-[#15803D] text-[12.5px] font-semibold">
                      No bookings in {location} on {blockDateISO}. Safe to block.
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* RIGHT 4 COLS — APPROVAL FLOW + SUBMIT */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-[76px]">
            <section className="bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs">
              <h3 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                Approval Flow
              </h3>

              <div className="space-y-3.5 text-[13px]">
                {[
                  { num: 1, title: "Raise request", sub: "You · now", active: true },
                  {
                    num: 2,
                    title: "Expense approval",
                    sub: "Admin · above ₹2,000",
                    active: false,
                  },
                  {
                    num: 3,
                    title: "Work in progress",
                    sub: "Vendor assigned",
                    active: false,
                  },
                  {
                    num: 4,
                    title: "Completed",
                    sub: "With bill & after-photos",
                    active: false,
                  },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11.5px] font-bold shrink-0 mt-0.5 ${
                        step.active
                          ? "bg-[#F5B700] text-[#041535]"
                          : "bg-[#F3F4F6] text-[#5B6474]"
                      }`}
                    >
                      {step.num}
                    </span>
                    <div>
                      <div className="font-bold text-[#0B2A5B]">{step.title}</div>
                      <div className="text-[12px] text-[#5B6474]">{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#C62828] text-[12.5px] font-semibold">
                {formError}
              </div>
            )}

            <button
              type="button"
              disabled={isSaving || compressingPhotos}
              onClick={() => void handleSave(false)}
              style={{
                minHeight: "46px",
                background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                color: "#FFFFFF",
                borderRadius: "12px",
              }}
              className="interactive-btn w-full text-[13.5px] font-bold cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Submitting..." : "Submit for Approval"}
            </button>

            <button
              type="button"
              disabled={isSaving || compressingPhotos}
              onClick={() => void handleSave(true)}
              style={{ minHeight: "44px" }}
              className="interactive-btn w-full rounded-xl bg-white border border-[#0B2A5B]/30 text-[#0B2A5B] text-[13.5px] font-bold cursor-pointer disabled:opacity-50"
            >
              Save as Draft
            </button>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

