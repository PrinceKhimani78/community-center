"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { ActionTag } from "@/lib/mock/dashboard";

const TAG_CONFIG: Record<ActionTag, { bg: string; text: string; label: string }> = {
  PAY: { bg: "#FFF1F2", text: "#C62828", label: "Money" },
  INS: { bg: "#F5F3FF", text: "#6D28D9", label: "Check" },
  REF: { bg: "#EFF6FF", text: "#1D4ED8", label: "Refund" },
  BK: { bg: "#F0FDF4", text: "#15803D", label: "Booking" },
  FIX: { bg: "#FEF3C7", text: "#92400E", label: "Repair" },
};

export default function ActionList() {
  const { actionItems, completeAction, lastCompleted, undoAction } = useDashboard();

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1.5px solid rgba(226, 181, 68, 0.35)",
        borderRadius: "20px",
        boxShadow: "0 12px 28px -6px rgba(11, 42, 91, 0.06)",
        padding: "clamp(18px, 3vw, 26px)",
      }}
      className="flex flex-col"
    >
      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #F1ECE1", paddingBottom: "14px" }}
        className="flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2.5">
          <h2 style={{ color: "#0B2A5B", fontSize: "18px", fontWeight: 700 }}>
            Pending To-Do List
          </h2>
          <span
            style={{
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              fontSize: "12px",
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: "9999px",
            }}
          >
            {actionItems.length} left
          </span>
        </div>
        <Link
          href="/notifications"
          style={{ color: "#C9971C", fontSize: "13px", fontWeight: 600 }}
          className="hover:underline flex items-center gap-1 group"
        >
          <span>All alerts</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Undo Banner */}
      {lastCompleted && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: "14px",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#15803D",
            fontSize: "13px",
          }}
          className="flex items-center justify-between gap-3 animate-check-pop"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold truncate">{lastCompleted.message}</span>
          </div>
          <button
            type="button"
            onClick={undoAction}
            className="flex items-center gap-1 font-bold hover:underline shrink-0 text-[12.5px] px-2.5 py-1 rounded-lg bg-emerald-100/80 hover:bg-emerald-200/70 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* List */}
      <div className="mt-4 space-y-3">
        {actionItems.length === 0 ? (
          <div className="py-12 px-4 text-center animate-fade-up">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2.5" />
            <p style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
              Everything is done!
            </p>
            <p style={{ color: "#5B6474", fontSize: "13.5px" }} className="mt-1">
              No pending tasks left right now.
            </p>
          </div>
        ) : (
          actionItems.map((item, idx) => {
            const tagCfg = TAG_CONFIG[item.tag] || TAG_CONFIG.PAY;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#FAF7F2",
                  border: "1px solid rgba(226, 181, 68, 0.25)",
                  borderRadius: "14px",
                  padding: "16px",
                  animationDelay: `${idx * 45}ms`,
                }}
                className="interactive-row animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <span
                    style={{
                      backgroundColor: tagCfg.bg,
                      color: tagCfg.text,
                      fontSize: "11.5px",
                      fontWeight: 700,
                      padding: "6px 10px",
                      borderRadius: "10px",
                    }}
                    className="shrink-0"
                  >
                    {tagCfg.label}
                  </span>

                  <div className="min-w-0">
                    <h3 style={{ color: "#0B2A5B", fontSize: "14.5px", fontWeight: 700 }}>
                      {item.title}
                    </h3>
                    <p style={{ color: "#5B6474", fontSize: "13px" }} className="mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {item.linkUrl && (
                    <Link
                      href={item.linkUrl}
                      style={{
                        minHeight: "42px",
                        borderRadius: "10px",
                        border: "1px solid #EFE4CC",
                        backgroundColor: "#FFFFFF",
                        color: "#0B2A5B",
                      }}
                      className="interactive-btn px-3.5 py-2 text-[13px] font-semibold inline-flex items-center justify-center hover:border-[#E2B544]"
                    >
                      Open
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => completeAction(item.id)}
                    style={{
                      minHeight: "42px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                      color: "#FFFFFF",
                    }}
                    className="interactive-btn px-4 py-2 text-[13px] font-semibold cursor-pointer inline-flex items-center justify-center"
                  >
                    {item.buttonLabel}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
