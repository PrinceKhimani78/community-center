import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { DashboardProvider } from "@/lib/context/DashboardContext";

export const instant = false;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("valibhoy_session");

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  let role: "manager" | "admin" = "manager";
  let userId = "manager";

  try {
    const parsed = JSON.parse(sessionCookie.value);
    role = parsed.role === "admin" ? "admin" : "manager";
    userId = parsed.userId || role;
  } catch {
    role = sessionCookie.value === "admin" ? "admin" : "manager";
    userId = role;
  }

  return (
    <DashboardProvider initialRole={role} initialUserId={userId}>
      <div
        style={{ backgroundColor: "#FAF5EB" }}
        className="min-h-screen flex font-sans text-ink antialiased"
      >
        {/* Responsive Sidebar */}
        <Sidebar />

        {/* Content Area with Topbar */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main style={{ backgroundColor: "#FAF5EB" }} className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
