"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { StarIcon, MapPinIcon, ArrowUpRightIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

export default function MinimalStudioLayout({ agents }: LayoutProps) {
  return (
    <div className="space-y-10">
      {/* Studio Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0A2647] tracking-tight">
          Verified Agent Roster
        </h2>
        <p className="text-slate-500 text-sm font-body">
          Select a verified partner agent to view full performance statistics, portfolio, and contact info.
        </p>
      </div>

      {/* Grid of Minimal Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map((agent) => {
          const avatar = storageUrl(agent.user?.avatar);
          const name = agentName(agent);
          const rating = agent.rating != null ? Number(agent.rating) : 5.0;

          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top Image Container */}
              <div className="relative w-full h-64 bg-slate-100 overflow-hidden">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0A2647] flex items-center justify-center text-[#C9A227] font-heading font-black text-3xl">
                    {agentInitials(agent)}
                  </div>
                )}

                {/* Rating Floating Pill */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-[#0A2647] shadow-md flex items-center gap-1">
                  <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                  <span>{rating.toFixed(1)}</span>
                </div>

                {/* City Tag */}
                {agent.office_city && (
                  <div className="absolute top-3 right-3 bg-[#0A2647]/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3 text-[#C9A227]" />
                    {agent.office_city}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-[#0A2647] group-hover:text-[#C9A227] transition-colors">
                      {name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#C9A227] text-slate-700 group-hover:text-[#0A2647] flex items-center justify-center transition-colors">
                      <ArrowUpRightIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {agent.headline || agent.brokerage_name || "Domestic Partner"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100 font-semibold">
                  <span>{agent.sales_count || 0} Homes Sold</span>
                  <span className="text-[#C9A227] font-bold">View Profile →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
