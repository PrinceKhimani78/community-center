"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Printer, FileText } from "lucide-react";
import { useDashboard } from "@/lib/context/DashboardContext";
import PageShell from "@/components/common/PageShell";
import TabBar, { TabItem } from "@/components/common/TabBar";

type ReceiptTab = "find" | "preview";

export default function ReceiptsPage() {
  const { payments } = useDashboard();
  const [activeTab, setActiveTab] = useState<ReceiptTab>("find");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(payments[0]?.id || "");

  const selected = payments.find((p) => p.id === selectedId) || payments[0];

  const filtered = payments.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      p.receiptNo.toLowerCase().includes(q) ||
      p.applicantName.toLowerCase().includes(q) ||
      p.eventTitle.toLowerCase().includes(q)
    );
  });

  const tabs: TabItem<ReceiptTab>[] = [
    { id: "find", label: "All Receipts", icon: Search, count: payments.length },
    { id: "preview", label: "Preview & Print", icon: FileText },
  ];

  return (
    <PageShell
      title="Official Receipts"
      subtitle="Search any payment receipt and print it easily."
    >
      <div className="no-print">
        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} ariaLabel="Receipt tabs" />
      </div>

      <div key={activeTab} className="animate-tab-enter">
        {activeTab === "find" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#EFE4CC] p-4">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-[#5B6474] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by receipt number or person name..."
                  style={{ minHeight: "44px" }}
                  className="w-full pl-10 pr-4 rounded-xl border border-[#E5D9BF] bg-[#FAF7F2] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#E2B544]"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="interactive-row bg-white rounded-2xl border border-[#EFE4CC] p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-[#0B2A5B] text-[15px]">
                      {p.receiptNo} · {p.applicantName}
                    </div>
                    <p className="text-[13px] text-[#5B6474]">
                      {p.eventTitle} · {p.type} ({p.mode}) · {p.dateLabel}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[17px] font-extrabold text-[#15803D]">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(p.id);
                        setActiveTab("preview");
                      }}
                      style={{ minHeight: "42px" }}
                      className="interactive-btn px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Open Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "preview" && selected && (
          <div className="space-y-4">
            <div className="no-print flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  minHeight: "44px",
                  background: "linear-gradient(135deg, #F7E6A9 0%, #E2B544 55%, #C9971C 100%)",
                  color: "#041535",
                  borderRadius: "12px",
                }}
                className="interactive-btn px-5 py-2 text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>

            {/* Official Receipt Paper */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "2px solid #E2B544",
                borderRadius: "18px",
                padding: "clamp(22px, 4vw, 38px)",
                maxWidth: "720px",
              }}
              className="mx-auto shadow-md space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#EFE4CC] pb-5">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Centre logo"
                    width={58}
                    height={58}
                    className="rounded-full object-contain border border-[#E2B544]"
                  />
                  <div>
                    <h2 className="text-[17px] font-bold text-[#0B2A5B]">
                      Haji Mohamed Yunus Valibhoy Community Centre
                    </h2>
                    <p lang="gu" className="text-[13px] font-bold text-[#C9971C]">
                      હાજી મોહમ્મદ યુનુસ વલીભોય કોમ્યુનિટી સેન્ટર
                    </p>
                    <p className="text-[12px] text-[#5B6474]">Dhari, Gujarat, India</p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#5B6474]">
                    Payment Receipt
                  </div>
                  <div className="text-[18px] font-extrabold text-[#0B2A5B]">
                    {selected.receiptNo}
                  </div>
                  <div className="text-[12.5px] text-[#5B6474]">{selected.dateLabel}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                <div className="p-3.5 rounded-xl bg-[#FAF7F2]">
                  <div className="text-[11.5px] text-[#5B6474]">Received From</div>
                  <div className="font-bold text-[#0B2A5B] mt-0.5">{selected.applicantName}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF7F2]">
                  <div className="text-[11.5px] text-[#5B6474]">Booking / Event</div>
                  <div className="font-bold text-[#0B2A5B] mt-0.5">
                    #{selected.bookingReceiptNo} · {selected.eventTitle}
                  </div>
                </div>
              </div>

              <div className="border border-[#EFE4CC] rounded-xl overflow-hidden">
                <div className="bg-[#0B2A5B] text-white px-4 py-2.5 flex justify-between text-[13px] font-bold">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 flex justify-between items-center text-[14.5px]">
                  <div>
                    <div className="font-semibold text-[#0B2A5B]">{selected.type}</div>
                    <div className="text-[12.5px] text-[#5B6474]">
                      Mode: {selected.mode} · Ref: {selected.reference}
                    </div>
                  </div>
                  <div className="text-[20px] font-extrabold text-[#15803D]">
                    ₹{selected.amount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end pt-8 text-[12.5px] text-[#5B6474]">
                <span>Thank you for supporting the Community Centre.</span>
                <div className="text-center">
                  <div className="w-40 border-b border-[#0B2A5B] mb-1" />
                  <span className="font-semibold text-[#0B2A5B]">Authorised Signature</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
