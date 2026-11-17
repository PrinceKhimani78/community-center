import { proxyBackendJson } from "@/lib/api/backend";

export async function GET() {
  return proxyBackendJson("/api/deposit-refunds");
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyBackendJson("/api/deposit-refunds", { method: "POST", body });
}
