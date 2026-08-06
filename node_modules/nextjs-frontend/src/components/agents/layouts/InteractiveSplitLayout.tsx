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

export default function InteractiveSplitLayout({ agents }: LayoutProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");

  const allSpecialties = [
    "All",
    ...Array.from(
      new Set(agents.flatMap((a) => a.specialties || []))
    ),
  ];

  const filteredAgents = agents.filter((agent) => {
    const name = agentName(agent).toLowerCase();
    const city = (agent.office_city || "").toLowerCase();
    const matchesSearch =
      name.includes(search.toLowerCase()) || city.includes(search.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All" ||
      (agent.specialties && agent.specialties.includes(selectedSpecialty));

    return matchesSearch && matchesSpecialty;
  });

  const featuredAgent = agents.find((a) => a.is_featured) || agents[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT SIDEBAR: Filters & Spotlight */}
      <div className="lg:col-span-4 space-y-6">
        {/* Search & Filter Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FilterIcon className="w-5 h-5 text-[#C9A227]" />
            <h3 className="font-heading font-extrabold text-base text-[#0A2647]">
              Directory Filters
            </h3>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Search Agent or City
            </label>
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. Marcus, Miami, Austin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A2647] font-medium"
              />
            </div>
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Specialty Area
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allSpecialties.slice(0, 7).map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSpecialty === spec
                      ? "bg-[#0A2647] text-[#C9A227] shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Spotlight Card */}
        {featuredAgent && (
          <div className="bg-gradient-to-br from-[#0A2647] to-[#07162C] text-white rounded-3xl p-6 shadow-xl border border-[#C9A227]/30 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-[#C9A227] text-[#07162C] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Spotlight
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/20 border border-[#C9A227] overflow-hidden shrink-0">
                {featuredAgent.user?.avatar ? (
                  <Image
                    src={storageUrl(featuredAgent.user.avatar) || ""}
                    alt={agentName(featuredAgent)}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center font-bold text-[#C9A227]">
                    {agentInitials(featuredAgent)}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-base text-white">
                  {agentName(featuredAgent)}
                </h4>
                <p className="text-xs text-[#C9A227] font-semibold">
                  {featuredAgent.headline || "Top Producing Partner"}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 line-clamp-3 mb-4 font-body">
              {featuredAgent.bio || "Top rated real estate agent in our partner network."}
            </p>
            <Link
              href={`/agents/${featuredAgent.slug}`}
              className="block text-center w-full bg-[#C9A227] hover:bg-amber-400 text-[#07162C] text-xs font-extrabold py-2.5 rounded-xl transition-all"
            >
              Contact Spotlight Agent →
            </Link>
          </div>
        )}
      </div>

      {/* RIGHT MAIN LISTING FEED */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-600">
            Showing <span className="text-[#0A2647] font-black">{filteredAgents.length}</span> Verified Agents
          </p>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
            <p className="text-slate-500 font-semibold text-sm">No agents match your filter criteria.</p>
          </div>
        ) : (
          filteredAgents.map((agent) => {
            const avatar = storageUrl(agent.user?.avatar);
            const rating = agent.rating != null ? Number(agent.rating) : 0;
            const name = agentName(agent);

            return (
              <div
                key={agent.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0A2647] text-[#C9A227] font-heading font-extrabold text-xl flex items-center justify-center overflow-hidden shrink-0 border border-[#C9A227]/30">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      agentInitials(agent)
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-base text-[#0A2647]">
                        {name}
                      </h3>
                      {agent.office_city && (
                        <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3 text-[#C9A227]" />
                          {agent.office_city}, {agent.office_state || "US"}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {agent.headline || agent.brokerage_name || "Domestic Partner Agent"}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1 font-bold text-[#0A2647]">
                        <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                        {rating > 0 ? rating.toFixed(1) : "5.0"} ({agent.review_count || 0})
                      </span>
                      <span className="font-bold text-slate-700">
                        {agent.sales_count || 0} Deals Closed
                      </span>
                      {agent.years_experience && (
                        <span className="text-slate-400 font-medium">
                          {agent.years_experience} yrs exp
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex sm:flex-col items-center gap-2 shrink-0">
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="w-full sm:w-auto bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white font-heading font-extrabold text-xs px-5 py-3 rounded-xl transition-all text-center flex items-center justify-center gap-1"
                  >
                    <span>View Profile</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
