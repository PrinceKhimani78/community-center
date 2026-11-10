"use client";

import React, { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay?: boolean;
          },
          containerId: string
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
    __gtDomPatched?: boolean;
  }
}

/**
 * Prevents React DOM reconciliation errors (NotFoundError: removeChild / insertBefore)
 * when Google Translate wraps React text nodes inside <font> tags.
 */
function installGoogleTranslateDomGuard() {
  if (typeof window === "undefined" || typeof Node !== "function" || window.__gtDomPatched) {
    return;
  }
  window.__gtDomPatched = true;

  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode === this) {
      return originalRemoveChild.call(this, child) as T;
    }

    let target: Node = child;
    while (
      target.parentNode &&
      target.parentNode !== this &&
      target.parentNode instanceof HTMLElement &&
      target.parentNode.tagName === "FONT"
    ) {
      target = target.parentNode;
    }

    if (target.parentNode === this) {
      return originalRemoveChild.call(this, target) as T;
    }

    return child;
  };

  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (!referenceNode || referenceNode.parentNode === this) {
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    }

    let ref: Node = referenceNode;
    while (
      ref.parentNode &&
      ref.parentNode !== this &&
      ref.parentNode instanceof HTMLElement &&
      ref.parentNode.tagName === "FONT"
    ) {
      ref = ref.parentNode;
    }

    if (ref.parentNode === this) {
      return originalInsertBefore.call(this, newNode, ref) as T;
    }

    return this.appendChild(newNode);
  };
}

export default function GoogleTranslateScript() {
  useEffect(() => {
    installGoogleTranslateDomGuard();

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      const hostEl = document.getElementById("google_translate_element");
      if (!hostEl || hostEl.childElementCount > 0) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,gu",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <>
      <div
        id="google_translate_element"
        aria-hidden="true"
        className="notranslate"
        style={{
          position: "fixed",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          top: "-9999px",
          left: "-9999px",
        }}
      />
      <Script
        id="google-translate-script"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}

