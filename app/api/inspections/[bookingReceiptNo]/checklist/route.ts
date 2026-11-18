import { proxyBackendJson } from "@/lib/api/backend";

export async function GET(
  _request: Request,
  context: { params: Promise<{ bookingReceiptNo: string }> }
) {
  const { bookingReceiptNo } = await context.params;
  return proxyBackendJson(
    `/api/inspections/${encodeURIComponent(bookingReceiptNo)}/checklist`
  );
}
