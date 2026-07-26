"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { useFetch } from "@/hooks/useFetch";
import Link from "next/link";

interface Lead {
  id: number;
  lead_number: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  score: number;
  source: string;
  type: string;
  priority: string;
  created_at: string;
}

const KANBAN_STAGES = [
  { key: "new", label: "New", color: "border-blue-500", headerBg: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "border-cyan-500", headerBg: "bg-cyan-500" },
  { key: "qualified", label: "Qualified", color: "border-emerald-500", headerBg: "bg-emerald-500" },
  { key: "negotiation", label: "Negotiation", color: "border-amber-500", headerBg: "bg-amber-500" },
  { key: "converted", label: "Converted", color: "border-green-600", headerBg: "bg-green-600" },
];

export default function AgentLeadsPage() {
  const { data, loading } = useFetch<{ data: Lead[] }>("/leads?per_page=50");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filterType, setFilterType] = useState("all");

  const leads = data?.data || [];
  const filtered = filterType === "all" ? leads : leads.filter((l) => l.type === filterType);

  return (
    <AgentLayout title="My Leads" subtitle="Track and manage your leads through the pipeline">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button onClick={() => setView("kanban")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === "kanban" ? "bg-[#0A2647] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              Kanban Board
            </button>
            <button onClick={() => setView("list")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === "list" ? "bg-[#0A2647] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              List View
            </button>
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none">
            <option value="all">All Types</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="investor">Investor</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading leads...</div>
        ) : view === "kanban" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_STAGES.map((stage) => {
              const stageLeads = filtered.filter((l) => l.status === stage.key);
              return (
                <div key={stage.key} className="w-72 flex-shrink-0">
                  <div className={`rounded-xl border-t-4 ${stage.color} bg-white border border-slate-200`}>
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stage.headerBg}`} />
                        <h3 className="font-semibold text-[#0A2647] text-sm">{stage.label}</h3>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{stageLeads.length}</span>
                    </div>
                    <div className="p-3 space-y-3 min-h-[200px]">
                      {stageLeads.length === 0 && (
                        <div className="text-center text-slate-300 text-sm py-8">No leads</div>
                      )}
                      {stageLeads.map((lead) => (
                        <Link key={lead.id} href={`/agent/dashboard/leads/${lead.id}`} className="block bg-slate-50 rounded-lg p-3 border border-slate-100 hover:shadow-md transition cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{lead.name.split(" ").map((n: string) => n[0]).join("")}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#0A2647] text-sm truncate">{lead.name}</h4>
                              <p className="text-slate-500 text-xs truncate">{lead.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${lead.score >= 80 ? "bg-green-100 text-green-700" : lead.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{lead.score}</span>
                            <span className="text-xs text-slate-400">{lead.source}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0A2647] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Lead</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0A2647] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{lead.name.split(" ").map((n: string) => n[0]).join("")}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{lead.name}</p>
                          <p className="text-slate-500 text-xs">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full capitalize">{lead.type}</span></td>
                    <td className="px-4 py-3"><span className={`text-sm font-bold ${lead.score >= 80 ? "text-green-600" : lead.score >= 60 ? "text-amber-600" : "text-slate-500"}`}>{lead.score}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-600">{lead.source}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                        lead.status === "new" ? "bg-blue-100 text-blue-700" :
                        lead.status === "contacted" ? "bg-cyan-100 text-cyan-700" :
                        lead.status === "qualified" ? "bg-green-100 text-green-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{lead.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/agent/dashboard/leads/${lead.id}`} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AgentLayout>
  );
}
