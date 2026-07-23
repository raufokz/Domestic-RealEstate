"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

/* ── Types ── */
interface LeadAssignee {
  id: number;
  first_name: string;
  last_name: string;
}

interface Lead {
  id: number;
  lead_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  type: string;
  status: string;
  priority: string;
  score: number;
  source: string | null;
  created_at: string;
  assignee: LeadAssignee | null;
  timeline?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/* ── Constants ── */
const STATUS_TABS = ["All", "AI Chat", "New", "Contacted", "Qualified", "Converted", "Lost"];

const tabToStatus: Record<string, string> = {
  New: "new",
  Contacted: "contacted",
  Qualified: "qualified",
  Converted: "converted",
  Lost: "lost",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  new:         { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
  contacted:   { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500" },
  qualified:   { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  converted:   { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  lost:        { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500" },
  scheduled:   { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  negotiation: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  archived:    { bg: "bg-slate-50",  text: "text-slate-600",  dot: "bg-slate-400" },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "text-red-600 font-bold",
  hot:    "text-orange-500 font-bold",
  high:   "text-amber-600 font-semibold",
  normal: "text-slate-600",
  warm:   "text-blue-500",
  low:    "text-slate-400",
  cold:   "text-slate-300",
};

/* ── Source Badge ── */
function SourceBadge({ source }: { source: string | null }) {
  const s = (source ?? "").toLowerCase();
  if (s === "ai_chat" || s === "ai chat") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#C9A227]/15 to-[#C9A227]/10 border border-[#C9A227]/30 text-[11px] font-semibold text-[#9a7a1e]">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        AI Chat
      </span>
    );
  }
  if (s === "referral") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[11px] font-medium text-green-700">
        👥 Referral
      </span>
    );
  }
  if (s.includes("organic") || s.includes("website")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-700">
        🌐 Organic
      </span>
    );
  }
  if (s === "manual") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-500">
        ✏️ Manual
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-500 capitalize">
      {source || "—"}
    </span>
  );
}

/* ── Score Bar ── */
function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "from-green-400 to-green-500" : score >= 40 ? "from-amber-400 to-amber-500" : "from-red-400 to-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-500"}`}>
        {score}
      </span>
    </div>
  );
}

/* ── Skeleton Row ── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-slate-100 rounded-full" style={{ width: `${[40, 70, 80, 45, 55, 35, 45, 55, 30][i] ?? 50}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Stats Card ── */
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-tight tabular-nums">{value}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function LeadsPage() {
  const { success, notifyError } = useToast();
  const [leads, setLeads]             = useState<Lead[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("All");
  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [aiChatCount, setAiChatCount] = useState<number | null>(0);
  const [selected, setSelected]       = useState<number[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [creating, setCreating]       = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    type: "buyer",
    source: "manual",
  });

  const fetchLeads = useCallback(async (page: number, tab: string, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "25");

      if (tab === "AI Chat") {
        params.set("source", "ai_chat");
      } else if (tab !== "All") {
        params.set("status", tabToStatus[tab] || tab.toLowerCase());
      }
      if (q.trim()) params.set("search", q.trim());

      const res = await apiGet<PaginatedResponse<Lead>>(`/admin/leads?${params.toString()}`);
      setLeads(res.data);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Fetch AI chat count for the badge */
  const fetchAiCount = useCallback(async () => {
    try {
      const res = await apiGet<PaginatedResponse<Lead>>("/admin/leads?source=ai_chat&per_page=1");
      setAiChatCount(res.total);
    } catch (e) {
      // Badge only: fall back to null so the UI shows a dash rather than a misleading 0.
      console.error("Could not load the AI chat lead count:", e);
      setAiChatCount(null);
    }
  }, []);

  useEffect(() => {
    fetchLeads(currentPage, activeTab, search);
    fetchAiCount();
  }, [currentPage, activeTab, fetchLeads, fetchAiCount]);

  const handleSearch = () => {
    setCurrentPage(1); setSelected([]);
    fetchLeads(1, activeTab, search);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab); setCurrentPage(1); setSelected([]);
  };

  const toggleSelect  = (i: number) =>
    setSelected((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  const toggleAll = () =>
    setSelected(selected.length === leads.length ? [] : leads.map((_, i) => i));

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      notifyError(new Error("First name, last name, and email are required.")); return;
    }
    try {
      setCreating(true);
      await apiPost("/leads", form);
      success("Lead created.", "CRM");
      setShowCreate(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", type: "buyer", source: "manual" });
      await fetchLeads(1, activeTab, search);
    } catch (err) {
      notifyError(err, "Lead could not be created.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await apiDelete(`/leads/${id}`);
      success("Lead deleted.", "CRM");
      await fetchLeads(currentPage, activeTab, search);
    } catch (err) {
      notifyError(err, "Lead could not be deleted.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} selected leads?`)) return;
    try {
      for (const idx of selected) {
        const lead = leads[idx];
        if (lead) await apiDelete(`/leads/${lead.id}`);
      }
      success("Selected leads deleted.", "CRM");
      setSelected([]);
      await fetchLeads(currentPage, activeTab, search);
    } catch (err) {
      notifyError(err, "Bulk delete failed.");
    }
  };

  const aiLeads  = leads.filter((l) => (l.source ?? "").toLowerCase() === "ai_chat");
  const newLeads = leads.filter((l) => l.status === "new").length;

  return (
    <AdminLayout title="Lead Management">

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Leads"     value={totalCount}  icon="👥" color="bg-blue-50" />
        <StatCard label="AI Chat Leads"   value={aiChatCount ?? "—"} icon="🤖" color="bg-amber-50" />
        <StatCard label="New This View"   value={newLeads}    icon="✨" color="bg-green-50" />
        <StatCard label="Pages"           value={`${currentPage}/${totalPages}`} icon="📄" color="bg-purple-50" />
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-5 overflow-hidden">
        <div className="flex overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            const isAiTab = tab === "AI Chat";
            return (
              <button
                key={tab}
                id={`lead-tab-${tab.toLowerCase().replace(/\s/g, "-")}`}
                onClick={() => handleTabChange(tab)}
                className={`relative px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 ${
                  isActive
                    ? "border-[#C9A227] text-[#0A2647] bg-[#C9A227]/5"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  {isAiTab && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                  {tab}
                  {tab === "All" && totalCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#C9A227] text-white" : "bg-slate-100 text-slate-500"}`}>
                      {totalCount}
                    </span>
                  )}
                  {isAiTab && (aiChatCount ?? 0) > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {aiChatCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bulk Action Bar ── */}
      {selected.length > 0 && (
        <div className="bg-[#0A2647] text-white rounded-xl px-5 py-3 mb-4 flex items-center gap-4 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span><span className="font-bold text-[#C9A227]">{selected.length}</span> leads selected</span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="ml-auto px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors"
          >
            Delete Selected
          </button>
          <button onClick={() => setSelected([])} className="text-white/50 hover:text-white text-sm transition-colors">Cancel</button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="lead-search-input"
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] w-64 transition-all"
            />
          </div>
          <button
            id="lead-search-btn"
            onClick={handleSearch}
            className="px-4 py-2.5 bg-[#0A2647] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3a5c] transition-colors shadow-sm"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/crm/bulk-email"
            className="px-4 py-2.5 bg-[#0A2647] text-white rounded-xl text-sm font-semibold hover:bg-[#0c2f57] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>✉️</span> Bulk Email Follow-Up
          </Link>
          <Link
            href="/admin/leads/import"
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            📁 Import
          </Link>
          <button
            id="lead-add-btn"
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#C9A227] to-[#b8911f] text-white rounded-xl text-sm font-semibold hover:shadow-[0_4px_16px_rgba(201,162,39,0.4)] transition-all"
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === leads.length && leads.length > 0}
                    onChange={toggleAll}
                    className="rounded border-slate-300 accent-[#C9A227]"
                  />
                </th>
                {["Name & ID", "Contact", "Type", "Status", "Priority", "Score", "Source", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-medium">No leads found</p>
                      <p className="text-xs">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead, idx) => {
                  const sc = STATUS_COLORS[lead.status] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
                  const isAiChat = (lead.source ?? "").toLowerCase() === "ai_chat";
                  return (
                    <tr
                      key={lead.id}
                      className={`group hover:bg-slate-50/80 transition-colors duration-150 ${isAiChat ? "bg-amber-50/30" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.includes(idx)}
                          onChange={() => toggleSelect(idx)}
                          className="rounded border-slate-300 accent-[#C9A227]"
                        />
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="font-semibold text-[#0A2647] hover:text-[#C9A227] transition-colors text-sm leading-tight"
                        >
                          {lead.first_name} {lead.last_name}
                        </Link>
                        <p className="text-[10px] text-slate-300 font-mono mt-0.5">{lead.lead_number}</p>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5 text-sm text-slate-500">{lead.email}</td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-full capitalize">
                          {lead.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] uppercase tracking-wide font-semibold ${PRIORITY_COLORS[lead.priority] ?? "text-slate-500"}`}>
                          {lead.priority}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3.5">
                        <ScoreBar score={lead.score} />
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3.5">
                        <SourceBadge source={lead.source} />
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3.5 text-[12px] text-slate-400 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="text-[12px] font-semibold text-[#C9A227] hover:text-[#9a7a1e] transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-[12px] font-semibold text-red-400 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-400">
              Page <span className="font-semibold text-slate-600">{currentPage}</span> of <span className="font-semibold text-slate-600">{totalPages}</span>
              <span className="ml-2 text-slate-300">·</span>
              <span className="ml-2">{totalCount.toLocaleString()} total</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── AI Chat Banner (visible only on AI Chat tab) ── */}
      {activeTab === "AI Chat" && !loading && (
        <div className="mt-4 bg-gradient-to-r from-[#0A2647] to-[#0d3260] rounded-xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-[#C9A227]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Chat Lead Capture</h3>
            <p className="text-white/50 text-xs mt-0.5">
              These leads were automatically captured through the website chatbot widget. They are pre-qualified and ready for follow-up.
            </p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <span className="text-3xl font-bold text-[#C9A227] tabular-nums">{aiChatCount ?? "—"}</span>
            <p className="text-white/40 text-[10px] text-right">AI leads</p>
          </div>
        </div>
      )}

      {/* ── Create Lead Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0A2647] to-[#0d3260] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Add New Lead</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["first_name", "last_name"] as const).map((f) => (
                  <div key={f}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 capitalize">
                      {f.replace("_", " ")} *
                    </label>
                    <input
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] transition-all"
                      value={form[f]}
                      placeholder={f === "first_name" ? "John" : "Doe"}
                      onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              {(["email", "phone"] as const).map((f) => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 capitalize">
                    {f} {f === "email" && "*"}
                  </label>
                  <input
                    type={f === "email" ? "email" : "tel"}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] transition-all"
                    value={form[f]}
                    placeholder={f === "email" ? "john@example.com" : "+1 (555) 000-0000"}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Type</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] transition-all appearance-none"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="investor">Investor</option>
                    <option value="realtor">Realtor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Source</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] transition-all appearance-none"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  >
                    <option value="manual">Manual</option>
                    <option value="ai_chat">AI Chat</option>
                    <option value="referral">Referral</option>
                    <option value="organic">Organic</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button
                id="lead-create-submit-btn"
                onClick={handleCreate}
                disabled={creating}
                className="px-5 py-2 bg-gradient-to-r from-[#C9A227] to-[#b8911f] text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-[0_4px_16px_rgba(201,162,39,0.4)] transition-all"
              >
                {creating ? "Saving…" : "Create Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
