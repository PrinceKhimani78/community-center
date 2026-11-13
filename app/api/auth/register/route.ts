import { NextResponse } from "next/server";
import { backendFetch, isBackendConfigured } from "@/lib/api/backend";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isBackendConfigured()) {
      return NextResponse.json(
        {
          success: true,
          approvalStatus: "Pending",
          offlineDemo: true,
          message:
            "Access request saved in demo preview. Connect BACKEND_API_URL to persist Pending User Approvals in MySQL.",
        },
        { status: 202 }
      );
    }

    const result = await backendFetch<{ success?: boolean; message?: string }>("/api/auth/register", {
      method: "POST",
      body,
    });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Auth register route error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit login access request." },
      { status: 500 }
    );
  }
}

