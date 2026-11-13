import { proxyBackendJson } from "@/lib/api/backend";

export async function GET() {
  return proxyBackendJson("/api/bookings");
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyBackendJson("/api/bookings", { method: "POST", body });
}

