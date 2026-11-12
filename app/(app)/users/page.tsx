"use client";

import React from "react";
import AdminHub from "@/components/features/AdminHub";

export default function UsersPage() {
  return (
    <AdminHub
      initialTab="users"
      title="Users"
      subtitle="View Admin & Manager accounts, add new users, or remove access."
    />
  );
}
