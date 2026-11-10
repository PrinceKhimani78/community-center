"use client";

import React, { useSyncExternalStore } from "react";
import { Globe } from "lucide-react";
import {
  type AppLanguage,
  LANGUAGE_OPTIONS,
  readGoogTransLanguage,
  writeGoogTransCookie,
} from "@/lib/utils/translate";

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
  compact?: boolean;
}

const LANG_EVENT = "valibhoy-language-change";

function subscribeLanguage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LANG_EVENT, callback);
  return () => window.removeEventListener(LANG_EVENT, callback);
}

export default function LanguageSwitcher({
  variant = "light",
  compact = false,
}: LanguageSwitcherProps) {
  const activeLang = useSyncExternalStore<AppLanguage>(
    subscribeLanguage,
    readGoogTransLanguage,
    () => "en"
  );

  const handleSelectLanguage = (target: AppLanguage) => {
    if (target === activeLang) return;
    writeGoogTransCookie(target);
    window.dispatchEvent(new Event(LANG_EVENT));

    if (target === "en") {
      // Cleanly restore original React DOM when returning to English
      window.location.reload();
      return;
    }

    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      const hasOption = Array.from(combo.options).some((opt) => opt.value === target);
      if (hasOption) {
        combo.value = target;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }
    }

    // Fallback if script hasn't finished initializing
    window.location.reload();
  };

  const isDark = variant === "dark";

  return (
    <div
      translate="no"
      role="group"
      aria-label="Language switcher"
      style={{
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#FFFFFF",
        border: isDark
          ? "1px solid rgba(226, 181, 68, 0.45)"
          : "1px solid rgba(226, 181, 68, 0.38)",
        borderRadius: "10px",
        padding: "2px",
      }}
      className="notranslate inline-flex items-center gap-0.5 shrink-0 shadow-2xs"
    >
      {!compact && (
        <span
          className={`pl-2 pr-1 hidden sm:inline-flex items-center ${
            isDark ? "text-[#F4CF6A]" : "text-[#C9971C]"
          }`}
          aria-hidden="true"
        >
          <Globe className="w-3.5 h-3.5" />
        </span>
      )}

      {LANGUAGE_OPTIONS.map((opt) => {
        const isActive = activeLang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            translate="no"
            onClick={() => handleSelectLanguage(opt.code)}
            title={`Switch to ${opt.label}`}
            aria-pressed={isActive}
            style={{
              minHeight: compact ? "28px" : "30px",
              padding: compact ? "0 7px" : "0 9px",
              borderRadius: "8px",
              backgroundColor: isActive
                ? isDark
                  ? "#E2B544"
                  : "#0B2A5B"
                : "transparent",
              color: isActive
                ? isDark
                  ? "#041535"
                  : "#FFFFFF"
                : isDark
                ? "rgba(255, 255, 255, 0.88)"
                : "#0B2A5B",
              fontSize: compact ? "11px" : "12px",
              fontWeight: isActive ? 700 : 600,
            }}
            className="notranslate cursor-pointer transition-all hover:opacity-95 whitespace-nowrap"
          >
            {compact ? opt.shortLabel : opt.code === "en" ? "EN" : opt.nativeName}
          </button>
        );
      })}
    </div>
  );
}

