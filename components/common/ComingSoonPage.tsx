import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export default function ComingSoonPage({
  title,
  description = "This section is currently being prepared for the Haji Mohamed Yunus Valibhoy Community Centre management system.",
}: ComingSoonPageProps) {
  return (
    <div className="w-full min-h-[calc(100vh-76px)] p-6 sm:p-8 flex items-center justify-center">
      <div className="bg-white rounded-[18px] border border-[#EFE4CC] p-8 max-w-md w-full text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-[#F8E7B9] text-navy flex items-center justify-center mb-4">
          <Clock className="w-7 h-7 text-navy" />
        </div>
        <h1 className="text-[22px] font-bold text-navy">{title}</h1>
        <p className="text-[13px] text-muted mt-2 leading-relaxed">{description}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-navy text-white text-[14px] font-semibold hover:bg-navy/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
