import { cookies } from "next/headers";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";

export const instant = false;

async function UserRole() {
  const cookieStore = await cookies();
  const session = cookieStore.get("valibhoy_session");
  let role = "Authorized User";
  if (session?.value) {
    try {
      const data = JSON.parse(session.value);
      role = data.role || "Authorized User";
    } catch {
      role = session.value;
    }
  }

  return <span className="font-semibold text-navy uppercase">{role}</span>;
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white border border-card-border shadow-lg rounded-2xl p-8 max-w-md w-full flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center text-navy">
          <ShieldCheck className="w-6 h-6 text-navy" />
        </div>
        <h1 className="text-2xl font-bold text-navy">Dashboard – coming soon</h1>
        <p className="text-muted text-sm">
          You are authenticated as{" "}
          <Suspense fallback={<span className="font-semibold text-navy uppercase">User</span>}>
            <UserRole />
          </Suspense>
          .
        </p>
        <Link
          href="/login"
          className="mt-4 px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors focus:outline-none focus:ring-2 focus:ring-light-gold"
        >
          Return to Login
        </Link>
      </div>
    </main>
  );
}

