import { proxyBackendJson } from "@/lib/api/backend";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingReceiptNo: string }> }
) {
  const { bookingReceiptNo } = await context.params;
  const body = await request.json();
  return proxyBackendJson(
    `/api/inspections/${encodeURIComponent(bookingReceiptNo)}/meter`,
    {
      method: "PATCH",
      body,
    }
  );
}
