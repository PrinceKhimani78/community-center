"use client";

import React from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface TabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}

export default function TabBar<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel = "Section tabs",
}: TabBarProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap items-center gap-2.5 p-1.5 rounded-2xl bg-white/85 border border-[#EFE4CC] shadow-xs backdrop-blur-xs animate-fade-up"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              minHeight: "44px",
              background: isActive
                ? "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)"
                : "transparent",
              color: isActive ? "#FFFFFF" : "#14213D",
              border: isActive
                ? "1.5px solid #E2B544"
                : "1.5px solid transparent",
              boxShadow: isActive
                ? "0 6px 16px -3px rgba(11, 42, 91, 0.28), 0 0 0 1px rgba(226, 181, 68, 0.25)"
                : "none",
            }}
            className={`tab-pill group flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold cursor-pointer select-none ${
              isActive ? "font-bold" : "text-[#5B6474]"
            }`}
          >
            {Icon && (
              <span
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-[#F7E6A9]" : "text-[#0B2A5B]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </span>
            )}
            <span className="whitespace-nowrap">{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                style={{
                  backgroundColor: isActive ? "#E2B544" : "#FAF5EB",
                  color: isActive ? "#041535" : "#0B2A5B",
                  border: isActive ? "none" : "1px solid #EFE4CC",
                }}
                className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center transition-colors"
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

