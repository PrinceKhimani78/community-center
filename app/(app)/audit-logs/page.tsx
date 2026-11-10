"use client";

import React from "react";
import AdminHub from "@/components/features/AdminHub";

export default function AuditLogsPage() {
  return (
    <AdminHub
      initialTab="audit"
      title="Activity Log"
      subtitle="Simple history of recent bookings, payments, and approvals."
    />
  );
}
