"use client";

import React from "react";
import { useParams } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function DynamicSellersPage() {
  const params = useParams();
  const slugArray = Array.isArray(params?.slug) ? params.slug : [params?.slug || "guide"];
  const pageTitle = slugArray.join(" / ").replace(/-/g, " ").toUpperCase();

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#07162C] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-3">
              Seller Services & Valuation
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white capitalize">{pageTitle}</h1>
            <p className="mt-3 text-slate-300 text-sm font-medium">
              Maximize your net proceeds with our automated home valuation algorithms and nationwide investor network.
            </p>
          </div>

          <div className="bg-[#0A2647] border-2 border-[#C9A227]/60 p-8 rounded-3xl shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-[#C9A227]">Seller Marketing Hub</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Get maximum market exposure for your home through 3D virtual tours, MLS syndication, and direct cash offers from verified institutional investors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Link href="/sellers/home-valuation" className="p-4 bg-[#07162C] border border-slate-700 rounded-2xl hover:border-[#C9A227] transition-all">
                <span className="text-xl">🏡</span>
                <h4 className="font-extrabold text-white text-sm mt-2">Instant Valuation</h4>
                <p className="text-xs text-slate-400 mt-1">Get an algorithmic home value report.</p>
              </Link>
              <Link href="/sellers/net-proceeds-calculator" className="p-4 bg-[#07162C] border border-slate-700 rounded-2xl hover:border-[#C9A227] transition-all">
                <span className="text-xl">📊</span>
                <h4 className="font-extrabold text-white text-sm mt-2">Net Proceeds Modeler</h4>
                <p className="text-xs text-slate-400 mt-1">Calculate your final closing net profit.</p>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  );
}
