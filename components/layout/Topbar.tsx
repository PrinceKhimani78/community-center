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
    <header className="h-[76px] bg-white border-b border-[#EFE4CC] sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Button + Title / Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-navy hover:bg-cream border border-[#EFE4CC] flex items-center justify-center"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[12px] text-muted font-medium">{breadcrumb}</span>
          <h2 className="text-[20px] font-bold text-navy leading-none mt-0.5 tracking-tight truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* Right items: Search, Date Chip, Bell, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Search box - Desktop */}
        <div className="hidden md:flex items-center relative w-[280px] xl:w-[320px]">
          <Search className="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicant, booking or receipt no."
            className="w-full h-[42px] pl-10 pr-14 rounded-full bg-[#FBF6EC] border border-[#EFE4CC] text-[13px] text-navy placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-light-gold transition-all"
          />
          <span className="absolute right-3 px-1.5 py-0.5 rounded text-[11px] font-medium bg-white text-muted border border-[#EFE4CC] pointer-events-none shadow-2xs">
            Ctrl K
          </span>
        </div>

        {/* Search icon button - Mobile */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="md:hidden w-[40px] h-[40px] rounded-full bg-[#FBF6EC] border border-[#EFE4CC] flex items-center justify-center text-navy hover:bg-[#F8E7B9]/40"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-navy" />
        </button>

        {/* Date chip */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8E7B9] text-navy border border-[#E2B544]/30 select-none shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-navy shrink-0" />
          <span className="text-[13px] font-medium whitespace-nowrap">Tue, 20 Oct 2026</span>
        </div>

        {/* Bell Button (44x44) with red count bubble */}
        <Link
          href="/notifications"
          className="w-[44px] h-[44px] rounded-full bg-cream/70 hover:bg-[#F8E7B9]/40 border border-[#EFE4CC] relative flex items-center justify-center text-navy transition-colors shrink-0"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-navy" />
          {actionCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-[#C62828] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
              {actionCount}
            </span>
          )}
        </Link>

        {/* User Profile Avatar & Info */}
        <div className="flex items-center gap-2.5 pl-1 sm:pl-2">
          <div className="w-[42px] h-[42px] rounded-full bg-navy text-white font-bold text-[14px] flex items-center justify-center shrink-0 border border-light-gold/30 shadow-xs">
            {userInitials}
          </div>
          <div className="hidden xl:flex flex-col justify-center text-left leading-tight">
            <span className="text-[14px] font-bold text-navy">{userName}</span>
            <span className="text-[12px] text-muted">{userRoleTitle}</span>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Field */}
      {isMobileSearchOpen && (
        <div className="absolute top-[76px] left-0 right-0 p-3 bg-white border-b border-[#EFE4CC] shadow-md md:hidden z-20 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicant, booking or receipt no."
            autoFocus
            className="flex-1 h-[40px] px-3 rounded-xl bg-[#FBF6EC] border border-[#EFE4CC] text-[13px] text-navy focus:outline-none focus:ring-2 focus:ring-light-gold"
          />
        </div>
      )}
    </header>
  );
}
