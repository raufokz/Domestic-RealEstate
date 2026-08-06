"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { MapPinIcon, StarIcon, MapIcon, ExternalLinkIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

export default function MapExplorerLayout({ agents }: LayoutProps) {
  const [selectedCity, setSelectedCity] = useState<string>("All");

  const cities = ["All", ...Array.from(new Set(agents.map((a) => a.office_city).filter(Boolean))) as string[]];

  const filteredAgents = selectedCity === "All"
    ? agents
    : agents.filter((a) => a.office_city === selectedCity);

  return (
    <div className="space-y-8">
      {/* Geo Banner */}
      <div className="bg-[#0A2647] text-white rounded-3xl p-8 border border-[#C9A227]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/40 px-3 py-1 rounded-full text-xs font-bold text-[#C9A227]">
            <MapIcon className="w-4 h-4 text-[#C9A227]" />
            Geo-Local Territory Search
          </div>
          <h2 className="font-heading text-3xl font-extrabold">
            Explore Realtors By <span className="text-[#C9A227]">Metropolitan Region</span>
          </h2>
          <p className="text-xs text-slate-300 font-body max-w-xl">
            Find vetted local specialists with hyper-local neighborhood sales dominance and verified buyer/seller relationships.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end max-w-md">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer ${
                selectedCity === city
                  ? "bg-[#C9A227] text-[#07162C] shadow-gold scale-105"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map Mockup Box + Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map Preview Card */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-wider">
                🗺️ Active Coverage Zone
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Data
              </span>
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              {selectedCity === "All" ? "Nationwide Agent Network" : `${selectedCity} Metro Zone`}
            </h3>
            <p className="text-xs text-slate-400">
              Showing top rated advisors covering Zip Codes in this territory.
            </p>
          </div>

          {/* Map Graphic Illustration */}
          <div className="w-full h-48 bg-slate-950 rounded-2xl border border-slate-800 relative flex items-center justify-center overflow-hidden my-4 group">
            <div className="absolute inset-0 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            
            {/* Animated Pin Pins */}
            <div className="absolute top-1/3 left-1/4 animate-bounce">
              <div className="w-8 h-8 rounded-full bg-[#C9A227]/30 border border-[#C9A227] flex items-center justify-center text-xs font-black text-[#C9A227]">
                📍
              </div>
            </div>
            <div className="absolute bottom-1/3 right-1/3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#0A2647] border border-[#C9A227] flex items-center justify-center text-xs font-black text-[#C9A227]">
                🏢
              </div>
            </div>

            <span className="relative z-10 text-xs font-bold text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              Interactive Territory Map
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Direct Zip Code Coverage: <span className="text-white font-bold">100% Verified</span>
          </div>
        </div>

        {/* Agent Cards Feed */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredAgents.map((agent) => {
            const avatar = storageUrl(agent.user?.avatar);
            const name = agentName(agent);
            const rating = agent.rating != null ? Number(agent.rating) : 5.0;

            return (
              <div
                key={agent.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#0A2647] text-[#C9A227] font-bold flex items-center justify-center overflow-hidden shrink-0 border border-[#C9A227]/30">
                      {avatar ? (
                        <Image src={avatar} alt={name} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        agentInitials(agent)
                      )}
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-base text-[#0A2647]">{name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{agent.brokerage_name || "Domestic Partner"}</p>
                      {agent.office_city && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C9A227] mt-0.5">
                          <MapPinIcon className="w-3 h-3 text-[#C9A227]" />
                          {agent.office_city}, {agent.office_state || "US"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                      {rating.toFixed(1)} ({agent.review_count || 0})
                    </span>
                    <span>{agent.sales_count || 0} Sales</span>
                  </div>
                </div>

                <Link
                  href={`/agents/${agent.slug}`}
                  className="w-full bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white text-xs font-bold py-2.5 rounded-xl transition-all text-center block"
                >
                  Explore Local Portfolio →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
