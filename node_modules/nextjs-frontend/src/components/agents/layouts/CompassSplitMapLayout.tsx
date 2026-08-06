"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { SearchIcon, FilterIcon, MapPinIcon, StarIcon, ChevronRightIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

export default function CompassSplitMapLayout({ agents }: LayoutProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [minRating, setMinRating] = useState(0);

  const cities = ["All", ...Array.from(new Set(agents.map((a) => a.office_city).filter(Boolean))) as string[]];

  const filteredAgents = agents.filter((agent) => {
    const name = agentName(agent).toLowerCase();
    const city = (agent.office_city || "").toLowerCase();
    const rating = Number(agent.rating || 0);

    const matchesSearch = name.includes(searchTerm.toLowerCase()) || city.includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "All" || agent.office_city === selectedCity;
    const matchesRating = rating >= minRating;

    return matchesSearch && matchesCity && matchesRating;
  });

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-1/3 relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search agents by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A2647] font-medium"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {cities.slice(0, 6).map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCity === city
                  ? "bg-[#0A2647] text-[#C9A227]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Rating Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">Min Rating:</span>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0A2647] focus:outline-none"
          >
            <option value={0}>All Ratings</option>
            <option value={4.5}>4.5+ Stars</option>
            <option value={4.8}>4.8+ Stars</option>
          </select>
        </div>
      </div>

      {/* Main Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: AGENT FEED */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Showing {filteredAgents.length} Vetted Real Estate Advisors</span>
            <span className="text-emerald-600 font-bold">🟢 Live Availability</span>
          </div>

          {filteredAgents.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
              <p className="text-slate-500 font-semibold text-sm">No agents match your criteria.</p>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const avatar = storageUrl(agent.user?.avatar);
              const name = agentName(agent);
              const rating = agent.rating != null ? Number(agent.rating) : 5.0;

              return (
                <div
                  key={agent.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-2xl bg-[#0A2647] text-[#C9A227] font-extrabold text-xl flex items-center justify-center overflow-hidden shrink-0 border border-[#C9A227]/30">
                      {avatar ? (
                        <Image src={avatar} alt={name} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        agentInitials(agent)
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-extrabold text-base text-[#0A2647] group-hover:text-[#C9A227] transition-colors">
                          {name}
                        </h3>
                        {agent.office_city && (
                          <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3 text-[#C9A227]" />
                            {agent.office_city}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        {agent.headline || agent.brokerage_name || "Domestic Preferred Partner"}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 font-bold">
                        <span className="flex items-center gap-1 text-[#0A2647]">
                          <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                          {rating.toFixed(1)} ({agent.review_count || 0})
                        </span>
                        <span>•</span>
                        <span>{agent.sales_count || 0} Closed Deals</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/agents/${agent.slug}`}
                    className="w-full sm:w-auto bg-[#C9A227] hover:bg-[#b08d20] text-[#0A2647] font-heading font-black text-xs px-6 py-3.5 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shrink-0 shadow-[0_4px_14px_rgba(201,162,39,0.35)] hover:scale-[1.02] uppercase tracking-wider"
                  >
                    <span>View Profile</span>
                    <ChevronRightIcon className="w-4 h-4 text-[#0A2647]" />
                  </Link>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: STICKY MAP VIEW PANEL */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="sticky top-24 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 min-h-[580px] flex flex-col justify-between overflow-hidden">
            <div className="space-y-2 border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-wider">
                  🗺️ Interactive Territory Map
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live Sync
                </span>
              </div>
              <h4 className="font-heading font-bold text-base text-white">
                {selectedCity === "All" ? "Coverage Area: Nationwide" : `Coverage Area: ${selectedCity}`}
              </h4>
            </div>

            {/* Interactive Map Visual */}
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 relative flex items-center justify-center overflow-hidden my-2 group">
              <div className="absolute inset-0 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

              {/* Dynamic Pin Markers */}
              {filteredAgents.slice(0, 4).map((agent, i) => (
                <div
                  key={agent.id}
                  style={{ top: `${20 + i * 20}%`, left: `${25 + (i % 2) * 40}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-pointer"
                >
                  <div className="bg-[#0A2647] border-2 border-[#C9A227] text-[#C9A227] font-bold text-[10px] px-2.5 py-1 rounded-full shadow-gold flex items-center gap-1">
                    <span>📍</span>
                    <span>{agentName(agent).split(" ")[0]}</span>
                  </div>
                </div>
              ))}

              <span className="relative z-10 text-xs font-bold text-slate-300 bg-slate-900/95 px-4 py-2 rounded-xl border border-slate-800 shadow-xl">
                📍 {filteredAgents.length} Agents Mapped
              </span>
            </div>

            <div className="text-xs text-slate-400 text-center font-mono">
              Hover pins to view agent sales coverage in target zip codes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
