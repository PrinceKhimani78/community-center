import { proxyBackendJson } from "@/lib/api/backend";

export async function GET(
  _request: Request,
  context: { params: Promise<{ bookingReceiptNo: string }> }
) {
  const { bookingReceiptNo } = await context.params;
  return proxyBackendJson(
    `/api/inspections/${encodeURIComponent(bookingReceiptNo)}/photos`
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ bookingReceiptNo: string }> }
) {
  const { bookingReceiptNo } = await context.params;
  const body = await request.json();
  return proxyBackendJson(
    `/api/inspections/${encodeURIComponent(bookingReceiptNo)}/photos`,
    {
      method: "POST",
      body,
    }
  );
}
