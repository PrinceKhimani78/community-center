import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") === "admin" ? "admin" : "manager";
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const cookieStore = await cookies();
  const sessionData = JSON.stringify({
    userId: role,
    role: role,
    authenticatedAt: new Date().toISOString(),
  });

  cookieStore.set({
    name: "valibhoy_session",
    value: sessionData,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
