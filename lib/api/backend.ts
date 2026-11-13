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

  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = { success: false, message: "Invalid JSON response from backend" } as T;
  }

  return { ok: res.ok, status: res.status, data };
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


