"use client";

import React from "react";
import AdminHub from "@/components/features/AdminHub";

export default function UsersPage() {
  return (
    <AdminHub
      initialTab="users"
      title="Users & Roles"
      subtitle="Manage staff accounts and active status."
    />
  );
}
