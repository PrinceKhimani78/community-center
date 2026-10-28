"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Calendar,
  Bell,
} from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";

interface TopbarProps {
  title?: string;
  breadcrumb?: string;
}

export default function Topbar({ title = "Dashboard", breadcrumb = "Home" }: TopbarProps) {
  const { role, actionCount, toggleMobileSidebar } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const isManager = role === "manager";
  const userInitials = isManager ? "MG" : "AD";
  const userName = isManager ? "Manager" : "Admin";
  const userRoleTitle = isManager ? "Centre Manager" : "Trustee / Admin";

  return (
    <header
      style={{
        height: "60px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        position: "sticky",
        top: 0,
        zIndex: 20,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      {/* Left: Mobile Menu Button + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          style={{
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
            color: "#0B2A5B",
          }}
          className="lg:hidden flex items-center justify-center cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 select-none min-w-0">
          <span
            style={{ color: "#64748B", fontSize: "13px", fontWeight: 500 }}
            className="hidden sm:inline"
          >
            {breadcrumb}
          </span>
          <span style={{ color: "#CBD5E1", fontSize: "12px" }} className="hidden sm:inline">
            /
          </span>
          <h1
            style={{
              color: "#0B2A5B",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "var(--font-poppins)",
            }}
            className="tracking-tight truncate"
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Date Chip, Bell, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search box - Desktop */}
        <div
          style={{ position: "relative", width: "290px" }}
          className="hidden md:flex items-center"
        >
          <Search
            style={{
              position: "absolute",
              left: "11px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
              pointerEvents: "none",
            }}
            className="w-3.5 h-3.5"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings, receipts..."
            style={{
              height: "36px",
              paddingLeft: "34px",
              paddingRight: "54px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              fontSize: "12.5px",
              color: "#0B2A5B",
              width: "100%",
            }}
            className="focus:outline-none focus:ring-2 focus:ring-[#E2B544] transition-all placeholder:text-[#94A3B8]"
          />
          <span
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              fontSize: "10px",
              color: "#64748B",
              padding: "1.5px 5px",
              borderRadius: "4px",
              pointerEvents: "none",
              fontWeight: 600,
            }}
            className="shadow-2xs"
          >
            Ctrl K
          </span>
        </div>

        {/* Search icon button - Mobile */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
          }}
          className="md:hidden flex items-center justify-center text-navy hover:bg-slate-100 cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-navy" />
        </button>

        {/* Date chip (hidden on mobile, visible on sm and up) */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "6px 12px",
            color: "#475569",
            fontSize: "12.5px",
            fontWeight: 500,
            userSelect: "none",
          }}
          className="hidden sm:flex items-center gap-1.5 shrink-0"
        >
          <Calendar className="w-3.5 h-3.5" style={{ color: "#0B2A5B" }} />
          <span>Tue, 20 Oct 2026</span>
        </div>

        {/* Bell Button with red count bubble */}
        <Link
          href="/notifications"
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0B2A5B",
          }}
          className="hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {actionCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                fontSize: "9.5px",
                fontWeight: 700,
                height: "17px",
                minWidth: "17px",
                padding: "0 4px",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              {actionCount}
            </span>
          )}
        </Link>

        {/* User Profile Avatar & Info */}
        <div
          style={{ paddingLeft: "8px", borderLeft: "1px solid #E2E8F0" }}
          className="flex items-center gap-2.5"
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              backgroundColor: "#0B2A5B",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(11, 42, 91, 0.2)",
            }}
          >
            {userInitials}
          </div>
          <div className="hidden xl:flex flex-col leading-tight text-left">
            <span style={{ color: "#0B2A5B", fontSize: "13px", fontWeight: 700 }}>
              {userName}
            </span>
            <span style={{ color: "#64748B", fontSize: "11px", fontWeight: 500 }}>
              {userRoleTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Field */}
      {isMobileSearchOpen && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: 0,
            right: 0,
            padding: "12px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="md:hidden"
        >
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings, receipts..."
            autoFocus
            style={{
              flex: 1,
              height: "36px",
              padding: "0 12px",
              borderRadius: "8px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              fontSize: "13px",
              color: "#0B2A5B",
            }}
            className="focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
          />
        </div>
      )}
    </header>
  );
}
