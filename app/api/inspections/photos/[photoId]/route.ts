import { proxyBackendJson } from "@/lib/api/backend";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await context.params;
  return proxyBackendJson(
    `/api/inspections/photos/${encodeURIComponent(photoId)}`,
    { method: "DELETE" }
  );
}
