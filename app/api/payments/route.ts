import { proxyBackendJson } from "@/lib/api/backend";

export async function GET() {
  return proxyBackendJson("/api/payments");
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyBackendJson("/api/payments", { method: "POST", body });
}
