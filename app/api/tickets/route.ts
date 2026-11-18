import { proxyBackendJson } from "@/lib/api/backend";

export async function GET() {
  return proxyBackendJson("/api/tickets");
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyBackendJson("/api/tickets", { method: "POST", body });
}
