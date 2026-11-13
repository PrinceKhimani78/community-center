import { proxyBackendJson } from "@/lib/api/backend";

export async function PATCH() {
  return proxyBackendJson("/api/notifications/read-all", { method: "PATCH" });
}

