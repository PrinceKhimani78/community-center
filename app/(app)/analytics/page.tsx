"use client";

import React from "react";
import AdminHub from "@/components/features/AdminHub";

export default function AnalyticsPage() {
  return (
    <AdminHub
      initialTab="reports"
      title="Summary & Analytics"
      subtitle="Bookings, money collected, and expense totals."
    />
  );
}
