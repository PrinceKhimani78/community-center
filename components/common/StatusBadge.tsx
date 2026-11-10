"use client";

import React from "react";

const STATUS_STYLE_MAP: Record<
  string,
  { bg: string; color: string; border: string; pulseDot?: string }
> = {
  Confirmed: {
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#BBF7D0",
    pulseDot: "#16A34A",
  },
  Paid: {
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#BBF7D0",
  },
  Partial: {
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#FDE68A",
  },
  Held: {
    bg: "#DBEAFE",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  Approved: {
    bg: "#DBEAFE",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  "Awaiting approval": {
    bg: "#EFF6FF",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  Pending: {
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#FDE68A",
  },
  "Ready to Refund": {
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#FDE68A",
  },
  "Sent for Approval": {
    bg: "#EFF6FF",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  Refunded: {
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#BBF7D0",
  },
  "In Progress": {
    bg: "#F3E8FF",
    color: "#6D28D9",
    border: "#E9D5FF",
  },
  Completed: {
    bg: "#F1F5F9",
    color: "#4B5563",
    border: "#E2E8F0",
  },
  Cancelled: {
    bg: "#FEE2E2",
    color: "#C62828",
    border: "#FECACA",
  },
  Rejected: {
    bg: "#FEE2E2",
    color: "#C62828",
    border: "#FECACA",
  },
  Overdue: {
    bg: "#FEE2E2",
    color: "#C62828",
    border: "#FECACA",
  },
  Urgent: {
    bg: "#FEE2E2",
    color: "#C62828",
    border: "#FECACA",
  },
  High: {
    bg: "#FEE2E2",
    color: "#C62828",
    border: "#FECACA",
  },
  Medium: {
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#FDE68A",
  },
  Low: {
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#BBF7D0",
  },
  Draft: {
    bg: "#F1F5F9",
    color: "#4B5563",
    border: "#E2E8F0",
  },
  Normal: {
    bg: "#FAF5EB",
    color: "#0B2A5B",
    border: "#EFE4CC",
  },
  Present: {
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#BBF7D0",
  },
  Late: {
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#FDE68A",
  },
  Absent: {
    bg: "#FEE2E2",
    color: "#C62828",
    border: "#FECACA",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_STYLE_MAP[status] || {
    bg: "#FAF5EB",
    color: "#0B2A5B",
    border: "#EFE4CC",
  };

  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap shrink-0"
    >
      {cfg.pulseDot && (
        <span
          style={{ backgroundColor: cfg.pulseDot }}
          className="w-1.5 h-1.5 rounded-full animate-pulse"
        />
      )}
      <span>{status}</span>
    </span>
  );
}

