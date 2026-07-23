"use client";

import React from "react";
import { useParams } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function DynamicPropertiesPage() {
  const params = useParams();
  const slugArray = Array.isArray(params?.slug) ? params.slug : [params?.slug || "featured"];
  const pageTitle = slugArray.join(" / ").replace(/-/g, " ").toUpperCase();

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#07162C] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-3">
              Property Discovery & Marketplace
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white capitalize">{pageTitle}</h1>
            <p className="mt-3 text-slate-300 text-sm font-medium">
              Explore verified real estate listings, off-market seller lead deals, and neighborhood market benchmarks matching your search criteria.
            </p>
          </div>

          {/* Dynamic Property Card Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Beverly Hills Luxury Villa", price: "$2,450,000", beds: "5 Beds", baths: "6 Baths", sqft: "5,200 sqft", badge: "Exclusive Deal" },
              { title: "Pacific Palisades Waterfront", price: "$1,890,000", beds: "4 Beds", baths: "4 Baths", sqft: "3,800 sqft", badge: "Off-Market Lead" },
              { title: "Santa Monica Modern Penthouse", price: "$3,100,000", beds: "3 Beds", baths: "3.5 Baths", sqft: "2,900 sqft", badge: "Hot Property" },
            ].map((prop, idx) => (
              <div key={idx} className="bg-[#0A2647] border-2 border-[#C9A227]/50 rounded-3xl p-6 shadow-xl hover:scale-105 transition-all">
                <div className="h-48 bg-slate-900 rounded-2xl mb-4 flex items-center justify-center border border-slate-700 relative overflow-hidden">
                  <span className="text-4xl">🏰</span>
                  <span className="absolute top-3 left-3 bg-[#C9A227] text-[#0A2647] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                    {prop.badge}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-[#C9A227] font-mono">{prop.price}</div>
                <h3 className="text-base font-extrabold text-white mt-1">{prop.title}</h3>
                <div className="mt-3 flex justify-between text-xs text-slate-300 border-t border-slate-800 pt-3 font-semibold">
                  <span>{prop.beds}</span>
                  <span>{prop.baths}</span>
                  <span>{prop.sqft}</span>
                </div>
                <button className="mt-4 w-full bg-slate-800 hover:bg-[#C9A227] hover:text-[#0A2647] text-white text-xs font-extrabold py-2.5 rounded-xl border border-slate-700 transition-colors">
                  View Full Details →
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/properties" className="inline-block bg-[#C9A227] text-[#0A2647] text-xs font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:bg-amber-400">
              Browse All Properties →
            </Link>
          </div>

        </div>
      </div>
    </SiteLayout>
  );
}
