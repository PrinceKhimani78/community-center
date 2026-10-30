"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ActionList from "@/components/dashboard/ActionList";
import ComingUp from "@/components/dashboard/ComingUp";

export default function DashboardPage() {
  const { role } = useDashboard();
  const [greetingTime, setGreetingTime] = useState("Good afternoon");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreetingTime("Good morning");
    } else if (hour < 17) {
      setGreetingTime("Good afternoon");
    } else {
      setGreetingTime("Good evening");
    }
  }, []);

  const userName = role === "admin" ? "Admin" : "Manager";

  return (
    <div
      style={{
        backgroundColor: "#FAF5EB",
        backgroundImage: "linear-gradient(180deg, #FAF5EB 0%, #F6EFE2 50%, #FAF5EB 100%)",
        padding: "clamp(24px, 3.5vw, 42px) clamp(20px, 4vw, 48px) 64px clamp(20px, 4vw, 48px)",
      }}
      className="relative w-full min-h-[calc(100vh-60px)] overflow-hidden"
    >
      {/* =========================================================================
          BACKGROUND FLOWING GOLDEN WAVES ("thodi wave jaji krvani jrur che")
          Multiple layered organic wave ribbons echoing the login screen branding
          ========================================================================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <svg
          viewBox="0 0 1440 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft Warm Gold Flares */}
            <linearGradient id="dashGoldFlare" x1="100%" y1="0%" x2="30%" y2="60%">
              <stop offset="0%" stopColor="#E8D5B0" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#F4E8D3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FAF5EB" stopOpacity="0" />
            </linearGradient>

            {/* Rich Metallic Gold Wave Gradient */}
            <linearGradient id="dashWaveGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9971C" />
              <stop offset="20%" stopColor="#F7E6A9" />
              <stop offset="50%" stopColor="#E2B544" />
              <stop offset="80%" stopColor="#FFF2BF" />
              <stop offset="100%" stopColor="#C9971C" />
            </linearGradient>

            {/* Glowing Golden Stroke Filter */}
            <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#C9971C" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* 1. TOP-RIGHT LAYERED FLOWING GOLDEN WAVES (5 Layered Ribbons) */}
          <path
            d="M850,0 C1040,70 1250,190 1440,340 L1440,0 Z"
            fill="url(#dashGoldFlare)"
          />
          <path
            d="M880,0 C1070,90 1270,220 1440,360"
            stroke="url(#dashWaveGold)"
            strokeWidth="4"
            strokeOpacity="0.6"
            filter="url(#waveGlow)"
            fill="none"
          />
          <path
            d="M940,0 C1120,95 1310,230 1440,345"
            stroke="#FFF2BF"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            fill="none"
          />
          <path
            d="M980,0 C1160,105 1340,240 1440,325"
            stroke="#DEC797"
            strokeWidth="2.5"
            strokeOpacity="0.5"
            fill="none"
          />
          <path
            d="M1060,0 C1215,100 1370,215 1440,285"
            stroke="#E9D5AA"
            strokeWidth="2"
            strokeOpacity="0.55"
            fill="none"
          />
          <path
            d="M1140,0 C1265,90 1395,185 1440,240"
            stroke="#E2B544"
            strokeWidth="1.5"
            strokeOpacity="0.45"
            fill="none"
          />

          {/* 2. MID-CANVAS FLOWING S-CURVE WAVES (Rippling across the width) */}
          <path
            d="M-20,420 C280,340 580,500 940,410 C1200,340 1370,450 1460,490"
            stroke="url(#dashWaveGold)"
            strokeWidth="3"
            strokeOpacity="0.32"
            fill="none"
          />
          <path
            d="M-20,445 C300,365 600,525 960,435 C1220,365 1390,475 1460,515"
            stroke="#E2B544"
            strokeWidth="2"
            strokeOpacity="0.28"
            fill="none"
          />
          <path
            d="M-20,470 C320,390 620,550 980,460 C1240,390 1410,500 1460,540"
            stroke="#DEC797"
            strokeWidth="1.5"
            strokeOpacity="0.22"
            fill="none"
          />

          {/* 3. LOWER FLOWING WAVES (Behind Action & Coming up lists) */}
          <path
            d="M-40,720 C220,660 480,800 800,730 C1060,670 1280,780 1460,740"
            stroke="url(#dashWaveGold)"
            strokeWidth="2.5"
            strokeOpacity="0.28"
            fill="none"
          />
          <path
            d="M-40,750 C240,690 500,830 820,760 C1080,700 1300,810 1460,770"
            stroke="#E2B544"
            strokeWidth="1.5"
            strokeOpacity="0.25"
            fill="none"
          />

          {/* 4. BOTTOM-LEFT SWEEPING WAVES */}
          <path
            d="M0,820 C260,840 500,910 680,1000"
            stroke="url(#dashWaveGold)"
            strokeWidth="3"
            strokeOpacity="0.35"
            fill="none"
          />
          <path
            d="M0,860 C240,875 460,940 610,1000"
            stroke="#DEC797"
            strokeWidth="2"
            strokeOpacity="0.3"
            fill="none"
          />
          <path
            d="M0,900 C210,910 410,965 540,1000"
            stroke="#E9D5AA"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            fill="none"
          />
        </svg>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
        className="relative z-10"
      >
        {/* =========================================================================
            1. HERO WAVE GREETING BANNER
            Flowing Gold Ribbon Waves with Royal Navy & Golden Accents
            ========================================================================= */}
        <section
          aria-label="Welcome and Actions"
          style={{
            background: "linear-gradient(135deg, #031330 0%, #06204E 46%, #0B2A5B 100%)",
            border: "1.5px solid rgba(226, 181, 68, 0.45)",
            borderRadius: "24px",
            boxShadow: "0 22px 50px -10px rgba(11, 42, 91, 0.28), 0 6px 20px rgba(226, 181, 68, 0.16)",
            padding: "clamp(26px, 3.5vw, 38px) clamp(20px, 4vw, 44px) clamp(32px, 4vw, 40px) clamp(20px, 4vw, 44px)",
            position: "relative",
          }}
          className="overflow-hidden select-none"
        >
          {/* Subtle Sapphire Flare Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 10% 100%, rgba(30, 64, 175, 0.4) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Integrated Flowing Multi-Ribbon Waves Pinned Along Bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "75px",
              pointerEvents: "none",
              zIndex: 0,
              overflow: "hidden",
            }}
          >
            <svg
              viewBox="0 0 1200 75"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-cover"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Banner Metallic Gold Ribbon */}
                <linearGradient id="heroGoldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9971C" />
                  <stop offset="18%" stopColor="#F7E6A9" />
                  <stop offset="48%" stopColor="#E2B544" />
                  <stop offset="78%" stopColor="#FFF2BF" />
                  <stop offset="100%" stopColor="#8A6510" />
                </linearGradient>

                {/* Bright Center Highlight */}
                <linearGradient id="heroGoldHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFF9E3" />
                  <stop offset="50%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FFE79A" />
                </linearGradient>

                <filter id="bannerRibbonShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Wave 1: Soft Ambient Background Wave */}
              <path
                d="M-40,48 C200,32 465,65 760,42 C980,26 1140,55 1240,38"
                stroke="#E2B544"
                strokeWidth="2"
                strokeOpacity="0.25"
                fill="none"
              />

              {/* Wave 2: Upper Secondary Wave */}
              <path
                d="M-40,55 C220,38 485,70 785,48 C1005,32 1155,62 1240,45"
                stroke="#DEC797"
                strokeWidth="2"
                strokeOpacity="0.38"
                fill="none"
              />

              {/* Wave 3: Main Flowing Gold Ribbon (Signature Bold Wave) */}
              <path
                d="M-40,64 C250,44 520,74 830,54 C1040,38 1175,68 1240,52"
                stroke="url(#heroGoldRibbon)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#bannerRibbonShadow)"
                fill="none"
              />

              {/* Wave 4: Gold Ribbon Center Gleam (Bright white-gold core) */}
              <path
                d="M-40,64 C250,44 520,74 830,54 C1040,38 1175,68 1240,52"
                stroke="url(#heroGoldHighlight)"
                strokeWidth="2"
                strokeOpacity="0.95"
                strokeLinecap="round"
                fill="none"
              />

              {/* Wave 5: Lower Rippling Gold Wave */}
              <path
                d="M-40,70 C270,52 540,76 850,62 C1060,48 1185,73 1240,60"
                stroke="#E2B544"
                strokeWidth="2"
                strokeOpacity="0.4"
                fill="none"
              />
            </svg>
          </div>

          {/* Banner Content Layout */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-7">
            {/* Left: Branding, Greeting & Operational Badge */}
            <div className="max-w-2xl">
              {/* Status Pill & Location */}
              <div className="flex items-center gap-3 mb-3.5 flex-wrap">
                <span
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.18)",
                    border: "1px solid rgba(52, 211, 153, 0.55)",
                    color: "#A7F3D0",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "4px 13px",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_8px_#34D399]" />
                  <span>Hall Operational</span>
                </span>
                <span style={{ color: "rgba(226, 181, 68, 0.5)", fontSize: "12px" }}>•</span>
                <span
                  style={{
                    color: "#F6EFE2",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E2B544]" />
                  <span>Dhari, Gujarat</span>
                </span>
              </div>

              {/* Greeting Title */}
              <h1
                style={{
                  color: "#FFFFFF",
                  fontSize: "clamp(24px, 4vw, 30px)",
                  fontWeight: 700,
                  fontFamily: "var(--font-poppins)",
                  letterSpacing: "-0.01em",
                }}
                className="leading-tight drop-shadow-sm"
              >
                {greetingTime},{" "}
                <span style={{ color: "#F7E6A9" }}>{userName}</span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.88)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
                className="font-normal mt-2.5 max-w-xl"
              >
                Overview of community hall bookings, collections, and pending actions today.
              </p>
            </div>

            {/* Right: Primary Coordinated Action Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-4 shrink-0 w-full sm:w-auto">
              {/* + New Booking (Navy with Gold accent border & glow) */}
              <Link
                href="/bookings/new"
                style={{
                  height: "44px",
                  padding: "0 18px",
                  backgroundColor: "rgba(4, 21, 53, 0.85)",
                  border: "1.5px solid #E2B544",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(226, 181, 68, 0.3)",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                className="hover:bg-[#072254] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(226,181,68,0.4)] active:scale-[0.98] whitespace-nowrap transition-all"
              >
                <Plus className="w-4 h-4 shrink-0 text-[#F7E6A9]" />
                <span>New Booking</span>
              </Link>

              {/* ₹ Record Payment (Luminous Gold Gradient) */}
              <Link
                href="/payments"
                style={{
                  height: "44px",
                  padding: "0 20px",
                  background: "linear-gradient(135deg, #F7E6A9 0%, #E2B544 50%, #C9971C 100%)",
                  border: "1px solid #FFE79A",
                  color: "#041535",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: "0 4px 16px rgba(201, 151, 28, 0.45)",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                className="hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(226,181,68,0.55)] active:scale-[0.98] whitespace-nowrap transition-all"
              >
                <span style={{ fontSize: "15px", fontWeight: 800 }}>₹</span>
                <span>Record Payment</span>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. THREE SUMMARY CARDS (Uncluttered, Spacious, Warm Gold Aesthetics)
            ========================================================================= */}
        <SummaryCards />

        {/* =========================================================================
            3. TWO COLUMNS (Action List & Coming Up Bookings)
            Generous spacing, airy cards, clear visual hierarchy
            ========================================================================= */}
        <section
          aria-label="Action and Upcoming Bookings"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start"
        >
          {/* LEFT: Needs your action (7 cols) */}
          <div className="lg:col-span-7 w-full">
            <ActionList />
          </div>

          {/* RIGHT: Coming up (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <ComingUp />
          </div>
        </section>
      </div>
    </div>
  );
}

