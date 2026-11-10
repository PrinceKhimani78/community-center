"use client";

import React, { useState } from "react";
import { CalendarDays, Wallet, ClipboardCheck, MapPin } from "lucide-react";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";

type HelpTab = "booking" | "money" | "check" | "attendance";

const GUIDE_CONTENT: Record<HelpTab, { title: string; steps: string[] }> = {
  booking: {
    title: "How to Make a New Hall Booking",
    steps: [
      "1. Click Bookings on the left menu, then click the New Booking tab.",
      "2. Pick an existing person or tap + New Person to enter their name and mobile number.",
      "3. Pick the Event Type, Hall (Ground Floor or Ground + First Floor), and Date.",
      "4. Enter Rent, Deposit, and Advance Paid today, then tap Save Booking.",
    ],
  },
  money: {
    title: "How to Collect Money & Print a Receipt",
    steps: [
      "1. Click Payments on the left menu (stay on the Collect Money tab).",
      "2. Pick the person's booking from the list — balance left fills in automatically.",
      "3. Choose Cash, UPI, Bank Transfer, or Cheque, then tap Save Payment & Make Receipt.",
      "4. Click Print Receipt to open and print the official receipt.",
    ],
  },
  check: {
    title: "How to Do Hall Check (Before & After Event)",
    steps: [
      "1. Click Maintenance on the left menu, then tap the Hall Check tab.",
      "2. Choose Before Event or After Event at the top.",
      "3. Tap OK or Issue for each of the 7 simple hall items (Chairs, Lights, A.C., Sound, Washrooms, Kitchen, Floors).",
      "4. Tap Save Hall Check when finished.",
    ],
  },
  attendance: {
    title: "How to Mark Daily Attendance",
    steps: [
      "1. Click Attendance on the left menu.",
      "2. Make sure Location Verified shows green (within 100m of the Centre).",
      "3. Tap the big Check In Now button when arriving, and Check Out Now when leaving.",
    ],
  },
};

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<HelpTab>("booking");

  const tabs: TabItem<HelpTab>[] = [
    { id: "booking", label: "Book a Hall", icon: CalendarDays },
    { id: "money", label: "Collect Money", icon: Wallet },
    { id: "check", label: "Hall Check", icon: ClipboardCheck },
    { id: "attendance", label: "Attendance", icon: MapPin },
  ];

  const guide = GUIDE_CONTENT[activeTab];

  return (
    <PageShell
      title="Easy Help & Guide"
      subtitle="Step-by-step instructions in simple words."
    >
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Help topics" />

      <div
        key={activeTab}
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid rgba(226, 181, 68, 0.35)",
          borderRadius: "20px",
          padding: "26px",
        }}
        className="animate-tab-enter space-y-4 max-w-2xl"
      >
        <h2 style={{ color: "#0B2A5B", fontSize: "19px", fontWeight: 700 }}>{guide.title}</h2>
        <div className="space-y-3">
          {guide.steps.map((step) => (
            <div
              key={step}
              className="interactive-row p-4 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC] text-[14.5px] font-medium text-[#14213D]"
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

