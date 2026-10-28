"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { ActionTag } from "@/lib/mock/dashboard";

const TAG_STYLES: Record<ActionTag, { bg: string; text: string }> = {
  PAY: { bg: "bg-[#FDECEC]", text: "text-[#7F1D1D]" },
  INS: { bg: "bg-[#FDEEE3]", text: "text-[#9A3412]" },
  REF: { bg: "bg-[#E8EFFC]", text: "text-[#1E3A8A]" },
  BK: { bg: "bg-[#E8F5EC]", text: "text-[#14532D]" },
  FIX: { bg: "bg-[#F0EAFB]", text: "text-[#4C1D95]" },
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

  // Show top 3 on phones, top 4 on tablet/desktop
  const maxDisplay = isMobile ? 3 : 4;
  const displayedItems = actionItems.slice(0, maxDisplay);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: "1px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
      className="p-3.5 sm:p-4 flex flex-col justify-between"
    >
      {/* Header */}
      <div style={{ borderBottom: "1px solid #F1F5F9" }} className="flex items-center justify-between pb-2.5">
        <h3 style={{ color: "#0B2A5B" }} className="text-[15.5px] font-bold tracking-tight">Needs your action</h3>
        <Link
          href="/notifications"
          style={{ color: "#0B2A5B" }}
          className="text-[12px] font-semibold hover:text-[#C9971C] hover:underline"
        >
          See all
        </Link>
      </div>

      {/* Undo Notification Bar */}
      {lastCompleted && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 p-2.5 rounded-[10px] bg-[#E8F5EC] border border-[#A7E3B6] flex items-center justify-between gap-2 text-[12px] text-[#14532D] animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span className="font-medium truncate">{lastCompleted.message}</span>
          </div>
          <button
            type="button"
            onClick={undoAction}
            className="flex items-center gap-1 font-bold text-[#14532D] hover:underline shrink-0 text-[11.5px] px-2 py-0.5 rounded hover:bg-[#d5eedc] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Action Items List */}
      <div className="mt-3 space-y-2.5">
        {displayedItems.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p style={{ color: "#64748B" }} className="text-[13px] font-medium">
              All caught up. Nothing is waiting for you.
            </p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const tagStyle = TAG_STYLES[item.tag] || TAG_STYLES.PAY;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderColor: "#E2E8F0",
                  borderWidth: "1px",
                  borderRadius: "10px",
                }}
                className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all duration-150 hover:border-[#E2B544]/70"
              >
                {/* Left: Tag + Title + Detail */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* 36px square type tag */}
                  <div
                    className={`w-[36px] h-[36px] rounded-[8px] ${tagStyle.bg} ${tagStyle.text} font-bold text-[11px] flex items-center justify-center shrink-0 tracking-wider shadow-2xs`}
                  >
                    {item.tag}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 flex-1">
                    <h4 style={{ color: "#0B2A5B" }} className="text-[13.5px] font-bold truncate leading-snug">
                      {item.title}
                    </h4>
                    <p style={{ color: "#64748B" }} className="text-[12px] truncate mt-0.5 leading-normal">
                      {item.detail}
                    </p>
                  </div>
                </div>

                {/* Right: One navy button, 34px tall */}
                <button
                  type="button"
                  onClick={() => completeAction(item.id)}
                  style={{
                    backgroundColor: "#0B2A5B",
                    color: "#FFFFFF",
                    height: "34px",
                    borderRadius: "8px",
                  }}
                  className="px-3.5 text-[12px] font-semibold hover:bg-[#123B7C] transition-all flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E2B544] w-full sm:w-auto shadow-2xs active:scale-[0.98]"
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
