import { proxyBackendJson } from "@/lib/api/backend";

export async function POST(request: Request) {
  const body = await request.json();
  return proxyBackendJson("/api/hall-checks/save-to-refund", {
    method: "POST",
    body,
  });
}
