"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { StarIcon, ShieldCheckIcon, AwardIcon, ChevronRightIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

export default function MagazineShowcaseLayout({ agents }: LayoutProps) {
  const [selectedAgentForContact, setSelectedAgentForContact] = useState<PublicAgent | null>(null);

  const featuredAgent = agents.find((a) => a.is_featured) || agents[0];

  return (
    <div className="space-y-16">
      {/* EDITORIAL HERO SPOTLIGHT */}
      {featuredAgent && (
        <section className="relative bg-[#07162C] text-white rounded-3xl overflow-hidden shadow-2xl border border-[#C9A227]/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Left Cover Image */}
            <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-slate-900 overflow-hidden">
              {storageUrl(featuredAgent.user?.avatar) ? (
                <Image
                  src={storageUrl(featuredAgent.user?.avatar) || ""}
                  alt={agentName(featuredAgent)}
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-heading font-black text-5xl text-[#C9A227]">
                  {agentInitials(featuredAgent)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#07162C] via-transparent to-transparent opacity-80 lg:opacity-90" />
              
              <div className="absolute top-4 left-4 bg-[#C9A227] text-[#07162C] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-gold">
                ★ Cover Story Partner
              </div>
            </div>

            {/* Right Editorial Text & Metrics */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#C9A227] uppercase tracking-widest">
                  <AwardIcon className="w-4 h-4 text-[#C9A227]" />
                  <span>Domestic Editorial Spotlight</span>
                </div>

                <h2 className="font-heading text-3xl sm:text-5xl font-extrabold leading-tight text-white">
                  {agentName(featuredAgent)}
                </h2>

                <p className="text-sm sm:text-base text-[#C9A227] font-semibold italic">
                  "{featuredAgent.headline || "Leading the Next Generation of Real Estate Advisors"}"
                </p>

                <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed max-w-xl line-clamp-3">
                  {featuredAgent.bio ||
                    "Recognized among top producing real estate partners with an exceptional record of luxury property sales, client satisfaction, and neighborhood expertise."}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Career Sales</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono">
                    {featuredAgent.sales_count || 50}+ Closed
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Client Score</span>
                  <span className="text-base sm:text-lg font-black text-[#C9A227] flex items-center gap-1 font-mono">
                    <StarIcon className="w-4 h-4 fill-[#C9A227]" />
                    {featuredAgent.rating || "5.0"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Specialty Zone</span>
                  <span className="text-base sm:text-lg font-black text-white truncate block font-mono">
                    {featuredAgent.office_city || "Luxury Estates"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/agents/${featuredAgent.slug}`}
                  className="bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-heading font-black text-xs px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(201,162,39,0.45)] hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Read Full Cover Profile</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setSelectedAgentForContact(featuredAgent)}
                  className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs px-6 py-3.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  Direct Inquiry
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MAGAZINE EDITORIAL GRID */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-[#0A2647]">
              Featured Partner Directory
            </h3>
            <p className="text-xs text-slate-500 font-body">
              Editorial luxury profiles of vetted top real estate advisors.
            </p>
          </div>
          <span className="bg-[#0A2647] text-[#C9A227] text-xs font-bold px-3 py-1 rounded-full">
            {agents.length} Vetted Agents
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => {
            const avatar = storageUrl(agent.user?.avatar);
            const name = agentName(agent);
            const rating = agent.rating != null ? Number(agent.rating) : 5.0;

            return (
              <div
                key={agent.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between"
              >
                {/* Image Cover Container */}
                <div className="relative w-full h-80 bg-slate-900 overflow-hidden">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0A2647] flex items-center justify-center font-heading font-black text-4xl text-[#C9A227]">
                      {agentInitials(agent)}
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Floating Rating Pill */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-[#0A2647] shadow-md flex items-center gap-1">
                    <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                    <span>{rating.toFixed(1)}</span>
                  </div>

                  {/* Bottom Text inside Image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-heading font-extrabold text-xl text-white group-hover:text-[#C9A227] transition-colors">
                        {name}
                      </h4>
                      <ShieldCheckIcon className="w-4 h-4 text-[#C9A227] shrink-0" title="Verified Advisor" />
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {agent.headline || agent.brokerage_name || "Domestic Partner Realty"}
                    </p>
                  </div>
                </div>

                {/* Card Info Section */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-3">
                    {agent.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic font-body">
                        "{agent.bio}"
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block uppercase">Volume</span>
                        <span className="text-[#0A2647]">{agent.sales_count || 0} Sales</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block uppercase">Location</span>
                        <span className="text-[#0A2647] truncate block">{agent.office_city || "National"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Upgraded Vibrant Gold View Profile Button */}
                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="flex-1 bg-[#C9A227] hover:bg-[#b08d20] text-[#0A2647] font-heading font-black text-xs py-3.5 rounded-xl transition-all duration-200 text-center shadow-[0_4px_14px_rgba(201,162,39,0.35)] hover:scale-[1.02] flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <span>View Profile</span>
                      <ChevronRightIcon className="w-4 h-4 text-[#0A2647]" />
                    </Link>
                    <button
                      onClick={() => setSelectedAgentForContact(agent)}
                      className="px-4 py-3.5 bg-slate-100 hover:bg-[#0A2647] hover:text-[#C9A227] text-[#0A2647] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                      title="Quick Inquiry"
                    >
                      ✉️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK INQUIRY MODAL */}
      {selectedAgentForContact && (
        <div
          onClick={() => setSelectedAgentForContact(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5 border border-slate-200 relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0A2647]">
                  Contact {agentName(selectedAgentForContact)}
                </h3>
                <p className="text-xs text-slate-500">Direct Realtor Inquiry Form</p>
              </div>
              <button
                onClick={() => setSelectedAgentForContact(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert("Inquiry sent to agent!"); setSelectedAgentForContact(null); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input required type="text" placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A2647]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email / Phone</label>
                <input required type="text" placeholder="john@example.com or (555) 123-4567" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A2647]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                <textarea rows={3} defaultValue={`Hi ${agentName(selectedAgentForContact)}, I would like to consult with you regarding buying/selling a property.`} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A2647]" />
              </div>
              <button type="submit" className="w-full bg-[#C9A227] hover:bg-[#b08d20] text-[#0A2647] font-heading font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-gold uppercase tracking-wider">
                Send Direct Message →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
