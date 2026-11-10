"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Users, BarChart3, CheckCircle2, Clock } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import StatusBadge from "@/components/common/StatusBadge";

type AttendanceTab = "mine" | "today" | "monthly";

export default function AttendancePage() {
  const { myAttendance, toggleMyCheckIn, staffAttendance } = useDashboard();
  const [activeTab, setActiveTab] = useState<AttendanceTab>("mine");
  const [clockText, setClockText] = useState("03:20 PM");

  useEffect(() => {
    const updateClock = () => {
      setClockText(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const tabs: TabItem<AttendanceTab>[] = [
    { id: "mine", label: "My Check-In", icon: MapPin },
    { id: "today", label: "Staff Today", icon: Users, count: staffAttendance.length },
    { id: "monthly", label: "Monthly Summary", icon: BarChart3 },
  ];

  return (
    <PageShell
      title="Staff Attendance"
      subtitle="Simple one-tap check-in and daily staff list."
    >
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Attendance tabs"
      />

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "mine" && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid rgba(226, 181, 68, 0.4)",
              borderRadius: "20px",
              padding: "28px 24px",
              maxWidth: "560px",
            }}
            className="mx-auto text-center space-y-5 shadow-sm"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12.5px] font-semibold">
              <MapPin className="w-4 h-4" />
              <span>Location Verified · At Community Centre (within 100m)</span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-[#5B6474] text-[13px] font-medium">
                <Clock className="w-4 h-4 text-[#C9971C]" />
                <span>Current Time</span>
              </div>
              <div className="text-[38px] font-extrabold text-[#0B2A5B] mt-1 tracking-tight">
                {clockText}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]">
                <div className="text-[12px] text-[#5B6474]">Check-In Time</div>
                <div className="text-[16px] font-bold text-[#0B2A5B] mt-0.5">
                  {myAttendance.checkInTime || "Not yet"}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]">
                <div className="text-[12px] text-[#5B6474]">Check-Out Time</div>
                <div className="text-[16px] font-bold text-[#0B2A5B] mt-0.5">
                  {myAttendance.checkOutTime || "—"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMyCheckIn}
              style={{
                minHeight: "52px",
                background: myAttendance.checkedIn
                  ? "linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)"
                  : "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                border: "1.5px solid #E2B544",
                color: "#FFFFFF",
                borderRadius: "14px",
              }}
              className="interactive-btn w-full text-[16px] font-bold cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{myAttendance.checkedIn ? "Check Out Now" : "Check In Now"}</span>
            </button>
          </div>
        )}

        {activeTab === "today" && (
          <div className="space-y-3">
            {staffAttendance.map((s) => (
              <div
                key={s.id}
                className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-[#0B2A5B] text-[15px]">{s.name}</div>
                  <div className="text-[13px] text-[#5B6474]">
                    {s.roleTitle} · In: {s.checkInTime} ·{" "}
                    {s.geoVerified ? "Location OK" : "No GPS"}
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}

        {activeTab === "monthly" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staffAttendance.map((s) => (
              <div
                key={s.id}
                className="interactive-card bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-2"
              >
                <div className="font-bold text-[#0B2A5B] text-[15.5px]">{s.name}</div>
                <div className="text-[13px] text-[#5B6474]">{s.roleTitle}</div>
                <div className="flex gap-4 pt-2 text-[13.5px] font-semibold">
                  <span className="text-[#15803D]">Present: 18 days</span>
                  <span className="text-[#92400E]">Late: 1</span>
                  <span className="text-[#C62828]">Absent: 1</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
