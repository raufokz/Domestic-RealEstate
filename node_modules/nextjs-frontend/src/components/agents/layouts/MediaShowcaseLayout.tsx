"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { PlayIcon, StarIcon, ShieldCheckIcon, ChevronRightIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

export default function MediaShowcaseLayout({ agents }: LayoutProps) {
  const [activeVideoModal, setActiveVideoModal] = useState<PublicAgent | null>(null);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#9E7D19] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          <PlayIcon className="w-3.5 h-3.5 text-[#C9A227]" />
          Video Bio & Media Directory
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0A2647]">
          Watch Agent <span className="text-[#C9A227]">Video Introductions</span>
        </h2>
        <p className="text-slate-600 text-sm font-body">
          Watch 60-second introduction reels, neighborhood walkthroughs, and client case studies from our top partner agents.
        </p>
      </div>

      {/* Grid of Video Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map((agent) => {
          const avatar = storageUrl(agent.user?.avatar);
          const name = agentName(agent);
          const rating = agent.rating != null ? Number(agent.rating) : 5.0;

          return (
            <div
              key={agent.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Top Video Thumbnail Container */}
              <div
                onClick={() => setActiveVideoModal(agent)}
                className="relative w-full h-56 bg-slate-900 cursor-pointer overflow-hidden group/thumb"
              >
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={name}
                    fill
                    className="object-cover group-hover/thumb:scale-110 transition-transform duration-500 opacity-90"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0A2647] flex items-center justify-center font-heading font-black text-3xl text-[#C9A227]">
                    {agentInitials(agent)}
                  </div>
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#C9A227] text-[#07162C] flex items-center justify-center shadow-[0_0_25px_rgba(201,162,39,0.7)] group-hover/thumb:scale-110 transition-transform">
                    <PlayIcon className="w-6 h-6 ml-0.5" />
                  </div>
                </div>

                {/* Duration Pill */}
                <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-slate-700">
                  ▶ 1:15 Intro Reel
                </div>

                {/* Verified Pill */}
                <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  Verified Reel
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-lg text-[#0A2647]">{name}</h3>
                    <span className="text-xs font-bold text-[#0A2647] flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {agent.headline || agent.brokerage_name || "Domestic Partner Agent"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100 font-bold">
                  <span>{agent.sales_count || 0} Homes Sold</span>
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="text-[#C9A227] hover:text-[#0A2647] flex items-center gap-1 transition-colors"
                  >
                    <span>Full Profile</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Video Modal Mockup */}
      {activeVideoModal && (
        <div
          onClick={() => setActiveVideoModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-[#C9A227]/40 text-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  🎬 {agentName(activeVideoModal)} — Video Introduction
                </h3>
                <p className="text-xs text-[#C9A227]">
                  {activeVideoModal.headline || "Luxury Real Estate Partner"}
                </p>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Player Mockup Box */}
            <div className="w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
              <PlayIcon className="w-16 h-16 text-[#C9A227] animate-pulse" />
              <p className="text-sm font-bold text-slate-300">
                Playing Agent Intro Reel for {agentName(activeVideoModal)}...
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href={`/agents/${activeVideoModal.slug}`}
                className="bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-heading font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all"
              >
                Contact Agent Now →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
