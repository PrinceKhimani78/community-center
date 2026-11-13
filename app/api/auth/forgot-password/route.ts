import { NextResponse } from "next/server";
import { backendFetch, isBackendConfigured } from "@/lib/api/backend";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isBackendConfigured()) {
      return NextResponse.json({
        success: true,
        offlineDemo: true,
        message: "Admin has been notified to review and reset your password.",
      });
    }

    const result = await backendFetch<{ success?: boolean; message?: string }>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body,
      }
    );

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Forgot password route error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send password reset request." },
      { status: 500 }
    );
  }
}

