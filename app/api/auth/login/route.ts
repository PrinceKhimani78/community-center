import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// TODO: Replace mock credentials with production database authentication and password hashing (e.g., Argon2/bcrypt)
const DEMO_USERS: Record<string, { pass: string; role: string }> = {
  manager: { pass: "manager123", role: "manager" },
  admin: { pass: "admin123", role: "admin" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, password, keepMeSignedIn } = body;

    const trimmedId = (userId || "").trim().toLowerCase();
    const user = DEMO_USERS[trimmedId];

    if (!user || user.pass !== password) {
      // Return generic failure to prevent account enumeration
      return NextResponse.json(
        { success: false, message: "User ID or password is incorrect." },
        { status: 401 }
      );
    }

    // Set httpOnly session cookie
    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      userId: trimmedId,
      role: user.role,
      authenticatedAt: new Date().toISOString(),
    });

    const cookieOptions = {
      name: "valibhoy_session",
      value: sessionData,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      // Longer expiry (30 days) if "Keep me signed in" is checked, else 1 day / session
      maxAge: keepMeSignedIn ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
    };

    cookieStore.set(cookieOptions);

    return NextResponse.json({
      success: true,
      role: user.role,
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
