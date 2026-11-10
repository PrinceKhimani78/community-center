"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Wrench, Plus, ClipboardCheck, Check, AlertTriangle } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { MaintenanceTicket } from "@/lib/mock/dashboard";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";
import StatusBadge from "@/components/common/StatusBadge";

type MaintenanceTab = "repairs" | "new" | "check";

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const {
    tickets,
    addMaintenanceTicket,
    updateTicketStatus,
    hallCheckMode,
    setHallCheckMode,
    hallCheckItems,
    setHallCheckItemStatus,
  } = useDashboard();

  const tabParam = searchParams.get("tab");
  const resolvedParamTab: MaintenanceTab =
    tabParam === "check" ? "check" : tabParam === "new" ? "new" : "repairs";
  const [tabState, setTabState] = useState<{ param: string | null; tab: MaintenanceTab }>({
    param: tabParam,
    tab: resolvedParamTab,
  });
  const activeTab = tabState.param === tabParam ? tabState.tab : resolvedParamTab;
  const setActiveTab = (tab: MaintenanceTab) => setTabState({ param: tabParam, tab });

  // New repair form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MaintenanceTicket["category"]>("Plumbing");
  const [location, setLocation] = useState("Ground Floor Hall");
  const [priority, setPriority] = useState<MaintenanceTicket["priority"]>("Normal");
  const [estimatedCost, setEstimatedCost] = useState(1000);
  const [ticketSaved, setTicketSaved] = useState(false);

  const [checkSaved, setCheckSaved] = useState(false);

  const totalDamageCost = hallCheckItems
    .filter((i) => i.status === "Issue")
    .reduce((sum, i) => sum + i.issueCost, 0);

  const tabs: TabItem<MaintenanceTab>[] = [
    { id: "repairs", label: "Repair List", icon: Wrench, count: tickets.length },
    { id: "new", label: "Add Repair", icon: Plus },
    { id: "check", label: "Hall Check", icon: ClipboardCheck },
  ];

  const handleNewRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addMaintenanceTicket({
      title: title.trim(),
      category,
      location,
      priority,
      estimatedCost: Number(estimatedCost || 0),
    });
    setTitle("");
    setTicketSaved(true);
    setActiveTab("repairs");
  };

  return (
    <PageShell
      title="Maintenance & Hall Check"
      subtitle="Track repair work or check hall items before and after events."
    >
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Maintenance tabs"
      />

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "repairs" && (
          <div className="space-y-3">
            {ticketSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13.5px] font-semibold animate-check-pop">
                New repair ticket saved!
              </div>
            )}
            {tickets.map((t, idx) => (
              <div
                key={t.id}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="interactive-row animate-fade-up bg-white rounded-2xl border border-[#EFE4CC] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] font-bold px-2 py-0.5 rounded bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC]">
                      {t.ticketNo}
                    </span>
                    <h3 className="font-bold text-[#0B2A5B] text-[15px]">{t.title}</h3>
                    <StatusBadge status={t.status} />
                    <StatusBadge status={t.priority} />
                  </div>
                  <p className="text-[13px] text-[#5B6474]">
                    {t.location} · {t.category} · Est. ₹{t.estimatedCost.toLocaleString("en-IN")} ·{" "}
                    {t.dateLabel}
                  </p>
                </div>

                {t.status !== "Completed" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateTicketStatus(
                        t.id,
                        t.status === "Pending" ? "In Progress" : "Completed"
                      )
                    }
                    style={{ minHeight: "42px" }}
                    className="interactive-btn px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold cursor-pointer shrink-0"
                  >
                    {t.status === "Pending" ? "Start Work" : "Mark Done"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "new" && (
          <form
            onSubmit={handleNewRepair}
            className="bg-white rounded-2xl border border-[#EFE4CC] p-6 max-w-xl space-y-4"
          >
            <h2 className="font-bold text-[#0B2A5B] text-[17px]">Raise a Repair Request</h2>

            <div>
              <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                What needs repair?
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fan regulator broken near main stage"
                style={{ minHeight: "46px" }}
                className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MaintenanceTicket["category"])}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="AC / Fans">AC / Fans</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as MaintenanceTicket["priority"])}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px]"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#14213D] mb-1.5">
                  Estimated Cost (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  style={{ minHeight: "46px" }}
                  className="w-full rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] px-3.5 text-[14px] font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              style={{ minHeight: "46px" }}
              className="interactive-btn px-6 py-2 rounded-xl bg-[#0B2A5B] text-white text-[14px] font-bold cursor-pointer"
            >
              Save Repair Request
            </button>
          </form>
        )}

        {activeTab === "check" && (
          <div className="space-y-4">
            {/* Simple Before/After Toggle */}
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {(["Before Event", "After Event"] as const).map((modeOption) => (
                  <button
                    key={modeOption}
                    type="button"
                    onClick={() => setHallCheckMode(modeOption)}
                    style={{ minHeight: "42px" }}
                    className={`px-4 py-2 rounded-xl text-[13.5px] font-bold cursor-pointer transition-all ${
                      hallCheckMode === modeOption
                        ? "bg-[#0B2A5B] text-white"
                        : "bg-[#FAF5EB] text-[#0B2A5B] border border-[#EFE4CC]"
                    }`}
                  >
                    {modeOption}
                  </button>
                ))}
              </div>
              <div className="text-[14px] font-bold text-[#0B2A5B]">
                Damage Total:{" "}
                <span className={totalDamageCost > 0 ? "text-[#C62828]" : "text-[#15803D]"}>
                  ₹{totalDamageCost.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* 7 Easy Toggle Rows */}
            <div className="space-y-2.5">
              {hallCheckItems.map((item) => {
                const isOk = item.status === "OK";
                return (
                  <div
                    key={item.id}
                    className={`interactive-row rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isOk
                        ? "bg-white border-[#EFE4CC]"
                        : "bg-red-50/70 border-red-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[#0B2A5B] text-[15px]">{item.label}</div>
                      <div className="text-[12.5px] text-[#5B6474]">{item.helper}</div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setHallCheckItemStatus(item.id, "OK")}
                        style={{ minHeight: "44px" }}
                        className={`px-4 py-2 rounded-xl text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                          isOk
                            ? "bg-[#15803D] text-white shadow-xs"
                            : "bg-white text-[#5B6474] border border-[#EFE4CC]"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>OK</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHallCheckItemStatus(item.id, "Issue", 500, "Needs repair")}
                        style={{ minHeight: "44px" }}
                        className={`px-4 py-2 rounded-xl text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                          !isOk
                            ? "bg-[#C62828] text-white shadow-xs"
                            : "bg-white text-[#5B6474] border border-[#EFE4CC]"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Issue (₹500)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              {checkSaved ? (
                <span className="text-[13.5px] font-bold text-[#15803D] animate-check-pop">
                  Hall check saved! Ready for deposit settlement.
                </span>
              ) : (
                <span className="text-[13px] text-[#5B6474]">
                  Tap OK or Issue for each item above.
                </span>
              )}
              <button
                type="button"
                onClick={() => setCheckSaved(true)}
                style={{ minHeight: "46px" }}
                className="interactive-btn px-6 py-2 rounded-xl bg-[#0B2A5B] text-white text-[14px] font-bold cursor-pointer"
              >
                Save Hall Check
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B2A5B]">Loading maintenance...</div>}>
      <MaintenanceContent />
    </Suspense>
  );
}
