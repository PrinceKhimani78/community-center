import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login · Haji Mohamed Yunus Valibhoy Community Centre",
  description: "Community Centre Management System - Dhari, Gujarat, India",
};

export default function LoginPage() {
  return (
    <div
      style={{ backgroundColor: "#FAF5EB" }}
      className="relative w-full min-h-screen overflow-x-hidden font-sans select-none"
    >
      {/* =========================================================================
          DESKTOP VIEW (>= 1024px): 50/50 Dual Canvas with Flowing Gold Wave
          ========================================================================= */}
      <div className="hidden lg:flex relative w-full h-screen overflow-hidden">
        {/* Background SVG Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <svg
            viewBox="0 0 1440 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Deep Royal Navy Gradient */}
              <linearGradient id="navyBgGradient" x1="0%" y1="0%" x2="60%" y2="100%">
                <stop offset="0%" stopColor="#041535" />
                <stop offset="35%" stopColor="#072254" />
                <stop offset="70%" stopColor="#0A2C68" />
                <stop offset="100%" stopColor="#021028" />
              </linearGradient>

              {/* Metallic Gold Ribbon Gradient */}
              <linearGradient id="goldRibbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9971C" />
                <stop offset="15%" stopColor="#F7E6A9" />
                <stop offset="45%" stopColor="#E2B544" />
                <stop offset="70%" stopColor="#FFF2BF" />
                <stop offset="88%" stopColor="#C9971C" />
                <stop offset="100%" stopColor="#8A6510" />
              </linearGradient>

              {/* Bright Center Highlight for Gold Ribbon */}
              <linearGradient id="goldCenterHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF9E3" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFE79A" />
              </linearGradient>

              {/* Soft Cream Right Side Gradient */}
              <linearGradient id="creamBgGradient" x1="50%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FAF5EB" />
                <stop offset="50%" stopColor="#F6EFE2" />
                <stop offset="100%" stopColor="#F2E8D8" />
              </linearGradient>

              {/* Bottom-left Silky Navy Sapphire Sheen */}
              <linearGradient id="bottomLeftSheen" x1="0%" y1="100%" x2="80%" y2="20%">
                <stop offset="0%" stopColor="#0E4AA8" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#082A6E" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#021028" stopOpacity="0" />
              </linearGradient>

              {/* Top-right Soft Gold Flares */}
              <linearGradient id="topRightFlare" x1="100%" y1="0%" x2="40%" y2="50%">
                <stop offset="0%" stopColor="#E8D5B0" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#F4E8D3" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FAF5EB" stopOpacity="0" />
              </linearGradient>

              {/* Drop Shadows */}
              <filter id="ribbonShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="8" dy="3" stdDeviation="12" floodColor="#704D09" floodOpacity="0.28" />
              </filter>
              <filter id="navyWaveShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="12" dy="0" stdDeviation="18" floodColor="#000000" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* 1. Base Cream Canvas */}
            <rect width="1440" height="900" fill="url(#creamBgGradient)" />

            {/* 2. Top-right Subtle Golden Fluid Waves */}
            <path
              d="M1000,0 C1140,80 1300,220 1440,360 L1440,0 Z"
              fill="url(#topRightFlare)"
            />
            <path
              d="M1080,0 C1200,90 1340,210 1440,320"
              stroke="#DEC797"
              strokeWidth="2.5"
              strokeOpacity="0.45"
              fill="none"
            />
            <path
              d="M1160,0 C1260,80 1380,170 1440,250"
              stroke="#E9D5AA"
              strokeWidth="1.5"
              strokeOpacity="0.55"
              fill="none"
            />

            {/* 3. Left Navy Area with S-Curve Edge */}
            <g filter="url(#navyWaveShadow)">
              <path
                d="M0,0 L710,0 C690,140 660,270 670,400 C680,510 740,590 770,680 C790,750 760,840 705,900 L0,900 Z"
                fill="url(#navyBgGradient)"
              />
            </g>

            {/* 4. Bottom-left Silk Sapphire Glow & Lines */}
            <path
              d="M0,560 C180,630 360,730 500,900 L0,900 Z"
              fill="url(#bottomLeftSheen)"
            />
            <path
              d="M0,560 C180,630 360,730 500,900"
              stroke="#E2B544"
              strokeWidth="1.5"
              strokeOpacity="0.35"
              fill="none"
            />
            <path
              d="M0,670 C150,720 290,800 400,900"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeOpacity="0.28"
              fill="none"
            />

            {/* 5. Main Flowing Golden Ribbon (The dividing wave) */}
            <path
              d="M710,0 C690,140 660,270 670,400 C680,510 740,590 770,680 C790,750 760,840 705,900"
              stroke="#6B4B0A"
              strokeWidth="20"
              strokeLinecap="round"
              strokeOpacity="0.3"
              filter="url(#ribbonShadow)"
              fill="none"
            />

            <path
              d="M710,0 C690,140 660,270 670,400 C680,510 740,590 770,680 C790,750 760,840 705,900"
              stroke="url(#goldRibbonGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />

            <path
              d="M710,0 C690,140 660,270 670,400 C680,510 740,590 770,680 C790,750 760,840 705,900"
              stroke="url(#goldCenterHighlight)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeOpacity="0.95"
              fill="none"
            />

            <path
              d="M722,0 C702,140 672,270 682,400 C692,510 752,590 782,680 C802,750 772,840 717,900"
              stroke="#E2B544"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              fill="none"
            />
          </svg>
        </div>

        {/* LEFT BRANDING HALF (48% width): Centered inside navy area */}
        <section
          aria-label="Community Centre Information"
          style={{ width: "48%", height: "100%" }}
          className="relative z-10 flex flex-col items-center justify-center p-8 xl:p-14 text-center"
        >
          {/* Logo with warm radial golden aura */}
          <div className="relative flex items-center justify-center shrink-0">
            <div
              style={{
                width: "260px",
                height: "260px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(226,181,68,0.22) 0%, transparent 70%)",
                position: "absolute",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
            <Image
              src="/logo.png"
              alt="Haji Mohamed Yunus Valibhoy Community Centre logo"
              width={210}
              height={210}
              unoptimized
              priority
              className="rounded-full object-contain select-none"
              style={{ filter: "drop-shadow(0 14px 34px rgba(0,0,0,0.42))" }}
            />
          </div>

          {/* Heading: Haji Mohamed Yunus Valibhoy Community Centre */}
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "30px",
              fontWeight: 800,
              lineHeight: 1.25,
              marginTop: "24px",
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              letterSpacing: "-0.01em",
              textShadow: "0 2px 8px rgba(0,0,0,0.35)",
            }}
          >
            <span>Haji Mohamed Yunus Valibhoy</span>
            <br />
            <span>Community Centre</span>
          </h1>

          {/* Gold Diamond Ornament Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "240px",
              margin: "16px 0",
            }}
            aria-hidden="true"
          >
            <div style={{ flex: 1, height: "1.5px", backgroundColor: "#E2B544" }} />
            <div
              style={{
                width: "9px",
                height: "9px",
                backgroundColor: "#E2B544",
                transform: "rotate(45deg)",
                margin: "0 10px",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, height: "1.5px", backgroundColor: "#E2B544" }} />
          </div>

          {/* Gujarati Heading: હાજી મોહમ્મદ યુનુસ વલીભોય કોમ્યુનિટી સેન્ટર */}
          <h2
            lang="gu"
            style={{
              color: "#F5C444",
              fontSize: "23px",
              fontWeight: 700,
              lineHeight: 1.35,
              fontFamily: "var(--font-gujarati), 'Noto Sans Gujarati', sans-serif",
              textShadow: "0 2px 8px rgba(0,0,0,0.35)",
            }}
          >
            <span>હાજી મોહમ્મદ યુનુસ વલીભોય</span>
            <br />
            <span>કોમ્યુનિટી સેન્ટર</span>
          </h2>

          {/* Subtitle: Serving Humanity · Dhari, Gujarat, India */}
          <p
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "13.5px",
              fontWeight: 400,
              marginTop: "12px",
              letterSpacing: "0.02em",
            }}
          >
            Serving Humanity · Dhari, Gujarat, India
          </p>
        </section>

        {/* RIGHT SIGN IN HALF (52% width): Centered floating card over cream */}
        <section
          aria-label="Sign In"
          style={{ width: "52%", height: "100%" }}
          className="relative z-10 flex items-center justify-center p-6 xl:p-10 overflow-y-auto no-scrollbar"
        >
          <div style={{ transform: "translateX(-16px)" }} className="w-full flex justify-center">
            <LoginForm />
          </div>
        </section>
      </div>

      {/* =========================================================================
          MOBILE / TABLET LAYOUT (< 1024px): Top Navy Banner + Wave + Card
          ========================================================================= */}
      <div
        style={{ backgroundColor: "#FAF5EB" }}
        className="lg:hidden flex flex-col min-h-screen w-full"
      >
        {/* Top Navy Section with Branding and Curved Golden Wave */}
        <div
          style={{
            backgroundColor: "#0B2A5B",
            backgroundImage: "radial-gradient(ellipse at top, #123B7C 0%, #0B2A5B 60%, #041533 100%)",
          }}
          className="relative w-full pt-10 pb-20 px-4 text-center overflow-hidden"
        >
          {/* Bottom Curved Golden Wave to Cream */}
          <div className="absolute -bottom-[1px] left-0 w-full overflow-hidden leading-none z-0">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative block w-full h-[54px] sm:h-[70px]"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="mobileGoldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9971C" />
                  <stop offset="35%" stopColor="#F7E6A9" />
                  <stop offset="70%" stopColor="#E2B544" />
                  <stop offset="100%" stopColor="#C9971C" />
                </linearGradient>
              </defs>
              <path
                d="M0,45 Q720,115 1440,45 L1440,120 L0,120 Z"
                fill="#FAF5EB"
              />
              <path
                d="M0,45 Q720,115 1440,45"
                stroke="url(#mobileGoldRibbon)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Content inside top banner */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <div className="relative shrink-0">
              <Image
                src="/logo.png"
                alt="Haji Mohamed Yunus Valibhoy Community Centre logo"
                width={150}
                height={150}
                unoptimized
                priority
                className="rounded-full object-contain select-none"
                style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.35))" }}
              />
            </div>

            {/* Title */}
            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "22px",
                fontWeight: 800,
                lineHeight: 1.25,
                marginTop: "16px",
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              <span>Haji Mohamed Yunus Valibhoy</span>
              <br />
              <span>Community Centre</span>
            </h1>

            {/* Diamond Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "180px",
                margin: "12px 0",
              }}
              aria-hidden="true"
            >
              <div style={{ flex: 1, height: "1px", backgroundColor: "#E2B544" }} />
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  backgroundColor: "#E2B544",
                  transform: "rotate(45deg)",
                  margin: "0 8px",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, height: "1px", backgroundColor: "#E2B544" }} />
            </div>

            {/* Gujarati Title */}
            <h2
              lang="gu"
              style={{
                color: "#F5C444",
                fontSize: "18px",
                fontWeight: 700,
                lineHeight: 1.3,
                fontFamily: "var(--font-gujarati), 'Noto Sans Gujarati', sans-serif",
              }}
            >
              <span>હાજી મોહમ્મદ યુનુસ વલીભોય</span>
              <br />
              <span>કોમ્યુનિટી સેન્ટર</span>
            </h2>

            {/* Motto */}
            <p
              style={{
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "12px",
                marginTop: "8px",
              }}
            >
              Serving Humanity · Dhari, Gujarat, India
            </p>
          </div>
        </div>

        {/* Card Section on Mobile */}
        <div className="relative -mt-10 px-4 pb-12 flex items-center justify-center z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
