"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import StatusBadge from "@/components/common/StatusBadge";

export default function AttendancePage() {
  const { myAttendance, toggleMyCheckIn, staffAttendance } = useDashboard();
  const [clockText, setClockText] = useState("01:38 PM");

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

  const counts = useMemo(() => {
    const present = staffAttendance.filter((s) => s.status === "Present").length;
    const late = staffAttendance.filter((s) => s.status === "Late").length;
    const absent = staffAttendance.filter((s) => s.status === "Absent").length;
    const totalStaff = staffAttendance.length;
    const avgPct =
      totalStaff > 0 ? Math.round(((present + late) / totalStaff) * 100) : 0;
    const totalLateMonth = staffAttendance.reduce(
      (sum, s) => sum + (s.lateDays || 0),
      0
    );
    return { present, late, absent, avgPct, totalLateMonth };
  }, [staffAttendance]);

  return (
    <PageShell hideHeader>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] font-medium text-[#5B6474]">
            Facility · GPS check-in & check-out
          </div>
          <h1 style={{ color: "#0B2A5B", fontSize: "23px", fontWeight: 700 }}>
            Attendance
          </h1>
        </div>

        {/* TOP 2-COLUMN LAYOUT (matches 4.16) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT 5 COLS — MY ATTENDANCE + GEO-FENCE MAP */}
          <section className="lg:col-span-5 bg-white rounded-2xl border border-[#EFE4CC] p-5 flex flex-col justify-between gap-4 shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                  My Attendance
                </h2>
                <span className="text-[12.5px] font-medium text-[#5B6474]">Tue, 20 Oct</span>
              </div>

              <div className="notranslate text-[34px] font-extrabold text-[#0B2A5B] tracking-tight leading-none">
                {clockText}
              </div>

              {/* Stylized Geo-fence Map Preview */}
              <div className="relative h-44 rounded-2xl bg-[#EEF2EB] border border-[#D5DEC8] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-2 pointer-events-none opacity-45">
                  <div className="bg-white/80 rounded-lg" />
                  <div className="bg-white/80 rounded-lg" />
                  <div className="bg-white/80 rounded-lg" />
                  <div className="bg-white/80 rounded-lg" />
                  <div className="bg-white/80 rounded-lg" />
                  <div className="bg-white/80 rounded-lg" />
                  <div className="bg-white/80 rounded-lg" />
                  <div className="bg-white/80 rounded-lg" />
                  <div className="bg-white/80 rounded-lg" />
                </div>

                {/* 100m Geo-fence Circle */}
                <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#15803D] bg-[#15803D]/10 flex items-center justify-center">
                  <div className="w-10 h-7 rounded-md bg-[#0B2A5B] shadow-sm relative">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E2B544] border-2 border-white absolute -right-1.5 -bottom-1.5" />
                  </div>
                </div>

                <div className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-lg bg-white/95 border border-[#D5DEC8] text-[11.5px] font-bold text-[#0B2A5B] shadow-2xs">
                  Geo-fence: 100 m around centre
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] text-[#15803D] text-[12.5px] font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Location verified · 45 m from centre</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]">
                  <div className="text-[11.5px] text-[#5B6474]">Check-in</div>
                  <div className="notranslate text-[16px] font-bold text-[#0B2A5B] mt-0.5">
                    {myAttendance.checkInTime || "Not yet"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]">
                  <div className="text-[11.5px] text-[#5B6474]">Check-out</div>
                  <div className="notranslate text-[16px] font-bold text-[#0B2A5B] mt-0.5">
                    {myAttendance.checkOutTime || "—"}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMyCheckIn}
              style={{
                minHeight: "48px",
                background: myAttendance.checkedIn ? "#C62828" : "#0B2A5B",
                color: "#FFFFFF",
                borderRadius: "12px",
              }}
              className="interactive-btn w-full text-[14.5px] font-bold cursor-pointer"
            >
              {myAttendance.checkedIn ? "Check Out" : "Check In"}
            </button>
          </section>

          {/* RIGHT 7 COLS — STAFF TODAY TABLE */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-[#EFE4CC] p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 style={{ color: "#0B2A5B", fontSize: "16.5px", fontWeight: 700 }}>
                Staff Today
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold">
                <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D]">
                  {counts.present} Present
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E]">
                  {counts.late} Late
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#C62828]">
                  {counts.absent} Absent
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px] text-[13.5px]">
                <thead>
                  <tr className="border-b border-[#F1ECE1] text-[12px] text-[#5B6474]">
                    <th className="py-2.5 pr-3 font-semibold">Staff</th>
                    <th className="py-2.5 px-3 font-semibold">Check-in</th>
                    <th className="py-2.5 px-3 font-semibold">Check-out</th>
                    <th className="py-2.5 px-3 font-semibold">Geo</th>
                    <th className="py-2.5 pl-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1ECE1]">
                  {staffAttendance.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 pr-3">
                        <div className="font-bold text-[#0B2A5B]">{s.name}</div>
                        <div className="text-[12px] text-[#5B6474]">{s.roleTitle}</div>
                      </td>
                      <td className="notranslate py-3 px-3 text-[#14213D] font-medium">
                        {s.checkInTime}
                      </td>
                      <td className="notranslate py-3 px-3 text-[#5B6474]">
                        {s.checkOutTime}
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        {s.geoVerified ? (
                          <span className="text-[#15803D]">Verified</span>
                        ) : (
                          <span className="text-[#5B6474]">—</span>
                        )}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* BOTTOM MONTHLY SUMMARY STRIP (matches 4.16) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
            <div className="text-[12px] font-medium text-[#5B6474]">
              October · Working Days
            </div>
            <div className="text-[26px] font-extrabold text-[#0B2A5B] mt-1">17</div>
          </div>

          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
            <div className="text-[12px] font-medium text-[#5B6474]">Average Attendance</div>
            <div className="text-[26px] font-extrabold text-[#15803D] mt-1">
              {counts.avgPct}%
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5">
            <div className="text-[12px] font-medium text-[#5B6474]">Late Check-ins</div>
            <div className="text-[26px] font-extrabold text-[#8A6510] mt-1">
              {counts.totalLateMonth}
            </div>
          </div>

          <Link
            href="/reports"
            style={{
              background: "linear-gradient(155deg, #071E47 0%, #0B2A5B 100%)",
              borderRadius: "16px",
              color: "#FFFFFF",
            }}
            className="interactive-card p-4 sm:p-5 flex flex-col justify-between col-span-2 lg:col-span-1 shadow-md"
          >
            <div className="text-[12px] text-white/80 font-medium">
              Attendance Summary Report
            </div>
            <div className="text-[16px] font-bold text-[#F4CF6A] inline-flex items-center gap-1.5 mt-2">
              <span>Export PDF / Excel</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
