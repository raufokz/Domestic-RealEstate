"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { StarIcon, AwardIcon, ShieldCheckIcon, ChevronRightIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

export default function EliteGridLayout({ agents }: LayoutProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section Banner */}
      <section className="relative bg-[#0A2647] text-white rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl border border-[#C9A227]/30">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] opacity-95" />
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/40 rounded-full px-3.5 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="text-[#C9A227] text-xs font-bold uppercase tracking-widest">
              Elite Network Directory
            </span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Partner With Top 1% <span className="text-[#C9A227]">Realtors</span>
          </h2>
          <p className="mt-4 text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-body">
            Licensed, top-producing real estate professionals with proven neighborhood sales records, verified client ratings, and expert negotiation skills.
          </p>
        </div>
      </section>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map((agent) => {
          const rating = agent.rating != null ? Number(agent.rating) : 0;
          const avatar = storageUrl(agent.user?.avatar);
          const name = agentName(agent);

          return (
            <div
              key={agent.id}
              className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0A2647] via-[#C9A227] to-[#0A2647]" />

              <div>
                {/* Header Profile Info */}
                <div className="flex items-start gap-4 mb-5 pb-5 border-b border-slate-100">
                  <div className="relative w-16 h-16 rounded-2xl bg-[#0A2647] text-[#C9A227] font-heading font-extrabold text-xl flex items-center justify-center overflow-hidden shrink-0 border-2 border-[#C9A227]/40 shadow-md">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      agentInitials(agent)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading font-bold text-lg text-[#0A2647] truncate group-hover:text-[#C9A227] transition-colors">
                        {name}
                      </h3>
                      <ShieldCheckIcon className="w-4 h-4 text-amber-500 shrink-0" title="Verified Agent" />
                    </div>

                    <p className="text-slate-500 text-xs truncate mt-0.5 font-semibold">
                      {agent.brokerage_name || "Domestic Partner Realty"}
                    </p>

                    {agent.is_featured && (
                      <span className="inline-inline-flex items-center gap-1 mt-2 text-[10px] font-black bg-[#C9A227]/15 text-[#9E7D19] border border-[#C9A227]/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        ★ Featured Partner
                      </span>
                    )}
                  </div>
                </div>

                {/* Headline / Bio snippet */}
                {agent.headline && (
                  <p className="text-xs text-slate-600 font-medium mb-4 line-clamp-2 leading-relaxed italic">
                    "{agent.headline}"
                  </p>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Rating</span>
                    <span className="text-xs font-black text-[#0A2647] flex items-center gap-1 mt-0.5">
                      <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                      {rating > 0 ? rating.toFixed(1) : "N/A"} ({agent.review_count || 0})
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Homes Closed</span>
                    <span className="text-xs font-black text-[#0A2647] flex items-center gap-1 mt-0.5">
                      <AwardIcon className="w-3.5 h-3.5 text-[#0A2647]" />
                      {agent.sales_count || 0} Sold
                    </span>
                  </div>
                </div>

                {/* Specialty Tags */}
                {agent.specialties && agent.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {agent.specialties.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link
                href={`/agents/${agent.slug}`}
                className="w-full bg-[#0A2647] group-hover:bg-[#C9A227] group-hover:text-[#0A2647] text-white font-heading font-extrabold text-xs py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>View Full Profile</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
