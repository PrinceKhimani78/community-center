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
    <div className="w-full min-h-screen bg-cream overflow-x-hidden font-sans">
      {/* =========================================================================
          DESKTOP LAYOUT (>= 1024px): Two Columns, Full Viewport Height
          ========================================================================= */}
      <div className="hidden lg:flex min-h-screen w-full">
        {/* LEFT PANEL (~55% width): Navy background, 6px light-gold right border */}
        <section
          aria-label="Community Centre Information"
          className="w-[55%] min-h-screen bg-navy border-r-[6px] border-light-gold flex flex-col items-center justify-center p-10 xl:p-14 text-center select-none"
        >
          {/* 1. Logo 220x220, round, soft shadow (0 12px 40px rgba(0,0,0,0.3)), NO border or ring */}
          <div className="relative w-[220px] h-[220px] shrink-0">
            <Image
              src="/logo.png"
              alt="Haji Mohamed Yunus Valibhoy Community Centre logo"
              width={220}
              height={220}
              className="rounded-full object-contain shadow-[0_12px_40px_rgba(0,0,0,0.3)] select-none"
              priority
            />
          </div>

          {/* 2. Heading, white, 34px bold, two lines */}
          <h1 className="text-white text-[34px] font-bold leading-[1.25] mt-6 tracking-tight font-poppins">
            <span>Haji Mohamed Yunus Valibhoy</span>
            <br />
            <span>Community Centre</span>
          </h1>

          {/* 3. Ornament divider 280px wide: gold line - small rotated gold diamond (10px) - gold line */}
          <div className="flex items-center justify-center w-[280px] my-5" aria-hidden="true">
            <div className="flex-1 h-[1.5px] bg-gold" />
            <div className="w-[10px] h-[10px] bg-gold rotate-45 mx-3 shrink-0" />
            <div className="flex-1 h-[1.5px] bg-gold" />
          </div>

          {/* 4. Gujarati name, pale-gold, 26px bold, two lines */}
          <h2
            lang="gu"
            className="text-pale-gold text-[26px] font-bold leading-[1.35] tracking-wide font-gujarati"
          >
            <span>હાજી મોહમ્મદ યુનુસ વલીભોય</span>
            <br />
            <span>કોમ્યુનિટી સેન્ટર</span>
          </h2>

          {/* 5. Subtitle in #D6DEEB, 15px */}
          <p className="text-[#D6DEEB] text-[15px] font-normal mt-3 tracking-wide">
            Serving Humanity · Dhari, Gujarat, India
          </p>

          {/* 6. Four pill chips (13px, pale-gold text, 1px border rgba(226,181,68,0.5), fully rounded) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-[480px] mt-8">
            {PILL_CHIPS.map((chip) => (
              <span
                key={chip}
                className="px-4 py-1.5 text-[13px] font-medium text-pale-gold border border-[rgba(226,181,68,0.5)] bg-[rgba(244,207,106,0.05)] rounded-full transition-all duration-200 hover:bg-[rgba(244,207,106,0.12)] cursor-default select-none"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>

        {/* RIGHT PANEL (~45% width): Cream background, centered sign-in card */}
        <section
          aria-label="Sign In"
          className="w-[45%] min-h-screen bg-cream flex items-center justify-center p-8 xl:p-12"
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
