"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { ActionTag } from "@/lib/mock/dashboard";

const TAG_CONFIG: Record<ActionTag, { bg: string; text: string; border: string }> = {
  PAY: { bg: "#FFF1F2", text: "#E11D48", border: "#FFE4E6" },
  INS: { bg: "#F5F3FF", text: "#7C3AED", border: "#EDE9FE" },
  REF: { bg: "#EFF6FF", text: "#0284C7", border: "#DBEAFE" },
  BK: { bg: "#F0FDF4", text: "#16A34A", border: "#DCFCE7" },
  FIX: { bg: "#FAF5FF", text: "#9333EA", border: "#F3E8FF" },
};

export default function ActionList() {
  const { actionItems, completeAction, lastCompleted, undoAction } = useDashboard();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const maxDisplay = isMobile ? 3 : 4;
  const displayedItems = actionItems.slice(0, maxDisplay);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
      className="p-4 sm:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <h2
            style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}
            className="tracking-tight"
          >
            Needs your action
          </h2>
          <span
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              border: "1px solid #FECACA",
              fontSize: "11px",
              fontWeight: 700,
              padding: "1px 7px",
              borderRadius: "9999px",
            }}
          >
            {actionItems.length}
          </span>
        </div>
        <Link
          href="/notifications"
          style={{ color: "#0B2A5B", fontSize: "12.5px", fontWeight: 600 }}
          className="hover:underline flex items-center gap-1 transition-colors"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Undo Notification Bar */}
      {lastCompleted && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            borderRadius: "8px",
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#166534",
            fontSize: "12.5px",
          }}
          className="flex items-center justify-between gap-2 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium truncate">{lastCompleted.message}</span>
          </div>
          <button
            type="button"
            onClick={undoAction}
            style={{ color: "#166534" }}
            className="flex items-center gap-1 font-bold hover:underline shrink-0 text-[11.5px] px-2 py-0.5 rounded hover:bg-emerald-100 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Action Items List */}
      <div className="mt-3.5 space-y-2.5">
        {displayedItems.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <p style={{ color: "#64748B", fontSize: "13px" }} className="font-medium">
              All caught up! No actions currently pending.
            </p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const tagCfg = TAG_CONFIG[item.tag] || TAG_CONFIG.PAY;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
                }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 action-card-item group cursor-pointer"
              >
                {/* Left: Tag + Title + Detail */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Color-coded Tag badge */}
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "8px",
                      backgroundColor: tagCfg.bg,
                      color: tagCfg.text,
                      border: `1px solid ${tagCfg.border}`,
                      fontWeight: 800,
                      fontSize: "11px",
                      letterSpacing: "0.05em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    className="group-hover:scale-105 transition-transform"
                  >
                    {item.tag}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 flex-1">
                    <h3
                      style={{ color: "#0B2A5B", fontSize: "14px", fontWeight: 700 }}
                      className="truncate leading-snug"
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{ color: "#64748B", fontSize: "12px" }}
                      className="truncate mt-0.5 leading-normal"
                    >
                      {item.detail}
                    </p>
                  </div>
                </div>

                {/* Right: Action button */}
                <button
                  type="button"
                  onClick={() => completeAction(item.id)}
                  style={{
                    backgroundColor: "#0B2A5B",
                    color: "#FFFFFF",
                    height: "34px",
                    padding: "0 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(11, 42, 91, 0.15)",
                    transition: "all 0.15s ease",
                  }}
                  className="hover:opacity-90 active:scale-[0.98] shrink-0 whitespace-nowrap w-full sm:w-auto flex items-center justify-center cursor-pointer"
                >
                  {item.buttonLabel}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
