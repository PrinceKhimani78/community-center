import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login · Haji Mohamed Yunus Valibhoy Community Centre",
  description: "Community Centre Management System - Dhari, Gujarat, India",
};

const PILL_CHIPS = [
  "Bookings & Calendar",
  "Payments & Deposits",
  "Maintenance & Inspection",
  "Attendance & Reports",
];

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen lg:h-screen lg:overflow-hidden bg-cream overflow-x-hidden font-sans">
      {/* =========================================================================
          DESKTOP LAYOUT (>= 1024px): Two Columns (50/50), Full Viewport Height
          ========================================================================= */}
      <div className="hidden lg:flex h-full w-full overflow-hidden">
        {/* LEFT PANEL (50% width): Navy background, 6px light-gold right border */}
        <section
          aria-label="Community Centre Information"
          className="w-1/2 h-full bg-navy border-r-[6px] border-light-gold flex flex-col items-center justify-center p-6 xl:p-10 2xl:p-14 text-center select-none overflow-y-auto no-scrollbar"
        >
          {/* 1. Logo, round, soft shadow, responsive dimensions */}
          <div className="relative w-[150px] h-[150px] xl:w-[185px] xl:h-[185px] 2xl:w-[210px] 2xl:h-[210px] shrink-0">
            <Image
              src="/logo.png"
              alt="Haji Mohamed Yunus Valibhoy Community Centre logo"
              fill
              sizes="(max-width: 1280px) 150px, (max-width: 1536px) 185px, 210px"
              className="rounded-full object-contain shadow-[0_12px_40px_rgba(0,0,0,0.3)] select-none"
              priority
            />
          </div>

          {/* 2. Heading, white, bold, two lines */}
          <h1 className="text-white text-[24px] xl:text-[28px] 2xl:text-[32px] font-bold leading-[1.25] mt-4 xl:mt-5 tracking-tight font-poppins">
            <span>Haji Mohamed Yunus Valibhoy</span>
            <br />
            <span>Community Centre</span>
          </h1>

          {/* 3. Ornament divider: gold line - small rotated gold diamond (10px) - gold line */}
          <div className="flex items-center justify-center w-[220px] xl:w-[260px] my-3 xl:my-4" aria-hidden="true">
            <div className="flex-1 h-[1.5px] bg-gold" />
            <div className="w-[9px] h-[9px] bg-gold rotate-45 mx-3 shrink-0" />
            <div className="flex-1 h-[1.5px] bg-gold" />
          </div>

          {/* 4. Gujarati name, pale-gold, bold, two lines */}
          <h2
            lang="gu"
            className="text-pale-gold text-[19px] xl:text-[22px] 2xl:text-[25px] font-bold leading-[1.3] tracking-wide font-gujarati"
          >
            <span>હાજી મોહમ્મદ યુનુસ વલીભોય</span>
            <br />
            <span>કોમ્યુનિટી સેન્ટર</span>
          </h2>

          {/* 5. Subtitle in #D6DEEB */}
          <p className="text-[#D6DEEB] text-[13px] xl:text-[14.5px] font-normal mt-2 xl:mt-2.5 tracking-wide">
            Serving Humanity · Dhari, Gujarat, India
          </p>

          {/* 6. Four pill chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 xl:gap-2.5 max-w-[460px] mt-4 xl:mt-6">
            {PILL_CHIPS.map((chip) => (
              <span
                key={chip}
                className="px-3.5 py-1 xl:px-4 xl:py-1.5 text-[12px] xl:text-[13px] font-medium text-pale-gold border border-[rgba(226,181,68,0.5)] bg-[rgba(244,207,106,0.05)] rounded-full transition-all duration-200 hover:bg-[rgba(244,207,106,0.12)] cursor-default select-none"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>

        {/* RIGHT PANEL (50% width): Cream background, centered sign-in card */}
        <section
          aria-label="Sign In"
          className="w-1/2 h-full bg-cream flex items-center justify-center p-6 xl:p-10 overflow-y-auto no-scrollbar"
        >
          <LoginForm hideCardBorderOnMobile={false} />
        </section>
      </div>

      {/* =========================================================================
          MOBILE / TABLET LAYOUT (< 1024px): Single Column, Wave Banner
          ========================================================================= */}
      <div className="lg:hidden flex flex-col min-h-screen w-full bg-cream">
        {/* Top: navy band about 230px tall with curved SVG wave in cream + 4px light-gold stroke */}
        <div className="relative w-full h-[230px] bg-navy flex items-start justify-center overflow-hidden">
          {/* Subtle radial sheen */}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Curved SVG Wave along the bottom */}
          <div className="absolute -bottom-[1px] left-0 w-full overflow-hidden leading-none z-0">
            <svg
              viewBox="0 0 1440 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative block w-full h-[60px]"
              preserveAspectRatio="none"
            >
              {/* Cream fill below curve */}
              <path
                d="M0,35 Q720,105 1440,35 L1440,100 L0,100 Z"
                fill="#FBF6EC"
              />
              {/* 4px light-gold stroke along the curve */}
              <path
                d="M0,35 Q720,105 1440,35"
                stroke="#E2B544"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Logo 168px overlapping the navy band (pulled up across the curve), with shadow */}
        <div className="relative -mt-[84px] z-10 mx-auto w-[168px] h-[168px] shrink-0">
          <Image
            src="/logo.png"
            alt="Haji Mohamed Yunus Valibhoy Community Centre logo"
            width={168}
            height={168}
            className="rounded-full object-contain shadow-[0_12px_36px_rgba(0,0,0,0.25)] select-none"
            priority
          />
        </div>

        {/* Brand identity on cream */}
        <div className="px-4 text-center mt-3 select-none">
          {/* English name (navy, 22px bold, centred) */}
          <h1 className="text-navy text-[19px] sm:text-[22px] font-bold leading-tight font-poppins break-normal">
            <span className="block">Haji Mohamed Yunus Valibhoy</span>
            <span className="block mt-0.5">Community Centre</span>
          </h1>

          {/* Gold diamond divider (220px) */}
          <div className="flex items-center justify-center w-[220px] max-w-[85%] mx-auto my-3" aria-hidden="true">
            <div className="flex-1 h-[1.5px] bg-gold" />
            <div className="w-[8px] h-[8px] bg-gold rotate-45 mx-2.5 shrink-0" />
            <div className="flex-1 h-[1.5px] bg-gold" />
          </div>

          {/* Gujarati name (navy, 18px bold) */}
          <h2
            lang="gu"
            className="text-navy text-[17px] sm:text-[18px] font-bold leading-normal font-gujarati"
          >
            <span className="block">હાજી મોહમ્મદ યુનુસ વલીભોય</span>
            <span className="block">કોમ્યુનિટી સેન્ટર</span>
          </h2>
        </div>

        {/* Sign In Form (without card border, 24px side padding, 52px inputs) */}
        <div className="w-full px-6 mt-6 pb-2">
          <LoginForm hideCardBorderOnMobile={true} />
        </div>

        {/* Mobile Footer: Secure login + Serving Humanity */}
        <footer className="mt-auto pt-6 pb-8 px-6 text-center flex flex-col items-center gap-1.5 select-none">
          <div className="flex items-center justify-center gap-1.5 text-muted text-[12px] font-medium">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
            <span>Secure login · Role-based access</span>
          </div>
          <p className="text-muted text-[12px] font-normal">
            Serving Humanity · Dhari, Gujarat, India
          </p>
        </footer>
      </div>
    </div>
  );
}
