"use client";

import React from "react";
import { useParams } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function DynamicBuyersPage() {
  const params = useParams();
  const slugArray = Array.isArray(params?.slug) ? params.slug : [params?.slug || "guide"];
  const pageTitle = slugArray.join(" / ").replace(/-/g, " ").toUpperCase();

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#07162C] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-3">
              Buyer Services & Resources
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white capitalize">{pageTitle}</h1>
            <p className="mt-3 text-slate-300 text-sm font-medium">
              Empowering home buyers with mortgage pre-approval tools, first-time buyer checklists, and exclusive agent representation.
            </p>
          </div>

          <div className="bg-[#0A2647] border-2 border-[#C9A227]/60 p-8 rounded-3xl shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-[#C9A227]">Buyer Assistance Portal</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Whether you are searching for your first single-family home or looking to relocate across state lines, Domestic RE provides full-service buyer support and automated property alert notifications.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Link href="/buyers/mortgage-calculator" className="p-4 bg-[#07162C] border border-slate-700 rounded-2xl hover:border-[#C9A227] transition-all">
                <span className="text-xl">🧮</span>
                <h4 className="font-extrabold text-white text-sm mt-2">Mortgage Calculator</h4>
                <p className="text-xs text-slate-400 mt-1">Estimate monthly payments and loan terms.</p>
              </Link>
              <Link href="/buyers/request-agent" className="p-4 bg-[#07162C] border border-slate-700 rounded-2xl hover:border-[#C9A227] transition-all">
                <span className="text-xl">🤝</span>
                <h4 className="font-extrabold text-white text-sm mt-2">Request Buyer Agent</h4>
                <p className="text-xs text-slate-400 mt-1">Connect with top 1% local neighborhood experts.</p>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  );
}
