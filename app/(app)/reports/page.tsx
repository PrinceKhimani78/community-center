"use client";

import React from "react";
import AdminHub from "@/components/features/AdminHub";

export default function ReportsPage() {
  return (
    <AdminHub
      initialTab="reports"
      title="Reports & Export"
      subtitle="View booking and money summaries or print / download CSV."
    />
  );
}
