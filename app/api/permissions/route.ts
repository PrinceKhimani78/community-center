import { NextResponse } from "next/server";
import { backendFetch, getSessionPayload, isBackendConfigured } from "@/lib/api/backend";

export async function GET() {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!isBackendConfigured() || !session.token) {
    return NextResponse.json({ success: true, backendSynced: false });
  }

  const result = await backendFetch("/api/permissions", { token: session.token });
  return NextResponse.json(result.data, { status: result.status });
}

export async function PUT(request: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!isBackendConfigured() || !session.token) {
    return NextResponse.json({ success: true, backendSynced: false });
  }

  const body = await request.json();
  const result = await backendFetch("/api/permissions", {
    method: "PUT",
    token: session.token,
    body,
  });
  return NextResponse.json(result.data, { status: result.status });
}

