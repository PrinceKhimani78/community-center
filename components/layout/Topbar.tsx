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
    <header className="h-[64px] bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Button + Title / Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-navy hover:bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[11px] text-slate-500 font-medium leading-none">{breadcrumb}</span>
          <h2 className="text-[17px] font-bold text-navy leading-tight mt-0.5 tracking-tight truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* Right items: Search, Date Chip, Bell, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search box - Desktop */}
        <div
          style={{ position: "relative", width: "320px" }}
          className="hidden md:flex items-center"
        >
          <Search
            style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}
            className="w-3.5 h-3.5"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicant, booking or receipt no."
            style={{
              height: "36px",
              paddingLeft: "34px",
              paddingRight: "56px",
              backgroundColor: "#F8FAFC",
              borderColor: "#E2E8F0",
              borderWidth: "1px",
              borderRadius: "9999px",
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
              backgroundColor: "#FFFFFF",
              borderColor: "#CBD5E1",
              borderWidth: "1px",
              fontSize: "10px",
              color: "#64748B",
              padding: "1.5px 5px",
              borderRadius: "4px",
              pointerEvents: "none",
            }}
            className="font-medium shadow-2xs"
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
            borderColor: "#E2E8F0",
            borderWidth: "1px",
          }}
          className="md:hidden rounded-full flex items-center justify-center text-navy hover:bg-slate-100"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-navy" />
        </button>

        {/* Date chip */}
        <div
          style={{
            backgroundColor: "#FFF9EA",
            borderColor: "rgba(226, 181, 68, 0.4)",
            borderWidth: "1px",
            color: "#8A6510",
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full select-none shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-[#8A6510] shrink-0" />
          <span className="text-[12px] font-medium whitespace-nowrap">Tue, 20 Oct 2026</span>
        </div>

        {/* Bell Button with red count bubble */}
        <Link
          href="/notifications"
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: "#F8FAFC",
            borderColor: "#E2E8F0",
            borderWidth: "1px",
            position: "relative",
          }}
          className="rounded-full hover:bg-slate-100 flex items-center justify-center text-navy transition-colors shrink-0"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-navy" />
          {actionCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-3px",
                right: "-3px",
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
              }}
              className="h-4 min-w-4 px-1 rounded-full text-[9.5px] font-bold flex items-center justify-center shadow-xs"
            >
              {actionCount}
            </span>
          )}
        </Link>

        {/* User Profile Avatar & Info */}
        <div className="flex items-center gap-2 pl-1 sm:pl-1.5">
          <div
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#0B2A5B",
              borderColor: "rgba(226, 181, 68, 0.4)",
              borderWidth: "1px",
              color: "#FFFFFF",
            }}
            className="rounded-full font-bold text-[13px] flex items-center justify-center shrink-0 shadow-xs"
          >
            {userInitials}
          </div>
          <div className="hidden xl:flex flex-col justify-center text-left leading-tight">
            <span style={{ color: "#0B2A5B" }} className="text-[13px] font-bold">
              {userName}
            </span>
            <span style={{ color: "#64748B" }} className="text-[11px]">
              {userRoleTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Field */}
      {isMobileSearchOpen && (
        <div className="absolute top-[64px] left-0 right-0 p-3 bg-white border-b border-slate-200 shadow-md md:hidden z-20 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicant, booking or receipt no."
            autoFocus
            className="flex-1 h-[36px] px-3 rounded-lg bg-slate-50 border border-slate-200 text-[13px] text-navy focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
          />
        </div>
      )}
    </header>
  );
}
