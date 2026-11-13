"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { BookingRecord, HallName, MaintenanceTicket } from "@/lib/mock/dashboard";
import { formatShortDate, getHallDateConflict, getTodayISO } from "@/lib/utils/bookings";

interface BookingDatePickerProps {
  value: string;
  onChange: (nextISO: string) => void;
  hall: HallName;
  bookings: BookingRecord[];
  tickets: MaintenanceTicket[];
  excludeBookingId?: string;
  minDateISO?: string;
  rangeStartISO?: string;
  disablePastDates?: boolean;
  ariaLabel?: string;
}

function toISO(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISO(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function BookingDatePicker({
  value,
  onChange,
  hall,
  bookings,
  tickets,
  excludeBookingId,
  minDateISO,
  rangeStartISO,
  disablePastDates = true,
  ariaLabel = "Select date",
}: BookingDatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [cursorYear, setCursorYear] = useState(initialDate.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(initialDate.getMonth());
  const todayISO = getTodayISO();

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const monthTitle = useMemo(() => {
    return new Date(cursorYear, cursorMonth, 1).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }, [cursorYear, cursorMonth]);

  const gridCells = useMemo(() => {
    const firstWeekday = new Date(cursorYear, cursorMonth, 1).getDay();
    const totalDays = new Date(cursorYear, cursorMonth + 1, 0).getDate();
    const cells: Array<{ day: number; iso: string } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) {
      cells.push({ day, iso: toISO(cursorYear, cursorMonth, day) });
    }
    return cells;
  }, [cursorYear, cursorMonth]);

  const checkDateDisabled = (
    iso: string
  ): { disabled: boolean; title?: string; isBooked: boolean; isPast: boolean } => {
    const effectiveMin = minDateISO || (disablePastDates ? todayISO : undefined);
    if (effectiveMin && iso < effectiveMin) {
      const isPast = iso < todayISO;
      return {
        disabled: true,
        title: isPast ? "Past dates cannot be booked" : `Before ${formatShortDate(effectiveMin)}`,
        isBooked: false,
        isPast,
      };
    }
    if (rangeStartISO && iso >= rangeStartISO) {
      let cur = rangeStartISO;
      while (cur <= iso) {
        const res = getHallDateConflict(cur, hall, bookings, tickets, excludeBookingId);
        if (!res.available) {
          return { disabled: true, title: res.reason, isBooked: true, isPast: false };
        }
        cur = addDays(cur, 1);
      }
      return { disabled: false, isBooked: false, isPast: false };
    }
    const status = getHallDateConflict(iso, hall, bookings, tickets, excludeBookingId);
    if (!status.available) {
      return { disabled: true, title: status.reason, isBooked: true, isPast: false };
    }
    return { disabled: false, isBooked: false, isPast: false };
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(cursorYear, cursorMonth + delta, 1);
    setCursorYear(next.getFullYear());
    setCursorMonth(next.getMonth());
  };

  const handleToggleOpen = () => {
    if (!isOpen && value) {
      const d = new Date(`${value}T00:00:00`);
      setCursorYear(d.getFullYear());
      setCursorMonth(d.getMonth());
    } else if (!isOpen) {
      const d = new Date();
      setCursorYear(d.getFullYear());
      setCursorMonth(d.getMonth());
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={handleToggleOpen}
        style={{ minHeight: "44px" }}
        className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[13.5px] font-semibold text-[#0B2A5B] flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[#E2B544] cursor-pointer"
      >
        <span>{value ? formatShortDate(value) : "Choose date"}</span>
        <CalendarIcon className="w-4 h-4 text-[#C9971C] shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[300px] sm:w-[320px] rounded-2xl bg-white border border-[#E5D9BF] shadow-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="w-8 h-8 rounded-lg border border-[#EFE4CC] flex items-center justify-center text-[#0B2A5B] hover:bg-[#FAF5EB] cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13.5px] font-bold text-[#0B2A5B]">{monthTitle}</span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="w-8 h-8 rounded-lg border border-[#EFE4CC] flex items-center justify-center text-[#0B2A5B] hover:bg-[#FAF5EB] cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#5B6474]">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {gridCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-9" />;
              }
              const { disabled, title, isBooked, isPast } = checkDateDisabled(cell.iso);
              const isSelected = value === cell.iso;
              const isToday = cell.iso === todayISO;

              return (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={disabled}
                  title={title}
                  onClick={() => {
                    onChange(cell.iso);
                    setIsOpen(false);
                  }}
                  className={`h-9 rounded-lg text-[12.5px] font-bold transition-all flex flex-col items-center justify-center ${
                    disabled
                      ? isBooked
                        ? "bg-slate-200/80 text-slate-400 line-through cursor-not-allowed"
                        : isPast
                        ? "bg-slate-100 text-slate-300 line-through cursor-not-allowed"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-[#0B2A5B] text-white shadow-xs cursor-pointer"
                      : isToday
                      ? "bg-[#FFFDF2] text-[#C9971C] border border-[#E2B544] hover:bg-[#FAF5EB] cursor-pointer"
                      : "bg-white text-[#0B2A5B] border border-[#EFE4CC] hover:border-[#E2B544] hover:bg-[#FAF5EB] cursor-pointer"
                  }`}
                >
                  <span>{cell.day}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#F1ECE1] text-[11px] text-[#5B6474]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
              Greyed = Booked / Past
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#0B2A5B] inline-block" />
              Selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
