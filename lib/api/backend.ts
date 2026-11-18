import { cookies } from "next/headers";

export interface SessionCookiePayload {
  token?: string;
  userId: string;
  name?: string;
  role: string;
  authenticatedAt?: string;
}

export function getBackendBaseUrl(): string | null {
  const raw = process.env.BACKEND_API_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    return "https://api.hmyvalibhoycc-dhari.com";
  }
  return null;
}

export function isBackendConfigured(): boolean {
  return Boolean(getBackendBaseUrl());
}

export async function getSessionPayload(): Promise<SessionCookiePayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("valibhoy_session")?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionCookiePayload;
    return parsed?.userId ? parsed : null;
  } catch {
    return null;
  }
}

export async function backendFetch<T = Record<string, unknown>>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const rawText = await res.text();
  let data: T;
  let parsedOk = true;
  try {
    data = JSON.parse(rawText) as T;
  } catch {
    parsedOk = false;
    const contentType = res.headers.get("content-type") || "unknown";
    const titleMatch = rawText.match(/<title[^>]*>([^<]{1,120})<\/title>/i);
    const htmlTitle = titleMatch ? titleMatch[1].trim() : "";
    let host = baseUrl;
    try {
      host = new URL(baseUrl).host;
    } catch {
      // keep raw baseUrl
    }
    console.error("[backendFetch] Non-JSON response from backend", {
      host,
      path,
      status: res.status,
      contentType,
      htmlTitle,
      snippet: rawText.slice(0, 240).replace(/\s+/g, " "),
    });
    const detail = htmlTitle
      ? `Backend returned "${htmlTitle}" (HTTP ${res.status}) instead of JSON.`
      : `Backend returned non-JSON (${contentType}, HTTP ${res.status}).`;
    data = {
      success: false,
      message: `${detail} Check cPanel firewall/WebShield or BACKEND_API_URL.`,
    } as T;
  }

  return {
    ok: parsedOk && res.ok,
    status: parsedOk ? res.status : res.ok ? 502 : res.status,
    data,
  };
}

export async function proxyBackendJson(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<Response> {
  const { NextResponse } = await import("next/server");
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!isBackendConfigured() || !session.token) {
    return NextResponse.json({ success: true, backendSynced: false });
  }

  const result = await backendFetch(path, {
    method: options.method || "GET",
    token: session.token,
    body: options.body,
  });
  return NextResponse.json(result.data, { status: result.status });
}


