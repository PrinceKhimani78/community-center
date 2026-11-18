import { proxyBackendJson } from "@/lib/api/backend";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyBackendJson(`/api/tickets/${encodeURIComponent(id)}/photos`);
}
