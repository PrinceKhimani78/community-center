"use client";

import React, { Suspense } from "react";
import PropertyInspectionView from "@/components/features/PropertyInspectionView";

export default function InspectionsIndexPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading inspection...</div>}>
      <PropertyInspectionView />
    </Suspense>
  );
}
