"use client";

import React, { ReactNode } from "react";
import { AlertCircle, X } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";

interface PageShellProps {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  hideHeader?: boolean;
}

export default function PageShell({
  title,
  subtitle,
  rightSlot,
  children,
  hideHeader = false,
}: PageShellProps) {
  const { writeError, clearWriteError } = useDashboard();
  return (
    <div
      style={{
        backgroundColor: "#FAF5EB",
        backgroundImage: "linear-gradient(180deg, #FAF5EB 0%, #F7F0E3 55%, #FAF5EB 100%)",
        padding: "clamp(20px, 3vw, 34px) clamp(16px, 3.5vw, 40px) 56px",
      }}
      className="relative w-full min-h-[calc(100vh-58px)] overflow-x-hidden"
    >
      {/* Subtle Flowing Golden Waves Backdrop */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover opacity-75"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="shellWaveGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9971C" />
              <stop offset="50%" stopColor="#E2B544" />
              <stop offset="100%" stopColor="#C9971C" />
            </linearGradient>
          </defs>
          <path
            d="M900,0 C1100,85 1290,210 1440,340"
            stroke="url(#shellWaveGold)"
            strokeWidth="2.5"
            strokeOpacity="0.28"
            fill="none"
          />
          <path
            d="M980,0 C1160,95 1330,215 1440,310"
            stroke="#DEC797"
            strokeWidth="1.5"
            strokeOpacity="0.35"
            fill="none"
          />
          <path
            d="M-30,680 C280,620 620,760 1020,690 C1240,650 1370,710 1460,695"
            stroke="url(#shellWaveGold)"
            strokeWidth="2"
            strokeOpacity="0.2"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1160px] mx-auto flex flex-col gap-5">
        {writeError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#C62828] text-[13px] font-semibold flex items-center justify-between gap-3 shadow-xs"
          >
            <span className="inline-flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{writeError}</span>
            </span>
            <button
              type="button"
              onClick={clearWriteError}
              aria-label="Dismiss error"
              className="w-7 h-7 rounded-full hover:bg-red-100 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!hideHeader && title && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
            <div>
              <h1
                style={{
                  color: "#0B2A5B",
                  fontSize: "clamp(20px, 2.5vw, 24px)",
                  fontWeight: 700,
                }}
                className="tracking-tight leading-snug"
              >
                {title}
              </h1>
              {subtitle && (
                <p style={{ color: "#5B6474", fontSize: "13.5px" }} className="mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {rightSlot && <div className="shrink-0">{rightSlot}</div>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

