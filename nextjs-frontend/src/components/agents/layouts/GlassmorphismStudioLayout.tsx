"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { CrownIcon, StarIcon, AwardIcon, ChevronRightIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

export default function GlassmorphismStudioLayout({ agents }: LayoutProps) {
  const [expandedBioId, setExpandedBioId] = useState<number | null>(null);

  const topAgent = agents.find((a) => a.is_featured) || agents[0];

  return (
    <div className="bg-[#07162C] text-white rounded-3xl p-6 sm:p-10 border border-[#C9A227]/40 shadow-2xl space-y-12">
      {/* Luxury Glass Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#C9A227]/10 border border-[#C9A227]/40 text-[#C9A227] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-gold">
          <CrownIcon className="w-4 h-4 text-[#C9A227]" />
          Glassmorphism Executive Directory
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Vetted <span className="text-[#C9A227]">Realtor Network</span>
        </h2>
        <p className="text-slate-300 text-sm sm:text-base font-body leading-relaxed">
          High-performance luxury real estate advisors backed by verified neighborhood sales and elite client ratings.
        </p>
      </div>

      {/* Hero Spotlight Card */}
      {topAgent && (
        <div className="relative bg-gradient-to-r from-[#0A2647] via-[#0D315B] to-[#0A2647] border-2 border-[#C9A227] rounded-3xl p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-[#07162C] border-2 border-[#C9A227] overflow-hidden shrink-0 shadow-gold">
                {topAgent.user?.avatar ? (
                  <Image
                    src={storageUrl(topAgent.user.avatar) || ""}
                    alt={agentName(topAgent)}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center font-heading font-black text-2xl text-[#C9A227]">
                    {agentInitials(topAgent)}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black bg-[#C9A227] text-[#07162C] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Top Producer Spotlight
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-white">
                  {agentName(topAgent)}
                </h3>
                <p className="text-xs text-[#C9A227] font-semibold">
                  {topAgent.headline || "Luxury Estate Specialist"}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                  <span>⭐ {topAgent.rating || "4.9"} ({topAgent.review_count || 50} reviews)</span>
                  <span>•</span>
                  <span>🏆 {topAgent.sales_count || 100}+ Transactions</span>
                </div>
              </div>
            </div>

            <Link
              href={`/agents/${topAgent.slug}`}
              className="bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-heading font-black text-xs px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all shrink-0 flex items-center gap-2"
            >
              <span>Connect With Top Advisor</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Glassmorphism Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const avatar = storageUrl(agent.user?.avatar);
          const name = agentName(agent);
          const rating = agent.rating != null ? Number(agent.rating) : 5.0;
          const isBioExpanded = expandedBioId === agent.id;

          return (
            <div
              key={agent.id}
              className="bg-[#0A2647]/70 backdrop-blur-xl rounded-3xl p-6 border border-[#C9A227]/30 hover:border-[#C9A227] transition-all duration-300 space-y-5 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#07162C] border border-[#C9A227]/50 overflow-hidden shrink-0">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center font-bold text-[#C9A227]">
                          {agentInitials(agent)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#C9A227] transition-colors">
                        {name}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium">
                        {agent.brokerage_name || "Domestic Luxury Realty"}
                      </p>
                      {agent.office_city && (
                        <span className="text-[10px] text-[#C9A227] font-semibold block mt-0.5">
                          📍 {agent.office_city}, {agent.office_state || "US"}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] text-xs font-black px-2.5 py-1 rounded-xl">
                    ⭐ {rating.toFixed(1)}
                  </span>
                </div>

                {agent.bio && (
                  <div className="space-y-1">
                    <p className={`text-xs text-slate-300 italic font-body ${isBioExpanded ? "" : "line-clamp-2"}`}>
                      "{agent.bio}"
                    </p>
                    <button
                      onClick={() => setExpandedBioId(isBioExpanded ? null : agent.id)}
                      className="text-[11px] text-[#C9A227] hover:underline font-bold cursor-pointer"
                    >
                      {isBioExpanded ? "Show Less ↑" : "Read Full Bio ↓"}
                    </button>
                  </div>
                )}

                {/* Performance indicators */}
                <div className="bg-[#07162C] p-3.5 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Closed Deals</span>
                    <span className="text-white font-black">{agent.sales_count || 0} Homes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Experience</span>
                    <span className="text-white font-black">{agent.years_experience || 5}+ Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification</span>
                    <span className="text-emerald-400 font-black">✓ License Active</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/agents/${agent.slug}`}
                className="w-full bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-heading font-black text-xs py-3 rounded-xl transition-all text-center block shadow-gold"
              >
                View Luxury Portfolio →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
