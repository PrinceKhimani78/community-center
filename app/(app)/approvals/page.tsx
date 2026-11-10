"use client";

import React from "react";
import AdminHub from "@/components/features/AdminHub";

export default function ApprovalsPage() {
  return (
    <AdminHub
      initialTab="approvals"
      title="Approvals"
      subtitle="Approve or reject free hall use, deposit refunds, and expenses."
    />
  );
}
