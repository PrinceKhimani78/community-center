import type { BookingRecord, BookingStatus, HallName } from "@/lib/mock/dashboard";

export const HALL_OPTIONS: HallName[] = [
  "Ground Floor",
  "Ground + First Floor",
  "Garden Lawn",
];

export const EVENT_TYPES = [
  "Wedding",
  "Walima",
  "Nikah",
  "Engagement",
  "Birthday",
  "Community Meeting",
  "Others",
] as const;

export const TIMING_PRESETS = [
  "10:00 AM – 10:00 PM",
  "9:00 AM – 4:00 PM",
  "5:00 PM – 11:00 PM",
  "4:00 PM – 8:00 PM",
] as const;

export const REFERENCE_TODAY_ISO = "2026-10-20";

/**
 * Checks whether two venue selections physically overlap.
 * "Ground + First Floor" occupies Ground Floor as well.
 */
export function hallsConflict(hallA: string, hallB: string): boolean {
  const a = hallA.toLowerCase();
  const b = hallB.toLowerCase();
  if (a === b) return true;
  if (
    (a.includes("ground") && b.includes("ground")) ||
    (a.includes("first floor") && b.includes("first floor"))
  ) {
    return true;
  }
  return false;
}

/** Checks whether dateISO falls inclusively within [startISO, endISO || startISO]. */
export function isDateInRange(
  dateISO: string,
  startISO: string,
  endISO?: string
): boolean {
  const effectiveEnd = endISO && endISO >= startISO ? endISO : startISO;
  return dateISO >= startISO && dateISO <= effectiveEnd;
}

/** Checks whether two date ranges [startA, endA] and [startB, endB] overlap. */
export function dateRangesOverlap(
  startA: string,
  endA: string | undefined,
  startB: string,
  endB?: string
): boolean {
  const finalEndA = endA && endA >= startA ? endA : startA;
  const finalEndB = endB && endB >= startB ? endB : startB;
  return startA <= finalEndB && finalEndA >= startB;
}

/** Returns inclusive day count between startISO and endISO (minimum 1). */
export function countBookingDays(startISO: string, endISO?: string): number {
  if (!startISO) return 1;
  if (!endISO || endISO <= startISO) return 1;
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/** Returns 1-based day index if dateISO is inside a multi-day booking, else null. */
export function getMultiDayIndex(
  dateISO: string,
  startISO: string,
  endISO?: string
): { dayIndex: number; totalDays: number } | null {
  const totalDays = countBookingDays(startISO, endISO);
  if (totalDays <= 1 || !isDateInRange(dateISO, startISO, endISO)) return null;
  const start = new Date(`${startISO}T00:00:00`);
  const cur = new Date(`${dateISO}T00:00:00`);
  const dayIndex = Math.round((cur.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return { dayIndex, totalDays };
}

export function formatShortDate(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatWeekdayDate(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function formatFullWeekdayDate(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function getDayMonthParts(iso: string): { day: string; month: string } {
  if (!iso) return { day: "--", month: "---" };
  const date = new Date(`${iso}T00:00:00`);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

export function getBookingBalance(booking: BookingRecord): number {
  if (booking.isFreeUse || booking.status === "Cancelled") return 0;
  return Math.max(0, booking.rent + booking.deposit - booking.paid);
}

export function formatBookingCode(receiptNo: string): string {
  return `BK-2026-${receiptNo.padStart(4, "0")}`;
}

export const STATUS_VISUALS: Record<
  BookingStatus | "Maintenance",
  { dot: string; chipBg: string; chipText: string; bar: string }
> = {
  Confirmed: {
    dot: "#15803D",
    chipBg: "#DCFCE7",
    chipText: "#15803D",
    bar: "#15803D",
  },
  Pending: {
    dot: "#F5B700",
    chipBg: "#FEF3C7",
    chipText: "#92400E",
    bar: "#F5B700",
  },
  "Awaiting approval": {
    dot: "#1D4ED8",
    chipBg: "#DBEAFE",
    chipText: "#1D4ED8",
    bar: "#1D4ED8",
  },
  Completed: {
    dot: "#4B5563",
    chipBg: "#F1F5F9",
    chipText: "#4B5563",
    bar: "#4B5563",
  },
  Cancelled: {
    dot: "#C62828",
    chipBg: "#FEE2E2",
    chipText: "#C62828",
    bar: "#C62828",
  },
  Maintenance: {
    dot: "#6D28D9",
    chipBg: "#F3E8FF",
    chipText: "#6D28D9",
    bar: "#6D28D9",
  },
};

export function exportBookingsCsv(bookings: BookingRecord[]): void {
  const rows = [
    [
      "Booking ID",
      "Event",
      "Applicant",
      "Phone",
      "Hall",
      "Date",
      "Timing",
      "Guests",
      "Rent",
      "Deposit",
      "Paid",
      "Balance",
      "Status",
    ],
    ...bookings.map((b) => [
      formatBookingCode(b.receiptNo),
      b.eventTitle,
      b.applicantName,
      b.phone,
      b.hall,
      b.dateLabel,
      b.timing,
      String(b.guests),
      String(b.rent),
      String(b.deposit),
      String(b.paid),
      String(getBookingBalance(b)),
      b.status,
    ]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bookings-export.csv";
  link.click();
  URL.revokeObjectURL(url);
}

