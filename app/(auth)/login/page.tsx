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
      style={{ backgroundColor: "#FAF6EF" }}
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
                <stop offset="0%" stopColor="#041738" />
                <stop offset="35%" stopColor="#08255B" />
                <stop offset="70%" stopColor="#0B2A5B" />
                <stop offset="100%" stopColor="#021028" />
              </linearGradient>

              {/* Metallic Gold Ribbon Gradient */}
              <linearGradient id="goldRibbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="20%" stopColor="#F7E6A9" />
                <stop offset="45%" stopColor="#E2B544" />
                <stop offset="70%" stopColor="#FFECA6" />
                <stop offset="90%" stopColor="#C9971C" />
                <stop offset="100%" stopColor="#966B12" />
              </linearGradient>

              {/* Bright Center Highlight for Gold Ribbon */}
              <linearGradient id="goldCenterHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF7D6" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFEBB0" />
              </linearGradient>

              {/* Soft Cream Right Side Gradient */}
              <linearGradient id="creamBgGradient" x1="50%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCF9F2" />
                <stop offset="50%" stopColor="#FAF5EB" />
                <stop offset="100%" stopColor="#F4EDE0" />
              </linearGradient>

              {/* Bottom-left Silky Navy Sheen */}
              <linearGradient id="bottomLeftSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14468E" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#0A2D6C" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#03122E" stopOpacity="0" />
              </linearGradient>

              {/* Top-right Soft Gold Flares */}
              <linearGradient id="topRightFlare" x1="100%" y1="0%" x2="50%" y2="50%">
                <stop offset="0%" stopColor="#EAD8B5" stopOpacity="0.5" />
                <stop offset="40%" stopColor="#F5EBD7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FAF6EF" stopOpacity="0" />
              </linearGradient>

              {/* Drop Shadows */}
              <filter id="ribbonShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="8" dy="2" stdDeviation="10" floodColor="#805B0D" floodOpacity="0.25" />
              </filter>
              <filter id="navyWaveShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="12" dy="0" stdDeviation="16" floodColor="#000000" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* 1. Base Cream Canvas */}
            <rect width="1440" height="900" fill="url(#creamBgGradient)" />

            {/* 2. Top-right Subtle Golden Fluid Waves */}
            <path
              d="M1020,0 C1160,60 1320,180 1440,320 L1440,0 Z"
              fill="url(#topRightFlare)"
            />
            <path
              d="M1100,0 C1220,70 1350,170 1440,280"
              stroke="#DEC797"
              strokeWidth="2.5"
              strokeOpacity="0.4"
              fill="none"
            />
            <path
              d="M1180,0 C1280,60 1380,140 1440,210"
              stroke="#E9D5AA"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              fill="none"
            />

            {/* 3. Left Navy Area with Perfectly Positioned S-Curve Edge */}
            <g filter="url(#navyWaveShadow)">
              <path
                d="M0,0 L675,0 C685,90 735,170 750,260 C768,360 720,470 675,580 C640,680 670,790 705,900 L0,900 Z"
                fill="url(#navyBgGradient)"
              />
            </g>

            {/* 4. Bottom-left Silk Light Wave Accents */}
            <path
              d="M0,640 C170,700 340,790 480,900 L0,900 Z"
              fill="url(#bottomLeftSheen)"
            />
            <path
              d="M0,640 C170,700 340,790 480,900"
              stroke="#E2B544"
              strokeWidth="1.5"
              strokeOpacity="0.3"
              fill="none"
            />
            <path
              d="M0,740 C140,780 270,840 370,900"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeOpacity="0.25"
              fill="none"
            />

            {/* 5. Main Flowing Golden Ribbon (The dividing wave) */}
            <path
              d="M675,0 C685,90 735,170 750,260 C768,360 720,470 675,580 C640,680 670,790 705,900"
              stroke="#8A6510"
              strokeWidth="18"
              strokeLinecap="round"
              strokeOpacity="0.3"
              filter="url(#ribbonShadow)"
              fill="none"
            />

            <path
              d="M675,0 C685,90 735,170 750,260 C768,360 720,470 675,580 C640,680 670,790 705,900"
              stroke="url(#goldRibbonGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />

            <path
              d="M675,0 C685,90 735,170 750,260 C768,360 720,470 675,580 C640,680 670,790 705,900"
              stroke="url(#goldCenterHighlight)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeOpacity="0.9"
              fill="none"
            />

            <path
              d="M688,0 C698,90 749,170 764,260 C782,360 734,470 689,580 C654,680 684,790 719,900"
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
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(226,181,68,0.2) 0%, transparent 70%)",
                position: "absolute",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
            <Image
              src="/logo.png"
              alt="Haji Mohamed Yunus Valibhoy Community Centre logo"
              width={200}
              height={200}
              unoptimized
              priority
              className="rounded-full object-contain select-none"
              style={{ filter: "drop-shadow(0 14px 32px rgba(0,0,0,0.38))" }}
            />
          </div>

          {/* Heading: Haji Mohamed Yunus Valibhoy Community Centre */}
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "28px",
              fontWeight: 700,
              lineHeight: 1.25,
              marginTop: "22px",
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
            className="tracking-tight"
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
              width: "230px",
              margin: "14px 0",
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
              color: "#E2B544",
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: 1.3,
              fontFamily: "var(--font-gujarati), 'Noto Sans Gujarati', sans-serif",
            }}
            className="tracking-wide"
          >
            <span>હાજી મોહમ્મદ યુનુસ વલીભોય</span>
            <br />
            <span>કોમ્યુનિટી સેન્ટર</span>
          </h2>

          {/* Subtitle: Serving Humanity · Dhari, Gujarat, India */}
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "14px",
              fontWeight: 400,
              marginTop: "10px",
            }}
            className="tracking-wide"
          >
            Serving Humanity · Dhari, Gujarat, India
          </p>
        </section>

        {/* RIGHT SIGN IN HALF (52% width): Centered floating card over cream */}
        <section
          aria-label="Sign In"
          style={{ width: "52%", height: "100%" }}
          className="relative z-10 flex items-center justify-center p-8 xl:p-12 overflow-y-auto no-scrollbar"
        >
          <LoginForm />
        </section>
      </div>

      {/* =========================================================================
          MOBILE / TABLET LAYOUT (< 1024px): Top Navy Banner + Wave + Card
          ========================================================================= */}
      <div
        style={{ backgroundColor: "#FAF6EF" }}
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
                fill="#FAF6EF"
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

            {/* English Name */}
            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: 1.25,
                marginTop: "14px",
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              <span>Haji Mohamed Yunus Valibhoy</span>
              <br />
              <span>Community Centre</span>
            </h1>

            {/* Gold Diamond Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "180px",
                margin: "10px 0",
              }}
              aria-hidden="true"
            >
              <div style={{ flex: 1, height: "1.5px", backgroundColor: "#E2B544" }} />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#E2B544",
                  transform: "rotate(45deg)",
                  margin: "0 8px",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, height: "1.5px", backgroundColor: "#E2B544" }} />
            </div>

            {/* Gujarati Name */}
            <h2
              lang="gu"
              style={{
                color: "#E2B544",
                fontSize: "17px",
                fontWeight: 700,
                lineHeight: 1.3,
                fontFamily: "var(--font-gujarati), 'Noto Sans Gujarati', sans-serif",
              }}
            >
              <span>હાજી મોહમ્મદ યુનુસ વલીભોય</span>
              <br />
              <span>કોમ્યુનિટી સેન્ટર</span>
            </h2>

            {/* Subtitle */}
            <p
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "12.5px",
                fontWeight: 400,
                marginTop: "6px",
                marginBottom: "28px",
              }}
            >
              Serving Humanity · Dhari, Gujarat, India
            </p>
          </div>
        </div>

        {/* Floating Sign In Card on Cream */}
        <div className="w-full px-4 sm:px-6 -mt-3 sm:-mt-4 pb-12 flex items-center justify-center z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
