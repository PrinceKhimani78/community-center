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
    <div className="bg-white rounded-[18px] border border-[#EFE4CC] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#F1EADB]">
        <h3 className="text-[18px] font-bold text-navy tracking-tight">Needs your action</h3>
        <Link
          href="/notifications"
          className="text-[13px] font-semibold text-navy hover:text-navy/80 hover:underline"
        >
          See all
        </Link>
      </div>

      {/* Undo Notification Bar */}
      {lastCompleted && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3.5 p-3 rounded-[12px] bg-[#E8F5EC] border border-[#A7E3B6] flex items-center justify-between gap-2 text-[13px] text-[#14532D] animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span className="font-medium truncate">{lastCompleted.message}</span>
          </div>
          <button
            type="button"
            onClick={undoAction}
            className="flex items-center gap-1 font-bold text-[#14532D] hover:underline shrink-0 text-[12px] px-2 py-1 rounded hover:bg-[#d5eedc] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Action Items List */}
      <div className="mt-4 space-y-3">
        {displayedItems.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p className="text-[14px] text-muted font-medium">
              All caught up. Nothing is waiting for you.
            </p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const tagStyle = TAG_STYLES[item.tag] || TAG_STYLES.PAY;

            return (
              <div
                key={item.id}
                className="bg-[#FBF6EC] border border-[#EFE4CC]/60 rounded-[14px] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 hover:border-light-gold/80"
              >
                {/* Left: Tag + Title + Detail */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* 44px square type tag */}
                  <div
                    className={`w-[44px] h-[44px] rounded-[10px] ${tagStyle.bg} ${tagStyle.text} font-bold text-[13px] flex items-center justify-center shrink-0 tracking-wider shadow-2xs`}
                  >
                    {item.tag}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-bold text-navy truncate leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[13px] text-muted truncate mt-0.5 leading-normal">
                      {item.detail}
                    </p>
                  </div>
                </div>

                {/* Right: One navy button, 44px tall */}
                <button
                  type="button"
                  onClick={() => completeAction(item.id)}
                  className="h-[44px] px-4.5 rounded-[12px] bg-navy text-white text-[13.5px] font-semibold hover:bg-navy/90 transition-all flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-light-gold w-full sm:w-auto shadow-xs active:scale-[0.98]"
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
