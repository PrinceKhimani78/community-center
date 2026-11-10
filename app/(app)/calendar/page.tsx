"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, List, Wrench, CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import StatusBadge from "@/components/common/StatusBadge";

type CalendarTab = "month" | "list" | "block";

const DAYS_OCT_2026 = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const iso = `2026-10-${String(day).padStart(2, "0")}`;
  return { day, iso };
});

export default function CalendarPage() {
  const { bookings, tickets, addMaintenanceTicket } = useDashboard();
  const [activeTab, setActiveTab] = useState<CalendarTab>("month");
  const [selectedDateISO, setSelectedDateISO] = useState("2026-10-20");
  const [hallFilter, setHallFilter] = useState("All");

  // Block form state
  const [blockLocation, setBlockLocation] = useState("First Floor Hall");
  const [blockDateISO, setBlockDateISO] = useState("2026-10-26");
  const [blockReason, setBlockReason] = useState("");
  const [blockSaved, setBlockSaved] = useState(false);

  const tabs: TabItem<CalendarTab>[] = [
    { id: "month", label: "Month View", icon: CalendarIcon },
    { id: "list", label: "Schedule List", icon: List, count: bookings.length },
    { id: "block", label: "Block for Repair", icon: Wrench },
  ];

  const getEventsForDate = (iso: string) => {
    const dayBookings = bookings.filter((b) => {
      const matchesHall = hallFilter === "All" || b.hall === hallFilter;
      const matchesDate = b.dateISO === iso || b.endDateISO === iso;
      return matchesHall && matchesDate;
    });
    const dayBlocks = tickets.filter((t) => t.blockHall && t.blockDateISO === iso);
    return { dayBookings, dayBlocks };
  };

  const selectedData = getEventsForDate(selectedDateISO);

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    addMaintenanceTicket({
      title: blockReason.trim() || `Maintenance block — ${blockLocation}`,
      category: "AC / Fans",
      location: blockLocation,
      priority: "Normal",
      estimatedCost: 0,
      blockHall: true,
      blockDateISO,
    });
    setBlockReason("");
    setBlockSaved(true);
    setSelectedDateISO(blockDateISO);
  };

  return (
    <PageShell
      title="Calendar — October 2026"
      subtitle="Tap any day to see who booked the hall."
    >
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Calendar views" />

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "month" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Month Grid */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid rgba(226, 181, 68, 0.35)",
                borderRadius: "18px",
                padding: "20px",
              }}
              className="lg:col-span-8 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {["All", "Ground Floor", "Ground + First Floor", "Garden Lawn"].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHallFilter(h)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all ${
                        hallFilter === h
                          ? "bg-[#0B2A5B] text-white"
                          : "bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC] hover:border-[#E2B544]"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekday Headers (Oct 1, 2026 is Thursday -> offset 4 empty slots Sun-Wed) */}
              <div className="grid grid-cols-7 gap-2 text-center text-[11.5px] font-bold text-[#5B6474] pt-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {[0, 1, 2, 3].map((empty) => (
                  <div key={`empty-${empty}`} className="h-16 sm:h-20 rounded-xl bg-[#FAF7F2]/50" />
                ))}
                {DAYS_OCT_2026.map(({ day, iso }) => {
                  const { dayBookings, dayBlocks } = getEventsForDate(iso);
                  const isSelected = selectedDateISO === iso;
                  const isToday = iso === "2026-10-20";

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setSelectedDateISO(iso)}
                      style={{
                        border: isSelected
                          ? "2px solid #0B2A5B"
                          : isToday
                          ? "1.5px solid #E2B544"
                          : "1px solid #EFE4CC",
                        backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                      }}
                      className="h-16 sm:h-20 rounded-xl p-1.5 flex flex-col justify-between text-left cursor-pointer hover:border-[#E2B544] hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[12.5px] font-bold ${
                            isToday ? "text-[#C9971C]" : "text-[#0B2A5B]"
                          }`}
                        >
                          {day}
                        </span>
                        {(dayBookings.length > 0 || dayBlocks.length > 0) && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayBookings.slice(0, 1).map((b) => (
                          <div
                            key={b.id}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] truncate"
                          >
                            {b.eventTitle}
                          </div>
                        ))}
                        {dayBlocks.slice(0, 1).map((t) => (
                          <div
                            key={t.id}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F3E8FF] text-[#6D28D9] truncate"
                          >
                            Repair
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Simple Color Legend */}
              <div className="flex flex-wrap gap-4 pt-2 text-[12px] text-[#5B6474] border-t border-[#F1ECE1]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" /> Booked Event
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6D28D9]" /> Blocked for Repair
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E2B544]" /> Today (20 Oct)
                </span>
              </div>
            </div>

            {/* Selected Day Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid rgba(226, 181, 68, 0.35)",
                borderRadius: "18px",
                padding: "20px",
              }}
              className="lg:col-span-4 space-y-4"
            >
              <h2 style={{ color: "#0B2A5B", fontSize: "16px", fontWeight: 700 }}>
                Events on {selectedDateISO}
              </h2>

              {selectedData.dayBookings.length === 0 && selectedData.dayBlocks.length === 0 ? (
                <div className="p-5 rounded-xl bg-[#FAF7F2] text-center space-y-3">
                  <p className="text-[13.5px] text-[#5B6474]">
                    All halls are free on this date.
                  </p>
                  <Link
                    href="/bookings/new"
                    style={{ minHeight: "42px" }}
                    className="interactive-btn inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold"
                  >
                    + Book This Date
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedData.dayBookings.map((b) => (
                    <Link
                      key={b.id}
                      href={`/bookings/${b.receiptNo}`}
                      className="interactive-row block p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4CC]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#0B2A5B] text-[14px]">
                          {b.eventTitle}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-[12.5px] text-[#5B6474] mt-1">
                        {b.applicantName} · {b.hall}
                      </p>
                    </Link>
                  ))}
                  {selectedData.dayBlocks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[13px]"
                    >
                      <strong>Blocked for Repair:</strong> {t.title} ({t.location})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "list" && (
          <div className="space-y-3">
            {bookings.map((b, idx) => (
              <Link
                key={b.id}
                href={`/bookings/${b.receiptNo}`}
                style={{ animationDelay: `${idx * 35}ms` }}
                className="interactive-row animate-fade-up flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#EFE4CC]"
              >
                <div>
                  <div className="font-bold text-[#0B2A5B] text-[15px]">
                    {b.dateLabel} — {b.eventTitle}
                  </div>
                  <div className="text-[13px] text-[#5B6474]">
                    {b.applicantName} · {b.hall} · {b.timing}
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        )}

        {activeTab === "block" && (
          <form
            onSubmit={handleSaveBlock}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid rgba(226, 181, 68, 0.35)",
              borderRadius: "18px",
              padding: "24px",
            }}
            className="max-w-xl space-y-4"
          >
            <h2 style={{ color: "#0B2A5B", fontSize: "17px", fontWeight: 700 }}>
              Block a Hall for Repair Work
            </h2>

            {blockSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold flex items-center gap-2 animate-check-pop">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hall blocked on calendar for repair work.</span>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Hall / Area
              </label>
              <select
                value={blockLocation}
                onChange={(e) => setBlockLocation(e.target.value)}
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
              >
                <option value="Ground Floor">Ground Floor</option>
                <option value="First Floor Hall">First Floor Hall</option>
                <option value="Garden Lawn">Garden Lawn</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Date to Block
              </label>
              <input
                type="date"
                value={blockDateISO}
                onChange={(e) => setBlockDateISO(e.target.value)}
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                Reason
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. A.C. servicing, painting"
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
              />
            </div>

            <button
              type="submit"
              style={{
                minHeight: "46px",
                background: "linear-gradient(135deg, #071E47 0%, #0B2A5B 100%)",
                color: "#FFFFFF",
                borderRadius: "12px",
              }}
              className="interactive-btn px-5 py-2 text-[14px] font-bold cursor-pointer"
            >
              Block Date on Calendar
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
