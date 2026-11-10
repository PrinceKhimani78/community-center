"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import PropertyInspectionView from "@/components/features/PropertyInspectionView";

function InspectionByIdContent() {
  const params = useParams<{ id: string }>();
  return <PropertyInspectionView key={params.id} initialBookingId={params.id} />;
}

export default function InspectionDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading inspection...</div>}>
      <InspectionByIdContent />
    </Suspense>
  );
}

