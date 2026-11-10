export type AppLanguage = "en" | "hi" | "gu";

export const LANGUAGE_OPTIONS: Array<{
  code: AppLanguage;
  label: string;
  shortLabel: string;
  nativeName: string;
}> = [
  { code: "en", label: "English", shortLabel: "EN", nativeName: "English" },
  { code: "hi", label: "Hindi", shortLabel: "हिन्दी", nativeName: "हिन्दी" },
  { code: "gu", label: "Gujarati", shortLabel: "ગુજરાતી", nativeName: "ગુજરાતી" },
];

export const LANGUAGE_STORAGE_KEY = "valibhoy_lang";

export function readGoogTransLanguage(): AppLanguage {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && match[1]) {
    const decoded = decodeURIComponent(match[1]);
    const parts = decoded.split("/");
    const target = parts[parts.length - 1];
    if (target === "hi" || target === "gu" || target === "en") {
      return target;
    }
  }
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "hi" || saved === "gu" || saved === "en") {
      return saved;
    }
  } catch {
    // Ignore storage access failures
  }
  return "en";
}

export function writeGoogTransCookie(lang: AppLanguage): void {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const domainParts = host.split(".");
  const candidateDomains = ["", host];
  if (domainParts.length >= 2) {
    candidateDomains.push(`.${domainParts.slice(-2).join(".")}`);
  }

  // Clear stale cookie variants first
  for (const domain of candidateDomains) {
    const domainAttr = domain ? `; domain=${domain}` : "";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}`;
  }

  if (lang !== "en") {
    const value = `/en/${lang}`;
    document.cookie = `googtrans=${value}; path=/; SameSite=Lax`;
    if (host && host !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      document.cookie = `googtrans=${value}; path=/; domain=.${host}; SameSite=Lax`;
    }
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Ignore storage access failures
  }
}

