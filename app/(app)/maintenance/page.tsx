"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardCheck, Image as ImageIcon, Loader2, Plus, Search, X } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import type { MaintenanceTicket, StoredPhoto } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import StatusBadge from "@/components/common/StatusBadge";
import PropertyInspectionView from "@/components/features/PropertyInspectionView";

function getTicketPhotoCount(t: MaintenanceTicket): number {
  if (typeof t.photoCount === "number") return t.photoCount;
  if (!Array.isArray(t.photos)) return 0;
  return t.photos.filter(
    (p) =>
      typeof p === "object" &&
      p !== null &&
      (Boolean(p.hasImage) || (typeof p.dataUrl === "string" && p.dataUrl.startsWith("data:image/")))
  ).length;
}

function getInlinePhotos(photos?: Array<string | StoredPhoto>): StoredPhoto[] {
  if (!Array.isArray(photos)) return [];
  return photos.filter(
    (p): p is StoredPhoto =>
      typeof p === "object" &&
      p !== null &&
      typeof p.dataUrl === "string" &&
      p.dataUrl.startsWith("data:image/")
  );
}

const STATUS_TABS: Array<"All" | MaintenanceTicket["status"]> = [
  "All",
  "Pending",
  "Approved",
  "In Progress",
  "Completed",
];

