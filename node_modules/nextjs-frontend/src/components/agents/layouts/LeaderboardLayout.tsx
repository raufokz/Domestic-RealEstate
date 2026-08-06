"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { TrophyIcon, StarIcon, ShieldCheckIcon, TrendingUpIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

export default function LeaderboardLayout({ agents }: LayoutProps) {
  // Sort agents by sales_count or rating
  const rankedAgents = [...agents].sort((a, b) => {
    const salesA = a.sales_count || 0;
    const salesB = b.sales_count || 0;
    return salesB - salesA;
  });

  const topThree = rankedAgents.slice(0, 3);
  const remainingRanked = rankedAgents.slice(3);

  const medalBadges = [
    { rank: "#1", color: "bg-amber-400 text-amber-950 border-amber-300", label: "🥇 Rank 1 Top Producer" },
    { rank: "#2", color: "bg-slate-300 text-slate-900 border-slate-200", label: "🥈 Rank 2 High Performer" },
    { rank: "#3", color: "bg-amber-700 text-amber-100 border-amber-600", label: "🥉 Rank 3 High Performer" },
  ];

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-700 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          <TrophyIcon className="w-4 h-4 text-amber-600" />
          Annual Production Leaderboard
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#0A2647]">
          Top Producing <span className="text-[#C9A227]">Realtor Podium</span>
        </h2>
        <p className="text-slate-600 text-sm font-body">
          Agents ranked by verified closed sales volume, client satisfaction ratings, and neighborhood market dominance.
        </p>
      </div>

      {/* TOP 3 PODIUM SECTION */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Rank 2 (Left) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md flex flex-col justify-between space-y-4 md:mt-6">
            <div className="space-y-3">
              <span className={`inline-block text-xs font-black px-3 py-1 rounded-full border ${medalBadges[1].color}`}>
                {medalBadges[1].label}
              </span>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0A2647] text-[#C9A227] font-bold flex items-center justify-center overflow-hidden shrink-0 border border-slate-300">
                  {storageUrl(topThree[1].user?.avatar) ? (
                    <Image src={storageUrl(topThree[1].user?.avatar) || ""} alt={agentName(topThree[1])} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    agentInitials(topThree[1])
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#0A2647]">{agentName(topThree[1])}</h3>
                  <p className="text-xs text-slate-500 font-medium">{topThree[1].brokerage_name || "Domestic Partner"}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-bold">
                <span>Total Sales:</span>
                <span className="text-[#0A2647] font-mono">{topThree[1].sales_count || 0} Closed Homes</span>
              </div>
            </div>
            <Link href={`/agents/${topThree[1].slug}`} className="block text-center w-full bg-[#0A2647] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#C9A227] hover:text-[#0A2647] transition-all">
              View Profile →
            </Link>
          </div>

          {/* Rank 1 (Center Elevated Gold) */}
          <div className="bg-gradient-to-b from-[#0A2647] to-[#07162C] text-white rounded-3xl p-8 border-2 border-[#C9A227] shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <span className={`inline-block text-xs font-black px-3.5 py-1.5 rounded-full border shadow-gold ${medalBadges[0].color}`}>
                {medalBadges[0].label}
              </span>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#07162C] border-2 border-[#C9A227] overflow-hidden shrink-0 shadow-gold">
                  {storageUrl(topThree[0].user?.avatar) ? (
                    <Image src={storageUrl(topThree[0].user?.avatar) || ""} alt={agentName(topThree[0])} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    agentInitials(topThree[0])
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white">{agentName(topThree[0])}</h3>
                  <p className="text-xs text-[#C9A227] font-semibold">{topThree[0].headline || "Top Producer"}</p>
                </div>
              </div>

              <div className="bg-white/10 p-3.5 rounded-xl border border-white/15 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Sales Volume:</span>
                <span className="text-[#C9A227] font-mono text-sm">{topThree[0].sales_count || 0} Closed Deals</span>
              </div>
            </div>

            <Link href={`/agents/${topThree[0].slug}`} className="block text-center w-full bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-heading font-black text-xs py-3 rounded-xl shadow-gold transition-all relative z-10">
              Connect With #1 Ranked Agent →
            </Link>
          </div>

          {/* Rank 3 (Right) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md flex flex-col justify-between space-y-4 md:mt-6">
            <div className="space-y-3">
              <span className={`inline-block text-xs font-black px-3 py-1 rounded-full border ${medalBadges[2].color}`}>
                {medalBadges[2].label}
              </span>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0A2647] text-[#C9A227] font-bold flex items-center justify-center overflow-hidden shrink-0 border border-slate-300">
                  {storageUrl(topThree[2].user?.avatar) ? (
                    <Image src={storageUrl(topThree[2].user?.avatar) || ""} alt={agentName(topThree[2])} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    agentInitials(topThree[2])
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#0A2647]">{agentName(topThree[2])}</h3>
                  <p className="text-xs text-slate-500 font-medium">{topThree[2].brokerage_name || "Domestic Partner"}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-bold">
                <span>Total Sales:</span>
                <span className="text-[#0A2647] font-mono">{topThree[2].sales_count || 0} Closed Homes</span>
              </div>
            </div>
            <Link href={`/agents/${topThree[2].slug}`} className="block text-center w-full bg-[#0A2647] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#C9A227] hover:text-[#0A2647] transition-all">
              View Profile →
            </Link>
          </div>
        </div>
      )}

      {/* REMAINDER RANKINGS TABLE */}
      {remainingRanked.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <h4 className="font-heading font-extrabold text-lg text-[#0A2647] border-b border-slate-100 pb-3">
            Leaderboard Roster Rankings
          </h4>
          <div className="divide-y divide-slate-100">
            {remainingRanked.map((agent, index) => {
              const rank = index + 4;
              const avatar = storageUrl(agent.user?.avatar);
              const name = agentName(agent);

              return (
                <div key={agent.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-mono font-extrabold text-xs flex items-center justify-center">
                      #{rank}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#0A2647] text-[#C9A227] font-bold flex items-center justify-center overflow-hidden shrink-0">
                      {avatar ? <Image src={avatar} alt={name} width={40} height={40} className="w-full h-full object-cover" /> : agentInitials(agent)}
                    </div>
                    <div>
                      <div className="font-bold text-[#0A2647] text-sm">{name}</div>
                      <div className="text-xs text-slate-500 font-medium">{agent.brokerage_name || "Partner Agent"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-bold">
                    <span className="text-[#0A2647] font-mono">{agent.sales_count || 0} Closed Deals</span>
                    <Link href={`/agents/${agent.slug}`} className="bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white text-xs px-3.5 py-1.5 rounded-xl transition-all">
                      Profile →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
