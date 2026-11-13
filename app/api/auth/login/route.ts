import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFetch, isBackendConfigured } from "@/lib/api/backend";

const DEMO_USERS: Record<string, { pass: string; role: string; name: string }> = {
  admin: { pass: "admin123", role: "admin", name: "Haji Valibhoy Trustee" },
  manager: { pass: "manager123", role: "manager", name: "Centre Manager" },
  accounts: { pass: "accounts123", role: "accountant", name: "Imtiyaz Accountant" },
  caretaker: { pass: "staff123", role: "staff", name: "Irfanbhai Bloch" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, password, keepMeSignedIn } = body;
    const trimmedId = String(userId || "").trim().toLowerCase();

    let sessionRole = "manager";
    let sessionName = trimmedId;
    let backendToken: string | undefined;

    if (isBackendConfigured()) {
      const result = await backendFetch<{
        success?: boolean;
        token?: string;
        role?: string;
        code?: string;
        message?: string;
        user?: { userId: string; name: string; role: string };
      }>("/api/auth/login", {
        method: "POST",
        body: { userId: trimmedId, password, keepMeSignedIn },
      });

      if (!result.ok || !result.data.success) {
        return NextResponse.json(
          {
            success: false,
            code: result.data.code,
            message: result.data.message || "User ID or password is incorrect.",
          },
          { status: result.status || 401 }
        );
      }

      backendToken = result.data.token;
      sessionRole = (result.data.role || result.data.user?.role || "manager").toLowerCase();
      sessionName = result.data.user?.name || trimmedId;
    } else {
      const user = DEMO_USERS[trimmedId];
      if (!user || user.pass !== password) {
        return NextResponse.json(
          { success: false, message: "User ID or password is incorrect." },
          { status: 401 }
        );
      }
      sessionRole = user.role;
      sessionName = user.name;
    }

    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      token: backendToken,
      userId: trimmedId,
      name: sessionName,
      role: sessionRole,
      authenticatedAt: new Date().toISOString(),
    });

    cookieStore.set({
      name: "valibhoy_session",
      value: sessionData,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: keepMeSignedIn ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      role: sessionRole,
      name: sessionName,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Auth login route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
