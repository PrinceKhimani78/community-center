import { proxyBackendJson } from "@/lib/api/backend";

export async function GET() {
  return proxyBackendJson("/api/applicants");
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyBackendJson("/api/applicants", { method: "POST", body });
}

