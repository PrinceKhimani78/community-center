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
        border: "1.5px solid rgba(226, 181, 68, 0.32)",
        borderRadius: "18px",
        boxShadow: "0 10px 28px -4px rgba(11, 42, 91, 0.05), 0 3px 10px rgba(226, 181, 68, 0.07)",
        padding: "24px",
      }}
      className="flex flex-col justify-between"
    >
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #F1ECE1", paddingBottom: "16px" }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <h2
            style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }}
            className="tracking-tight"
          >
            Needs your action
          </h2>
          <span
            style={{
              backgroundColor: "#FFF1F2",
              color: "#E11D48",
              border: "1px solid #FFE4E6",
              fontSize: "11.5px",
              fontWeight: 700,
              padding: "1.5px 8px",
              borderRadius: "9999px",
            }}
          >
            {actionItems.length}
          </span>
        </div>
        <Link
          href="/notifications"
          style={{ color: "#C9971C", fontSize: "13px", fontWeight: 600 }}
          className="hover:underline flex items-center gap-1 transition-colors group"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Undo Notification Bar */}
      {lastCompleted && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: "14px",
            padding: "10px 14px",
            borderRadius: "10px",
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
      <div className="mt-4 space-y-3">
        {displayedItems.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p style={{ color: "#78716C", fontSize: "13.5px" }} className="font-medium">
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
                  backgroundColor: "#FAF7F2",
                  border: "1px solid rgba(226, 181, 68, 0.22)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  boxShadow: "0 1px 3px rgba(11, 42, 91, 0.02)",
                }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[#FFFDF9] hover:border-[#E2B544] hover:shadow-md transition-all duration-150"
              >
                {/* Left: Tag + Title + Detail */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Color-coded Tag badge */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      backgroundColor: tagCfg.bg,
                      color: tagCfg.text,
                      border: `1px solid ${tagCfg.border}`,
                      fontWeight: 800,
                      fontSize: "11px",
                      letterSpacing: "0.06em",
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
                      style={{ color: "#0B2A5B", fontSize: "14.5px", fontWeight: 700 }}
                      className="truncate leading-snug group-hover:text-blue-900 transition-colors"
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{ color: "#78716C", fontSize: "12.5px" }}
                      className="truncate mt-0.5 leading-normal"
                    >
                      {item.detail}
                    </p>
                  </div>
                </div>

                {/* Right: Action button with sleek navy & gold styling */}
                <button
                  type="button"
                  onClick={() => completeAction(item.id)}
                  style={{
                    backgroundColor: "#0B2A5B",
                    border: "1px solid rgba(226, 181, 68, 0.45)",
                    color: "#FFFFFF",
                    height: "36px",
                    padding: "0 16px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(11, 42, 91, 0.18)",
                    transition: "all 0.15s ease",
                  }}
                  className="hover:bg-[#072254] hover:border-[#E2B544] hover:shadow-[0_4px_12px_rgba(226,181,68,0.3)] active:scale-[0.98] shrink-0 whitespace-nowrap w-full sm:w-auto flex items-center justify-center cursor-pointer"
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

