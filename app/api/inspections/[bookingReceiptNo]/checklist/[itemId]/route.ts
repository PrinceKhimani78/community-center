import { proxyBackendJson } from "@/lib/api/backend";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingReceiptNo: string; itemId: string }> }
) {
  const { bookingReceiptNo, itemId } = await context.params;
  const body = await request.json();
  return proxyBackendJson(
    `/api/inspections/${encodeURIComponent(bookingReceiptNo)}/checklist/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      body,
    }
  );
}
