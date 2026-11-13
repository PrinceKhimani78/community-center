"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Plus,
  Wrench,
  X,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import StatusBadge from "@/components/common/StatusBadge";
import {
  HALL_OPTIONS,
  REFERENCE_TODAY_ISO,
  STATUS_VISUALS,
  formatFullWeekdayDate,
  getMultiDayIndex,
  hallsConflict,
  isDateFullyBooked,
  isDateInRange,
} from "@/lib/utils/bookings";

type CalendarView = "day" | "week" | "month";

function toISO(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getWeekDates(anchorISO: string): string[] {
  const anchor = new Date(`${anchorISO}T00:00:00`);
  const dayOfWeek = anchor.getDay();
  const sunday = new Date(anchor);
  sunday.setDate(anchor.getDate() - dayOfWeek);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return toISO(d.getFullYear(), d.getMonth(), d.getDate());
  });
}

export default function CalendarPage() {
  const { bookings, tickets, addMaintenanceTicket } = useDashboard();

  const [view, setView] = useState<CalendarView>("month");
  const [cursorYear, setCursorYear] = useState(2026);
  const [cursorMonth, setCursorMonth] = useState(9); // 0-indexed: 9 = October
  const [selectedDateISO, setSelectedDateISO] = useState(REFERENCE_TODAY_ISO);
  const [hallFilter, setHallFilter] = useState<string>("All");

  // Maintenance block panel state
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockLocation, setBlockLocation] = useState<string>("Ground Floor");
  const [blockDateISO, setBlockDateISO] = useState<string>("2026-10-26");
  const [blockReason, setBlockReason] = useState("");
  const [blockSavedMsg, setBlockSavedMsg] = useState<string | null>(null);

  const monthTitle = useMemo(() => {
    return new Date(cursorYear, cursorMonth, 1).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }, [cursorYear, cursorMonth]);

  const monthGridCells = useMemo(() => {
    const firstWeekday = new Date(cursorYear, cursorMonth, 1).getDay();
    const totalDays = new Date(cursorYear, cursorMonth + 1, 0).getDate();
    const cells: Array<{ day: number; iso: string } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) {
      cells.push({ day, iso: toISO(cursorYear, cursorMonth, day) });
    }
    return cells;
  }, [cursorYear, cursorMonth]);

  const weekDates = useMemo(() => getWeekDates(selectedDateISO), [selectedDateISO]);

  const getEventsForDate = (iso: string) => {
    const dayBookings = bookings.filter((b) => {
      const matchesHall = hallFilter === "All" || hallsConflict(b.hall, hallFilter);
      return matchesHall && isDateInRange(iso, b.dateISO, b.endDateISO);
    });
    const dayBlocks = tickets.filter((t) => {
      if (!t.blockHall || t.blockDateISO !== iso) return false;
      return hallFilter === "All" || hallsConflict(t.location, hallFilter);
    });
    return { dayBookings, dayBlocks };
  };

  const selectedData = getEventsForDate(selectedDateISO);
  const selectedTotalCount = selectedData.dayBookings.length + selectedData.dayBlocks.length;
  const selectedDateBookedOut = isDateFullyBooked(
    selectedDateISO,
    bookings,
    tickets,
    hallFilter
  );

  const blockClashBooking = useMemo(() => {
    return bookings.find(
      (b) =>
        b.status !== "Cancelled" &&
        hallsConflict(b.hall, blockLocation) &&
        isDateInRange(blockDateISO, b.dateISO, b.endDateISO)
    );
  }, [bookings, blockLocation, blockDateISO]);

  const shiftMonth = (delta: number) => {
    const next = new Date(cursorYear, cursorMonth + delta, 1);
    setCursorYear(next.getFullYear());
    setCursorMonth(next.getMonth());
    setSelectedDateISO(toISO(next.getFullYear(), next.getMonth(), 1));
  };

  const jumpToToday = () => {
    setCursorYear(2026);
    setCursorMonth(9);
    setSelectedDateISO(REFERENCE_TODAY_ISO);
  };

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = addMaintenanceTicket({
      title: blockReason.trim() || `Maintenance block — ${blockLocation}`,
      category: "AC / Fans",
      location: blockLocation,
      priority: "Normal",
      estimatedCost: 0,
      blockHall: true,
      blockDateISO,
    });
    setBlockReason("");
    setBlockSavedMsg(`Blocked ${blockLocation} on ${blockDateISO} (${ticket.ticketNo}).`);
    setSelectedDateISO(blockDateISO);
    const d = new Date(`${blockDateISO}T00:00:00`);
    setCursorYear(d.getFullYear());
    setCursorMonth(d.getMonth());
  };

  return (
    <PageShell hideHeader>
      <div className="space-y-4">
        {/* MOBILE HEADER (matches 5.9) */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 style={{ color: "#0B2A5B", fontSize: "22px", fontWeight: 700 }}>Calendar</h1>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="w-8 h-8 rounded-lg bg-white border border-[#EFE4CC] flex items-center justify-center text-[#0B2A5B] cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[14px] font-bold text-[#0B2A5B] min-w-[110px] text-center">
                {monthTitle}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="w-8 h-8 rounded-lg bg-white border border-[#EFE4CC] flex items-center justify-center text-[#0B2A5B] cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#EFE4CC] p-1 grid grid-cols-3 gap-1">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`py-2 rounded-lg text-[12.5px] font-bold capitalize cursor-pointer transition-all ${
                  view === v ? "bg-[#0B2A5B] text-white" : "text-[#14213D]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {["All", ...HALL_OPTIONS].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHallFilter(h)}
                className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap cursor-pointer border ${
                  hallFilter === h
                    ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                    : "bg-white text-[#14213D] border-[#EFE4CC]"
                }`}
              >
                {h === "All"
                  ? "All Halls"
                  : h === "Ground + First Floor"
                  ? "Ground + 1st"
                  : h}
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP HEADER + TOOLBAR (matches 4.7) */}
        <div className="hidden md:block space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-medium text-[#5B6474]">
                Bookings · Halls schedule
              </div>
              <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>Calendar</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Month Navigation */}
              <div className="inline-flex items-center gap-2 bg-white border border-[#EFE4CC] rounded-xl px-2.5 h-[42px]">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="p-1 text-[#0B2A5B] hover:text-[#C9971C] cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[14px] font-bold text-[#0B2A5B] min-w-[120px] text-center">
                  {monthTitle}
                </span>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="p-1 text-[#0B2A5B] hover:text-[#C9971C] cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={jumpToToday}
                style={{ minHeight: "42px" }}
                className="interactive-btn px-4 py-2 rounded-xl bg-white border border-[#EFE4CC] text-[#0B2A5B] text-[13px] font-bold cursor-pointer"
              >
                Today
              </button>

              {/* Day / Week / Month Switcher */}
              <div className="inline-flex items-center bg-white border border-[#EFE4CC] rounded-xl p-1 h-[42px]">
                {(["day", "week", "month"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`px-3.5 h-full rounded-lg text-[13px] font-bold capitalize cursor-pointer transition-all ${
                      view === v ? "bg-[#0B2A5B] text-white" : "text-[#14213D] hover:bg-[#FAF5EB]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Hall Dropdown */}
              <select
                value={hallFilter}
                onChange={(e) => setHallFilter(e.target.value)}
                style={{ minHeight: "42px" }}
                aria-label="Filter calendar by hall"
                className="rounded-xl border border-[#EFE4CC] bg-white px-3.5 text-[13px] font-bold text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
              >
                <option value="All">All Halls</option>
                {HALL_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setBlockDateISO(selectedDateISO);
                  setShowBlockForm((v) => !v);
                  setBlockSavedMsg(null);
                }}
                style={{ minHeight: "42px" }}
                className="interactive-btn px-4 py-2 rounded-xl bg-white border border-[#6D28D9]/45 text-[#6D28D9] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ListChecks className="w-4 h-4" />
                <span>Block for Maintenance</span>
              </button>

              {selectedDateBookedOut ? (
                <button
                  type="button"
                  disabled
                  style={{ minHeight: "42px" }}
                  className="px-4 py-2 rounded-[10px] bg-slate-200 text-slate-500 text-[13px] font-bold inline-flex items-center gap-1.5 cursor-not-allowed"
                  title="All matching halls are booked or blocked on this date"
                >
                  <span>Fully Booked</span>
                </button>
              ) : (
                <Link
                  href={`/bookings/new?date=${selectedDateISO}`}
                  style={{
                    minHeight: "42px",
                    background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                    color: "#FFFFFF",
                    borderRadius: "10px",
                  }}
                  className="interactive-btn px-4 py-2 text-[13px] font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Reserve</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Maintenance Block Drawer / Card */}
        {showBlockForm && (
          <form
            onSubmit={handleSaveBlock}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #DDD6FE",
              borderRadius: "18px",
              padding: "18px 20px",
            }}
            className="space-y-3.5 animate-tab-enter shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#6D28D9]">
                <Wrench className="w-4 h-4" />
                <h2 className="font-bold text-[15.5px]">Block Hall for Maintenance</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockForm(false)}
                className="p-1 text-[#5B6474] hover:text-[#0B2A5B] cursor-pointer"
                aria-label="Close maintenance block form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {blockClashBooking && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12.5px] font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Clash warning: {blockLocation} already has &ldquo;{blockClashBooking.eventTitle}
                  &rdquo; on {blockDateISO}.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[12px] font-semibold text-[#14213D] mb-1">
                  Hall / Venue
                </label>
                <select
                  value={blockLocation}
                  onChange={(e) => setBlockLocation(e.target.value)}
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px] font-semibold text-[#0B2A5B]"
                >
                  {HALL_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
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
                  Reason
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. A.C. servicing, lighting repair"
                  style={{ minHeight: "42px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3 text-[13px]"
                />
              </div>
              <button
                type="submit"
                style={{ minHeight: "42px" }}
                className="interactive-btn px-4 py-2 rounded-xl bg-[#6D28D9] text-white text-[13px] font-bold cursor-pointer"
              >
                Block Date
              </button>
            </div>
          </form>
        )}

        {blockSavedMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[13px] font-semibold flex items-center gap-2 animate-check-pop">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{blockSavedMsg}</span>
          </div>
        )}

        {/* CALENDAR + SELECTED DAY PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* MAIN CALENDAR CARD */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #EFE4CC",
              borderRadius: "18px",
              padding: "16px 18px",
            }}
            className="lg:col-span-8 space-y-4 shadow-2xs"
          >
            {view === "month" && (
              <>
                <div className="grid grid-cols-7 gap-1.5 text-center text-[11.5px] font-bold text-[#5B6474]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* DESKTOP MONTH CELLS (with event chips) */}
                <div className="hidden md:grid grid-cols-7 gap-1.5">
                  {monthGridCells.map((cell, idx) => {
                    if (!cell) {
                      return <div key={`blank-${idx}`} className="h-24 rounded-xl bg-[#FAF7F2]/40" />;
                    }
                    const { dayBookings, dayBlocks } = getEventsForDate(cell.iso);
                    const isSelected = selectedDateISO === cell.iso;
                    const isToday = cell.iso === REFERENCE_TODAY_ISO;
                    const cellBookedOut = isDateFullyBooked(
                      cell.iso,
                      bookings,
                      tickets,
                      hallFilter
                    );

                    const combined = [
                      ...dayBookings.map((b) => {
                        const multi = getMultiDayIndex(cell.iso, b.dateISO, b.endDateISO);
                        const label = multi
                          ? `${b.eventType} · Day ${multi.dayIndex}`
                          : b.eventTitle;
                        return {
                          id: b.id,
                          label,
                          visual: STATUS_VISUALS[b.status],
                        };
                      }),
                      ...dayBlocks.map((t) => ({
                        id: t.id,
                        label: t.title,
                        visual: STATUS_VISUALS.Maintenance,
                      })),
                    ];
                    const visible = combined.slice(0, 2);
                    const extraCount = combined.length - visible.length;

                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        onClick={() => setSelectedDateISO(cell.iso)}
                        style={{
                          border: isSelected
                            ? "2px solid #0B2A5B"
                            : cellBookedOut
                            ? "1px solid #CBD5E1"
                            : isToday
                            ? "1.5px solid #C9971C"
                            : "1px solid #EFE4CC",
                          backgroundColor: cellBookedOut
                            ? "#E2E8F0"
                            : isSelected
                            ? "#EFF6FF"
                            : isToday
                            ? "#FFFDF2"
                            : "#FFFFFF",
                        }}
                        className={`h-24 rounded-xl p-1.5 flex flex-col justify-between text-left transition-all overflow-hidden ${
                          cellBookedOut
                            ? "opacity-80 cursor-not-allowed"
                            : "cursor-pointer hover:border-[#E2B544]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[12px] font-bold ${
                              cellBookedOut
                                ? "text-slate-500 line-through"
                                : isToday
                                ? "text-[#C9971C]"
                                : "text-[#0B2A5B]"
                            }`}
                          >
                            {cell.day}
                            {isToday ? " · Today" : ""}
                          </span>
                          {cellBookedOut && (
                            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-300 text-slate-700">
                              Booked
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 overflow-hidden">
                          {visible.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                backgroundColor: item.visual.chipBg,
                                color: item.visual.chipText,
                              }}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded truncate"
                            >
                              {item.label}
                            </div>
                          ))}
                          {extraCount > 0 && (
                            <div className="text-[10px] font-bold text-[#5B6474] pl-1">
                              +{extraCount} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* MOBILE COMPACT DOT GRID (matches 5.9) */}
                <div className="grid md:hidden grid-cols-7 gap-1.5">
                  {monthGridCells.map((cell, idx) => {
                    if (!cell) {
                      return <div key={`mblank-${idx}`} className="h-12" />;
                    }
                    const { dayBookings, dayBlocks } = getEventsForDate(cell.iso);
                    const isSelected = selectedDateISO === cell.iso;
                    const cellBookedOut = isDateFullyBooked(
                      cell.iso,
                      bookings,
                      tickets,
                      hallFilter
                    );
                    const dots = [
                      ...dayBookings.map((b) => STATUS_VISUALS[b.status].dot),
                      ...dayBlocks.map(() => STATUS_VISUALS.Maintenance.dot),
                    ].slice(0, 3);

                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        onClick={() => setSelectedDateISO(cell.iso)}
                        className={`h-12 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          cellBookedOut
                            ? isSelected
                              ? "bg-slate-600 text-white"
                              : "bg-slate-200 text-slate-400"
                            : isSelected
                            ? "bg-[#0B2A5B] text-white shadow-xs"
                            : dots.length > 0
                            ? "bg-[#FAF5EB] text-[#0B2A5B]"
                            : "text-[#14213D]"
                        }`}
                      >
                        <span className="text-[13px] font-bold leading-none">{cell.day}</span>
                        <div className="flex items-center gap-0.5 h-1.5">
                          {dots.map((color, dIdx) => (
                            <span
                              key={`${cell.iso}-dot-${dIdx}`}
                              style={{ backgroundColor: color }}
                              className="w-1.5 h-1.5 rounded-full"
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {view === "week" && (
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                {weekDates.map((iso) => {
                  const { dayBookings, dayBlocks } = getEventsForDate(iso);
                  const isSelected = iso === selectedDateISO;
                  const dt = new Date(`${iso}T00:00:00`);
                  return (
                    <div
                      key={iso}
                      onClick={() => setSelectedDateISO(iso)}
                      className={`rounded-xl border p-2.5 min-h-[140px] cursor-pointer space-y-2 transition-all ${
                        isSelected
                          ? "border-[#0B2A5B] bg-[#EFF6FF]/60"
                          : "border-[#EFE4CC] bg-[#FAF7F2]/50 hover:border-[#E2B544]"
                      }`}
                    >
                      <div className="flex sm:flex-col items-center sm:items-start justify-between border-b border-[#EFE4CC] pb-1.5">
                        <span className="text-[11px] font-bold text-[#5B6474] uppercase">
                          {dt.toLocaleDateString("en-GB", { weekday: "short" })}
                        </span>
                        <span className="text-[15px] font-extrabold text-[#0B2A5B]">
                          {dt.getDate()}{" "}
                          <span className="text-[11px] font-semibold text-[#5B6474]">
                            {dt.toLocaleDateString("en-GB", { month: "short" })}
                          </span>
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {dayBookings.map((b) => (
                          <Link
                            key={b.id}
                            href={`/bookings/${b.receiptNo}`}
                            style={{
                              backgroundColor: STATUS_VISUALS[b.status].chipBg,
                              color: STATUS_VISUALS[b.status].chipText,
                            }}
                            className="block rounded-lg px-2 py-1 text-[11px] font-semibold truncate"
                          >
                            {b.eventTitle}
                          </Link>
                        ))}
                        {dayBlocks.map((t) => (
                          <div
                            key={t.id}
                            style={{
                              backgroundColor: STATUS_VISUALS.Maintenance.chipBg,
                              color: STATUS_VISUALS.Maintenance.chipText,
                            }}
                            className="rounded-lg px-2 py-1 text-[11px] font-semibold truncate"
                          >
                            {t.title}
                          </div>
                        ))}
                        {dayBookings.length === 0 && dayBlocks.length === 0 && (
                          <div className="text-[11px] text-[#5B6474] italic">Free</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {view === "day" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F1ECE1] pb-2.5">
                  <span className="font-bold text-[#0B2A5B] text-[15px]">
                    Hall Schedule · {formatFullWeekdayDate(selectedDateISO)}
                  </span>
                  <input
                    type="date"
                    value={selectedDateISO}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (!next) return;
                      setSelectedDateISO(next);
                      const d = new Date(`${next}T00:00:00`);
                      setCursorYear(d.getFullYear());
                      setCursorMonth(d.getMonth());
                    }}
                    className="h-9 rounded-lg border border-[#E5D9BF] bg-[#FAF7F2] px-2.5 text-[12.5px] font-semibold text-[#0B2A5B]"
                  />
                </div>

                <div className="space-y-2.5">
                  {HALL_OPTIONS.filter(
                    (h) => hallFilter === "All" || hallsConflict(h, hallFilter)
                  ).map((hallName) => {
                    const hallBookings = selectedData.dayBookings.filter((b) =>
                      hallsConflict(b.hall, hallName)
                    );
                    const hallBlocks = selectedData.dayBlocks.filter((t) =>
                      hallsConflict(t.location, hallName)
                    );

                    return (
                      <div
                        key={hallName}
                        className="rounded-xl border border-[#EFE4CC] bg-[#FAF7F2]/60 p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#0B2A5B] text-[14px]">{hallName}</span>
                          {hallBookings.length === 0 && hallBlocks.length === 0 ? (
                            <Link
                              href={`/bookings/new?date=${selectedDateISO}&hall=${encodeURIComponent(
                                hallName
                              )}`}
                              className="text-[12px] font-bold text-[#15803D] hover:underline"
                            >
                              Available · + Reserve
                            </Link>
                          ) : (
                            <span className="text-[11.5px] font-bold text-[#5B6474]">
                              {hallBookings.length + hallBlocks.length} scheduled
                            </span>
                          )}
                        </div>

                        {hallBookings.map((b) => (
                          <Link
                            key={b.id}
                            href={`/bookings/${b.receiptNo}`}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-[#EFE4CC]"
                          >
                            <div>
                              <div className="font-bold text-[#0B2A5B] text-[13px]">
                                {b.applicantName} · {b.eventTitle}
                              </div>
                              <div className="text-[11.5px] text-[#5B6474]">{b.timing}</div>
                            </div>
                            <StatusBadge status={b.status} />
                          </Link>
                        ))}

                        {hallBlocks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#F3E8FF] border border-[#E9D5FF] text-[#6D28D9] text-[12.5px] font-semibold"
                          >
                            <span>
                              {t.title} ({t.ticketNo})
                            </span>
                            <span>Blocked</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status Color Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 text-[12px] text-[#5B6474] border-t border-[#F1ECE1]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" /> Confirmed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5B700]" /> Pending
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" /> Approved
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C62828]" /> Cancelled
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6D28D9]" /> Maintenance block
              </span>
            </div>
          </div>

          {/* SELECTED DAY SIDE PANEL (matches 4.7 & 5.9) */}
          <aside className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between gap-2 px-1">
              <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                {selectedDateISO === REFERENCE_TODAY_ISO
                  ? `Today · ${formatFullWeekdayDate(selectedDateISO)}`
                  : formatFullWeekdayDate(selectedDateISO)}
              </h2>
              <div className="flex items-center gap-2.5">
                <span className="text-[12px] font-semibold text-[#5B6474]">
                  {selectedTotalCount} {selectedTotalCount === 1 ? "item" : "items"}
                </span>
                {selectedDateBookedOut ? (
                  <span className="md:hidden text-[11.5px] font-bold text-slate-500">
                    Booked
                  </span>
                ) : (
                  <Link
                    href={`/bookings/new?date=${selectedDateISO}`}
                    className="md:hidden text-[12.5px] font-bold text-[#0B2A5B]"
                  >
                    + Reserve
                  </Link>
                )}
              </div>
            </div>

            {selectedTotalCount === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EFE4CC] p-6 text-center space-y-3">
                <p className="text-[13.5px] text-[#5B6474]">
                  All halls are free on this date.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    href={`/bookings/new?date=${selectedDateISO}`}
                    style={{ minHeight: "40px" }}
                    className="interactive-btn inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-bold"
                  >
                    + Reserve This Date
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setBlockDateISO(selectedDateISO);
                      setShowBlockForm(true);
                    }}
                    style={{ minHeight: "40px" }}
                    className="interactive-btn inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-white border border-[#6D28D9]/40 text-[#6D28D9] text-[13px] font-bold cursor-pointer"
                  >
                    Block Maintenance
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedData.dayBookings.map((b) => {
                  const visual = STATUS_VISUALS[b.status];
                  return (
                    <Link
                      key={b.id}
                      href={`/bookings/${b.receiptNo}`}
                      style={{
                        borderTop: `3px solid ${visual.bar}`,
                      }}
                      className="interactive-row block bg-white rounded-2xl border border-[#EFE4CC] p-4 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-[#0B2A5B] text-[14.5px] truncate">
                            {b.applicantName}
                          </div>
                          <div className="text-[12.5px] text-[#5B6474] mt-0.5">
                            {b.eventTitle}
                          </div>
                          <div className="text-[12px] text-[#5B6474] mt-1">
                            {b.timing} · {b.hall}
                          </div>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    </Link>
                  );
                })}

                {selectedData.dayBlocks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      borderTop: `3px solid ${STATUS_VISUALS.Maintenance.bar}`,
                    }}
                    className="bg-white rounded-2xl border border-[#EFE4CC] p-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-[#0B2A5B] text-[14.5px] truncate">
                          {t.title}
                        </div>
                        <div className="text-[12.5px] text-[#5B6474] mt-0.5">
                          Maintenance · {t.ticketNo}
                        </div>
                        <div className="text-[12px] text-[#5B6474] mt-1">
                          All day · {t.location}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-[#6D28D9] text-white shrink-0">
                        Maintenance
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
