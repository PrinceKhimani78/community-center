import { NextResponse } from "next/server";
import { backendFetch, getSessionPayload, isBackendConfigured } from "@/lib/api/backend";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!isBackendConfigured() || !session.token) {
    return NextResponse.json({ success: true, backendSynced: false });
  }

  const { id } = await context.params;
  const body = await request.json();
  const result = await backendFetch(`/api/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token: session.token,
    body,
  });
  return NextResponse.json(result.data, { status: result.status });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!isBackendConfigured() || !session.token) {
    return NextResponse.json({ success: true, backendSynced: false });
  }

  const { id } = await context.params;
  const result = await backendFetch(`/api/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token: session.token,
  });
  return NextResponse.json(result.data, { status: result.status });
}

