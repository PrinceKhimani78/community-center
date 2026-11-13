import { proxyBackendJson } from "@/lib/api/backend";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  return proxyBackendJson(`/api/applicants/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