const CATEGORIES = [
  "All",
  "Electrical",
  "Plumbing",
  "AC / Fans",
  "Carpentry",
  "Civil",
  "Furniture",
  "Cleaning",
];

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { role, bookings, tickets, updateTicketStatus } = useDashboard();
  const isAdmin = role === "admin";
  const defaultInspectionReceipt =
    bookings.find((b) => b.status !== "Cancelled")?.receiptNo || bookings[0]?.receiptNo || "1056";

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | MaintenanceTicket["status"]>("All");
  const [galleryTicket, setGalleryTicket] = useState<{
    ticketNo: string;
    title: string;
    photos: StoredPhoto[];
    activeIdx: number;
  } | null>(null);
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null);
  const [photoCache, setPhotoCache] = useState<Record<string, StoredPhoto[]>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const openTicketPhotos = async (t: MaintenanceTicket) => {
    const cached = photoCache[t.id];
    if (cached && cached.length > 0) {
      setGalleryTicket({ ticketNo: t.ticketNo, title: t.title, photos: cached, activeIdx: 0 });
      return;
    }
    const inline = getInlinePhotos(t.photos);
    if (inline.length > 0) {
      setPhotoCache((prev) => ({ ...prev, [t.id]: inline }));
      setGalleryTicket({ ticketNo: t.ticketNo, title: t.title, photos: inline, activeIdx: 0 });
      return;
    }
    setLoadingTicketId(t.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(t.id)}/photos`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setActionError(data?.message || "Could not load ticket photos.");
        return;
      }
      const loaded = getInlinePhotos(data?.photos);
      if (loaded.length === 0) {
        setActionError("No valid image data found for this ticket.");
        return;
      }
      setPhotoCache((prev) => ({ ...prev, [t.id]: loaded }));
      setGalleryTicket({ ticketNo: t.ticketNo, title: t.title, photos: loaded, activeIdx: 0 });
    } catch {
      setActionError("Network error loading ticket photos.");
    } finally {
      setLoadingTicketId(null);
    }
  };

  const handleStatusChange = async (ticketId: string, nextStatus: MaintenanceTicket["status"]) => {
    setActionError(null);
    try {
      await updateTicketStatus(ticketId, nextStatus);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not update ticket status.");
    }
  };

  const baseFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesCat = categoryFilter === "All" || t.category === categoryFilter;
      const matchesQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.ticketNo.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.subCategory || "").toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.dateLabel.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [tickets, query, categoryFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: baseFiltered.length };
    for (const s of STATUS_TABS) {
      if (s !== "All") {
        map[s] = baseFiltered.filter((t) => t.status === s).length;
      }
    }
    return map;
  }, [baseFiltered]);

  const rows = useMemo(() => {
    if (statusFilter === "All") return baseFiltered;
    return baseFiltered.filter((t) => t.status === statusFilter);
  }, [baseFiltered, statusFilter]);

  if (tabParam === "check") {
    return <PropertyInspectionView initialBookingId={defaultInspectionReceipt} />;
  }

  return (
    <PageShell hideHeader>
      <div className="space-y-4">
        {/* Heading Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-[#5B6474]">
              Facility · Tickets, quotations & approvals
            </div>
            <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>
              Maintenance Requests
            </h1>
          </div>

          <Link
            href={`/inspections/${defaultInspectionReceipt}`}
            style={{ minHeight: "40px" }}
            className="interactive-btn px-4 py-2 rounded-xl bg-white border border-[#EFE4CC] text-[#0B2A5B] text-[13px] font-bold inline-flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-4 h-4 text-[#C9971C]" />
            <span>Property Inspections</span>
          </Link>
        </div>

        {actionError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#C62828] text-[13px] font-semibold flex items-center justify-between gap-2">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-[#C62828] hover:underline text-[12px] font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search + Category + New Request Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[230px]">
            <Search className="w-4 h-4 text-[#5B6474] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by request no, category, location or date"
              style={{ minHeight: "42px" }}
              className="w-full pl-10 pr-4 rounded-xl border border-[#EFE4CC] bg-white text-[13.5px] text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ minHeight: "42px" }}
            aria-label="Filter by category"
            className="rounded-xl border border-[#EFE4CC] bg-white px-3.5 text-[13px] font-semibold text-[#0B2A5B]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <Link
            href="/maintenance/new"
            style={{
              minHeight: "42px",
              background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
              color: "#FFFFFF",
              borderRadius: "10px",
            }}
            className="interactive-btn px-4 py-2 text-[13px] font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold cursor-pointer border transition-all ${
                  active
                    ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                    : "bg-white text-[#14213D] border-[#EFE4CC] hover:border-[#E2B544]"
                }`}
              >
                <span>{s}</span>
                <span
                  className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center ${
                    active ? "bg-[#E2B544] text-[#041535]" : "bg-[#FAF5EB] text-[#0B2A5B]"
                  }`}
                >
                  {counts[s] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3">
          {rows.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-[#EFE4CC] p-4 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-[#0B2A5B] text-[15px]">{t.title}</div>
                  <div className="notranslate text-[12px] text-[#5B6474]">{t.ticketNo}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
              {isAdmin && (
                <div className="text-[12.5px] text-[#5B6474]">
                  {t.category}
                  {t.subCategory ? ` › ${t.subCategory}` : ""} · {t.location}
                </div>
              )}
              {getTicketPhotoCount(t) > 0 && (
                <button
                  type="button"
                  disabled={loadingTicketId === t.id}
                  onClick={() => void openTicketPhotos(t)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF5EB] border border-[#E5D9BF] text-[#0B2A5B] text-[12px] font-bold cursor-pointer hover:bg-[#FEF5DD]/60"
                >
                  {loadingTicketId === t.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-[#C9971C]" />
                  )}
                  <span>
                    View {getTicketPhotoCount(t)} photo{getTicketPhotoCount(t) > 1 ? "s" : ""}
                  </span>
                </button>
              )}
              <div className="flex items-center justify-between pt-1.5 border-t border-[#F1ECE1] text-[12.5px]">
                <span className="notranslate font-bold text-[#0B2A5B]">
                  ₹{t.estimatedCost.toLocaleString("en-IN")}
                </span>
                <StatusBadge status={t.priority} />
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE (matches 4.13) */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #EFE4CC",
            borderRadius: "18px",
          }}
          className="hidden md:block overflow-hidden shadow-2xs"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead>
                <tr className="border-b border-[#F1ECE1] bg-[#FAF7F2]/70 text-[12px] font-semibold text-[#5B6474]">
                  <th className="py-3.5 px-5">Request</th>
                  {isAdmin && <th className="py-3.5 px-3">Category</th>}
                  {isAdmin && <th className="py-3.5 px-3">Location</th>}
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3 text-right">Est. Cost</th>
                  <th className="py-3.5 px-3">Files</th>
                  <th className="py-3.5 px-3">Raised</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE1] text-[13.5px]">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 6} className="py-12 text-center text-[#5B6474]">
                      No maintenance requests match your filter.
                    </td>
                  </tr>
                ) : (
                  rows.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FAF7F2]/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#0B2A5B]">{t.title}</div>
                        <div className="notranslate text-[11.5px] text-[#5B6474]">
                          {t.ticketNo}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-3 text-[#14213D]">
                          {t.category}
                          {t.subCategory ? ` › ${t.subCategory}` : ""}
                        </td>
                      )}
                      {isAdmin && <td className="py-3.5 px-3 text-[#5B6474]">{t.location}</td>}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={t.priority} />
                      </td>
                      <td className="notranslate py-3.5 px-3 text-right font-bold text-[#0B2A5B]">
                        ₹{t.estimatedCost.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 text-[#5B6474]">
                        <div className="space-y-1.5">
                          <div className="text-[12px]">
                            {t.attachmentsLabel ||
                              (t.quotations?.length
                                ? `${t.quotations.length} quotation(s)`
                                : "—")}
                          </div>
                          {getTicketPhotoCount(t) > 0 && (
                            <button
                              type="button"
                              disabled={loadingTicketId === t.id}
                              onClick={() => void openTicketPhotos(t)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF5EB] border border-[#E5D9BF] hover:border-[#0B2A5B] text-[#0B2A5B] text-[11.5px] font-bold cursor-pointer"
                            >
                              {loadingTicketId === t.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5 text-[#C9971C]" />
                              )}
                              <span>
                                View {getTicketPhotoCount(t)} photo
                                {getTicketPhotoCount(t) > 1 ? "s" : ""}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[12.5px] text-[#5B6474]">
                        <div>{t.dateLabel}</div>
                        <div>by {t.raisedBy}</div>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <StatusBadge status={t.status} />
                          {t.status === "Pending" && isAdmin && (
                            <button
                              type="button"
                              onClick={() => void handleStatusChange(t.id, "Approved")}
                              className="text-[11.5px] font-bold text-[#1D4ED8] hover:underline cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {t.status === "Approved" && (
                            <button
                              type="button"
                              onClick={() => void handleStatusChange(t.id, "In Progress")}
                              className="text-[11.5px] font-bold text-[#6D28D9] hover:underline cursor-pointer"
                            >
                              Start
                            </button>
                          )}
                          {t.status === "In Progress" && (
                            <button
                              type="button"
                              onClick={() => void handleStatusChange(t.id, "Completed")}
                              className="text-[11.5px] font-bold text-[#15803D] hover:underline cursor-pointer"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {galleryTicket && galleryTicket.photos[galleryTicket.activeIdx] && (
        <div
          onClick={() => setGalleryTicket(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-[#EFE4CC] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-[#0B2A5B] text-[14px] truncate">
                  {galleryTicket.ticketNo} · {galleryTicket.photos[galleryTicket.activeIdx].name}
                </div>
                <div className="text-[11.5px] text-[#5B6474]">
                  Photo {galleryTicket.activeIdx + 1} of {galleryTicket.photos.length}
                  {galleryTicket.photos[galleryTicket.activeIdx].sizeKb
                    ? ` · ${galleryTicket.photos[galleryTicket.activeIdx].sizeKb} KB (compressed in DB)`
                    : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGalleryTicket(null)}
                className="w-8 h-8 rounded-full bg-[#FAF5EB] text-[#0B2A5B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#0B1220] flex items-center justify-center max-h-[68vh] overflow-auto">
              <img
                src={galleryTicket.photos[galleryTicket.activeIdx].dataUrl}
                alt={galleryTicket.photos[galleryTicket.activeIdx].name}
                className="max-w-full max-h-[68vh] object-contain"
              />
            </div>
            {galleryTicket.photos.length > 1 && (
              <div className="p-3 bg-[#FAF7F2] border-t border-[#EFE4CC] flex items-center gap-2 overflow-x-auto">
                {galleryTicket.photos.map((ph, idx) => (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() =>
                      setGalleryTicket((prev) => (prev ? { ...prev, activeIdx: idx } : null))
                    }
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                      idx === galleryTicket.activeIdx ? "border-[#0B2A5B]" : "border-transparent opacity-75"
                    }`}
                  >
                    <img src={ph.dataUrl} alt={ph.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading maintenance...</div>}>
      <MaintenanceContent />
    </Suspense>
  );
}
