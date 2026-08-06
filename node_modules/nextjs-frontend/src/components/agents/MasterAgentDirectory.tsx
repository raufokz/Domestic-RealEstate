"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import {
  StarIcon,
  ShieldCheckIcon,
  AwardIcon,
  SearchIcon,
  MapPinIcon,
  ChevronRightIcon,
} from "./AgentIcons";

interface MasterAgentDirectoryProps {
  agents: PublicAgent[];
}

export default function MasterAgentDirectory({ agents }: MasterAgentDirectoryProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [minRating, setMinRating] = useState(0);

  // Modal States
  const [lightboxAgent, setLightboxAgent] = useState<PublicAgent | null>(null);
  const [contactAgent, setContactAgent] = useState<PublicAgent | null>(null);

  // Extract unique cities & specialties
  const cities = [
    "All",
    ...Array.from(new Set(agents.map((a) => a.office_city).filter(Boolean))) as string[],
  ];

  const specialties = [
    "All",
    ...Array.from(new Set(agents.flatMap((a) => a.specialties || []))),
  ];

  // Filtering Logic
  const filteredAgents = agents.filter((agent) => {
    const name = agentName(agent).toLowerCase();
    const city = (agent.office_city || "").toLowerCase();
    const rating = Number(agent.rating || 0);

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) || city.includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "All" || agent.office_city === selectedCity;
    const matchesSpecialty =
      selectedSpecialty === "All" ||
      (agent.specialties && agent.specialties.includes(selectedSpecialty));
    const matchesRating = rating >= minRating;

    return matchesSearch && matchesCity && matchesSpecialty && matchesRating;
  });

  return (
    <div className="space-y-12">
      {/* 1. HERO & SEARCH FILTER HEADER */}
      <section className="bg-gradient-to-br from-[#07162C] via-[#0A2647] to-[#07162C] text-white rounded-3xl p-6 sm:p-10 border border-[#C9A227]/30 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Title & Subtitle */}
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <ShieldCheckIcon className="w-4 h-4 text-[#C9A227]" />
            Verified Realtor Partner Directory
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Find & Connect With Top <span className="text-[#C9A227]">Local Realtors</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-body leading-relaxed max-w-2xl">
            Partner with licensed real estate professionals with proven neighborhood sales records, verified client ratings, and expert negotiation skills.
          </p>
        </div>

        {/* Integrated Filter Bar */}
        <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/15 space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search agent name, brokerage, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#C9A227] transition-all"
              />
            </div>

            {/* Specialty Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#C9A227]"
              >
                <option value="All">All Specialties</option>
                {specialties.filter((s) => s !== "All").map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Rating Selector */}
            <div className="md:col-span-3">
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#C9A227]"
              >
                <option value={0}>Any Rating</option>
                <option value={4.5}>⭐ 4.5+ Stars</option>
                <option value={4.8}>⭐ 4.8+ Stars</option>
                <option value={5.0}>⭐ 5.0 Top Stars</option>
              </select>
            </div>
          </div>

          {/* City Quick Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
            <span className="text-xs font-bold text-slate-300 mr-2">Top Metro Cities:</span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
      </section>

      {/* 2. RESULTS SUMMARY HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0A2647]">
            Verified Partner Directory
          </h2>
          <p className="text-xs text-slate-500 font-body">
            Showing <span className="font-bold text-[#0A2647]">{filteredAgents.length}</span> licensed agents
          </p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
          🟢 Live Directory
        </span>
      </div>

      {/* 3. AGENT CARDS GRID */}
      {filteredAgents.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 space-y-3">
          <p className="text-slate-500 font-semibold text-sm">
            No agents found matching your current filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCity("All");
              setSelectedSpecialty("All");
              setMinRating(0);
            }}
            className="text-xs font-bold text-[#C9A227] hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAgents.map((agent) => {
            const avatar = storageUrl(agent.user?.avatar);
            const name = agentName(agent);
            const rating = agent.rating != null ? Number(agent.rating) : 5.0;

            return (
              <div
                key={agent.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Full Portrait Container with Perfect Aspect Ratio Framing */}
                <div className="relative w-full aspect-[3/4] bg-slate-900 overflow-hidden group/image">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={name}
                      fill
                      className="object-cover object-top group-hover/image:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0A2647] flex items-center justify-center font-heading font-black text-5xl text-[#C9A227]">
                      {agentInitials(agent)}
                    </div>
                  )}

                  {/* Gradient Overlay for Readable Badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

                  {/* Floating Rating Pill */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-[#0A2647] shadow-md flex items-center gap-1">
                    <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                    <span>{rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({agent.review_count || 0})</span>
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-4 right-4 bg-emerald-500/90 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                    ✓ Verified
                  </div>

                  {/* Full Photo Lightbox Trigger Button */}
                  <button
                    onClick={() => setLightboxAgent(agent)}
                    className="absolute bottom-16 right-4 bg-slate-900/80 hover:bg-[#0A2647] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 cursor-pointer flex items-center gap-1 shadow-lg"
                    title="View Full Uncropped Portrait"
                  >
                    <span>🔍 Full Photo</span>
                  </button>

                  {/* Name Overlay inside Image Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading font-extrabold text-xl text-white group-hover:text-[#C9A227] transition-colors truncate">
                        {name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate">
                      {agent.headline || agent.brokerage_name || "Domestic Preferred Partner"}
                    </p>
                  </div>
                </div>

                {/* Card Info Section */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-3">
                    {/* Bio snippet */}
                    {agent.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic font-body">
                        "{agent.bio}"
                      </p>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block uppercase">Sales Volume</span>
                        <span className="text-[#0A2647] font-mono">{agent.sales_count || 0} Closed Homes</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block uppercase">Location</span>
                        <span className="text-[#0A2647] truncate block">{agent.office_city || "National"}</span>
                      </div>
                    </div>

                    {/* Specialty Chips */}
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {agent.specialties.slice(0, 3).map((spec, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upgraded Action Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="flex-1 bg-[#C9A227] hover:bg-[#b08d20] text-[#0A2647] font-heading font-black text-xs py-3.5 rounded-xl transition-all duration-200 text-center shadow-[0_4px_14px_rgba(201,162,39,0.35)] hover:scale-[1.02] flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <span>View Profile</span>
                      <ChevronRightIcon className="w-4 h-4 text-[#0A2647]" />
                    </Link>
                    <button
                      onClick={() => setContactAgent(agent)}
                      className="px-4 py-3.5 bg-slate-100 hover:bg-[#0A2647] hover:text-[#C9A227] text-[#0A2647] font-bold text-xs rounded-xl transition-all cursor-pointer"
                      title="Send Direct Inquiry"
                    >
                      ✉️ Message
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. FULL PORTRAIT LIGHTBOX MODAL */}
      {lightboxAgent && (
        <div
          onClick={() => setLightboxAgent(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-5 border border-[#C9A227]/40 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  {agentName(lightboxAgent)} — Full Portrait
                </h3>
                <p className="text-xs text-[#C9A227]">
                  {lightboxAgent.brokerage_name || "Domestic Partner Realtor"}
                </p>
              </div>
              <button
                onClick={() => setLightboxAgent(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Uncropped Full Image Box */}
            <div className="relative w-full max-h-[480px] h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {storageUrl(lightboxAgent.user?.avatar) ? (
                <Image
                  src={storageUrl(lightboxAgent.user?.avatar) || ""}
                  alt={agentName(lightboxAgent)}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="font-heading font-black text-6xl text-[#C9A227]">
                  {agentInitials(lightboxAgent)}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-slate-300 font-mono">
                📍 {lightboxAgent.office_city || "USA"} • ⭐ {lightboxAgent.rating || "5.0"}
              </div>
              <Link
                href={`/agents/${lightboxAgent.slug}`}
                className="bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-heading font-black text-xs px-6 py-3 rounded-xl transition-all shadow-gold"
              >
                Visit Full Realtor Profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. DIRECT INQUIRY MESSAGE MODAL */}
      {contactAgent && (
        <div
          onClick={() => setContactAgent(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5 border border-slate-200 relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0A2647]">
                  Direct Message to {agentName(contactAgent)}
                </h3>
                <p className="text-xs text-slate-500">Send an inquiry directly to this advisor.</p>
              </div>
              <button
                onClick={() => setContactAgent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Inquiry sent to ${agentName(contactAgent)}!`);
                setContactAgent(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A2647]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email / Phone</label>
                <input
                  required
                  type="text"
                  placeholder="john@example.com or (555) 123-4567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A2647]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  defaultValue={`Hi ${agentName(contactAgent)}, I am looking for assistance buying/selling a property in ${contactAgent.office_city || "your area"}.`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A2647]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C9A227] hover:bg-[#b08d20] text-[#0A2647] font-heading font-black text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-gold uppercase tracking-wider"
              >
                Send Direct Inquiry →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
