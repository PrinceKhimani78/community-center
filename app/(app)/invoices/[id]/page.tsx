"use client";

import React, { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import InvoicesReceiptsView, {
  type DocumentType,
} from "@/components/features/InvoicesReceiptsView";

function InvoiceByIdContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialType: DocumentType =
    typeParam === "payment" || typeParam === "deposit" || typeParam === "refund"
      ? typeParam
      : "invoice";

  return (
    <InvoicesReceiptsView
      key={`${params.id}-${initialType}`}
      initialBookingId={params.id}
      initialType={initialType}
    />
  );
}

export default function InvoiceDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading invoice preview...</div>}>
      <InvoiceByIdContent />
    </Suspense>
  );
}

