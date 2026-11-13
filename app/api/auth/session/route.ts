import { NextResponse } from "next/server";
import { getSessionPayload, isBackendConfigured } from "@/lib/api/backend";

export async function GET() {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      backendEnabled: isBackendConfigured(),
    });
  }

  return NextResponse.json({
    authenticated: true,
    userId: session.userId,
    name: session.name || session.userId,
    role: session.role,
    backendEnabled: isBackendConfigured() && Boolean(session.token),
  });
}

