"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicAgent } from "@/lib/agents";
import { agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import { ArrowUpDownIcon, StarIcon, AwardIcon, ExternalLinkIcon } from "../AgentIcons";

interface LayoutProps {
  agents: PublicAgent[];
}

type SortField = "rating" | "sales_count" | "years_experience" | "name";

export default function CompactMatrixLayout({ agents }: LayoutProps) {
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedAgents = [...agents].sort((a, b) => {
    let valA: any = 0;
    let valB: any = 0;

    if (sortField === "rating") {
      valA = Number(a.rating || 0);
      valB = Number(b.rating || 0);
    } else if (sortField === "sales_count") {
      valA = a.sales_count || 0;
      valB = b.sales_count || 0;
    } else if (sortField === "years_experience") {
      valA = a.years_experience || 0;
      valB = b.years_experience || 0;
    } else if (sortField === "name") {
      valA = agentName(a).toLowerCase();
      valB = agentName(b).toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-[#0A2647]">
            Compact Agent Data Matrix
          </h3>
          <p className="text-xs text-slate-500 font-body">
            Compare real estate agents side-by-side. Click headers to sort.
          </p>
        </div>

        {/* Sort Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Sort by:</span>
          {(["rating", "sales_count", "years_experience", "name"] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                sortField === field
                  ? "bg-[#0A2647] text-[#C9A227] shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="capitalize">{field.replace("_", " ")}</span>
              <ArrowUpDownIcon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Agent Profile</th>
              <th className="py-3 px-4">Brokerage</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Sales Volume</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedAgents.map((agent) => {
              const avatar = storageUrl(agent.user?.avatar);
              const name = agentName(agent);
              const rating = agent.rating != null ? Number(agent.rating) : 0;

              return (
                <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Agent Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0A2647] text-[#C9A227] font-bold flex items-center justify-center overflow-hidden shrink-0">
                        {avatar ? (
                          <Image src={avatar} alt={name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          agentInitials(agent)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#0A2647] text-sm">{name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{agent.headline || "Partner Agent"}</div>
                      </div>
                    </div>
                  </td>

                  {/* Brokerage */}
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    {agent.brokerage_name || "Domestic Partner Realty"}
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-4 font-bold text-[#0A2647]">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                      <span>{rating > 0 ? rating.toFixed(1) : "5.0"}</span>
                      <span className="text-slate-400 font-normal">({agent.review_count || 0})</span>
                    </div>
                  </td>

                  {/* Sales Volume */}
                  <td className="py-4 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-1">
                      <AwardIcon className="w-3.5 h-3.5 text-[#0A2647]" />
                      <span>{agent.sales_count || 0} Closed Deals</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4 font-medium text-slate-600">
                    {agent.office_city ? `${agent.office_city}, ${agent.office_state || ""}` : "National"}
                  </td>

                  {/* Action Button */}
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="inline-flex items-center gap-1 bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                    >
                      <span>Profile</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
