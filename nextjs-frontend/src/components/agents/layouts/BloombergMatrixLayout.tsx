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

export default function BloombergMatrixLayout({ agents }: LayoutProps) {
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortAsc, setSortAsc] = useState(false);
  const [comparedAgentIds, setComparedAgentIds] = useState<number[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const toggleCompare = (id: number) => {
    if (comparedAgentIds.includes(id)) {
      setComparedAgentIds(comparedAgentIds.filter((item) => item !== id));
    } else {
      if (comparedAgentIds.length >= 3) {
        alert("You can compare up to 3 agents at a time!");
        return;
      }
      setComparedAgentIds([...comparedAgentIds, id]);
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

  const comparedAgentsList = agents.filter((a) => comparedAgentIds.includes(a.id));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-xl text-[#0A2647]">
              Bloomberg Financial Performance Matrix
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              Side-By-Side Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 font-body">
            Compare real estate agents side-by-side. Click column headers to sort instantly.
          </p>
        </div>

        {/* Sort Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Sort Matrix:</span>
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

      {/* Responsive Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Compare</th>
              <th className="py-3 px-4">Agent Profile</th>
              <th className="py-3 px-4">Brokerage</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Sales Volume</th>
              <th className="py-3 px-4">Market Share Bar</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedAgents.map((agent) => {
              const avatar = storageUrl(agent.user?.avatar);
              const name = agentName(agent);
              const rating = agent.rating != null ? Number(agent.rating) : 5.0;
              const isChecked = comparedAgentIds.includes(agent.id);

              const sales = agent.sales_count || 10;
              const barPercent = Math.min(100, Math.max(25, sales * 2));

              return (
                <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Checkbox for Compare */}
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCompare(agent.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0A2647] focus:ring-0 cursor-pointer"
                    />
                  </td>

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
                      <span>{rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({agent.review_count || 0})</span>
                    </div>
                  </td>

                  {/* Sales Volume */}
                  <td className="py-4 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-1 font-mono">
                      <AwardIcon className="w-3.5 h-3.5 text-[#0A2647]" />
                      <span>{agent.sales_count || 0} Closed</span>
                    </div>
                  </td>

                  {/* Market Share Progress Bar */}
                  <td className="py-4 px-4">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Share</span>
                        <span>{barPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${barPercent}%` }}
                          className="h-full bg-gradient-to-r from-[#0A2647] to-[#C9A227] rounded-full"
                        />
                      </div>
                    </div>
                  </td>

                  {/* Upgraded Action Button */}
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="inline-flex items-center gap-1 bg-[#C9A227] hover:bg-[#b08d20] text-[#0A2647] text-xs font-black px-4 py-2 rounded-xl transition-all shadow-[0_2px_10px_rgba(201,162,39,0.3)] hover:scale-105 uppercase tracking-wider"
                    >
                      <span>Profile</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5 text-[#0A2647]" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FLOATING AGENT COMPARISON DRAWER */}
      {comparedAgentsList.length > 0 && (
        <div className="bg-[#07162C] text-white p-4 sm:p-6 rounded-3xl border border-[#C9A227]/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-heading font-extrabold text-[#C9A227]">
              Comparing ({comparedAgentsList.length}/3):
            </span>
            <div className="flex items-center gap-3">
              {comparedAgentsList.map((a) => (
                <span
                  key={a.id}
                  className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1"
                >
                  <span>{agentName(a)}</span>
                  <button onClick={() => toggleCompare(a.id)} className="ml-1 text-slate-400 hover:text-white cursor-pointer">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => alert(`Comparison breakdown for ${comparedAgentsList.map((a) => agentName(a)).join(", ")}!`)}
            className="bg-[#C9A227] hover:bg-amber-400 text-[#07162C] font-heading font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-gold cursor-pointer"
          >
            Launch Side-By-Side Comparison Matrix →
          </button>
        </div>
      )}
    </div>
  );
}
