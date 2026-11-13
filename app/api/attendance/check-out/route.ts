import { proxyBackendJson } from "@/lib/api/backend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyBackendJson("/api/attendance/check-out", {
    method: "POST",
    body,
  });
}
