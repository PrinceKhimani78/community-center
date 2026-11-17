import { proxyBackendJson } from "@/lib/api/backend";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyBackendJson(`/api/deposit-refunds/${encodeURIComponent(id)}`);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  return proxyBackendJson(`/api/deposit-refunds/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}
