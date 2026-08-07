"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Search {
  id: number;
  name: string;
  location: string | null;
  priceMin: number | null;
  priceMax: number | null;
  beds: number | null;
  baths: number | null;
  newMatches: number;
  lastAlert: string | null;
  alertEnabled: boolean;
}

const EMPTY_FORM = { name: "", location: "", price_min: "", price_max: "", beds: "", baths: "" };

export default function BuyerSearchesPage() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);
  const { success, notifyError } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<Search[]>("/buyer/searches");
      setSearches(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your saved searches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost("/buyer/searches", {
        name: form.name,
        location: form.location || undefined,
        price_min: form.price_min ? Number(form.price_min) : undefined,
        price_max: form.price_max ? Number(form.price_max) : undefined,
        beds: form.beds ? Number(form.beds) : undefined,
        baths: form.baths ? Number(form.baths) : undefined,
      });
      success("Search saved.");
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (e) {
      notifyError(e, "Could not save this search.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this saved search?")) return;
    try {
      await apiDelete(`/buyer/searches/${id}`);
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      notifyError(e, "Could not delete this search.");
    }
  }

  async function handleToggleAlert(search: Search) {
    try {
      await apiPut(`/buyer/searches/${search.id}`, { alert_enabled: !search.alertEnabled });
    } catch (e) {
      notifyError(e, "Could not update this search.");
    }
    fetchData();
  }

  async function handleRun(id: number) {
    setRunningId(id);
    try {
      await apiPost(`/buyer/searches/${id}/run`);
      success("Search refreshed — new-match count updated.");
      fetchData();
    } catch (e) {
      notifyError(e, "Could not run this search.");
    } finally {
      setRunningId(null);
    }
  }

  const priceLabel = (min: number | null, max: number | null) => {
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}K`;
    if (min && max) return `${fmt(min)} — ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    if (max) return `Up to ${fmt(max)}`;
    return "Any price";
  };

  return (
    <BuyerLayout title="Saved Searches" subtitle="Manage your property search alerts.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
            <button onClick={fetchData} className="ml-3 underline font-semibold">Retry</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{searches.length} saved searches</span>
              <button onClick={() => setShowForm((v) => !v)} className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                {showForm ? "Cancel" : "+ New Search"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="text-xs font-medium text-slate-600 block mb-1">Search Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Miami Beach Homes" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">City or State</label>
                  <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Min Price</label>
                  <input type="number" value={form.price_min} onChange={(e) => setForm((f) => ({ ...f, price_min: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Max Price</label>
                  <input type="number" value={form.price_max} onChange={(e) => setForm((f) => ({ ...f, price_max: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Min Beds</label>
                  <input type="number" value={form.beds} onChange={(e) => setForm((f) => ({ ...f, beds: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Min Baths</label>
                  <input type="number" value={form.baths} onChange={(e) => setForm((f) => ({ ...f, baths: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div className="sm:col-span-3">
                  <button type="submit" disabled={saving} className="bg-[#0A2647] text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                    {saving ? "Saving..." : "Save Search"}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Search Name</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Criteria</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">New Matches</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Last Alert</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Alert</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searches.map((search) => (
                      <tr key={search.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <span className="font-semibold text-[#0A2647] text-sm">{search.name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-slate-600">
                            <p>{search.location || "Any location"}</p>
                            <p className="text-xs text-slate-400">
                              {priceLabel(search.priceMin, search.priceMax)}
                              {search.beds ? ` · ${search.beds}+ bd` : ""}
                              {search.baths ? ` / ${search.baths}+ ba` : ""}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-semibold ${search.newMatches > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                            {search.newMatches > 0 ? `${search.newMatches} new` : "None"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{search.lastAlert || "Never"}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleToggleAlert(search)} className={`text-xs px-2.5 py-1 rounded-full font-medium ${search.alertEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                            {search.alertEnabled ? "On" : "Off"}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleRun(search.id)} disabled={runningId === search.id} className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50">
                              {runningId === search.id ? "Running..." : "Run"}
                            </button>
                            <button onClick={() => handleDelete(search.id)} className="text-slate-400 hover:text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {searches.length === 0 && (
                <div className="p-8 text-center text-slate-400">No saved searches yet. Save a search to get alerted about new matches.</div>
              )}
            </div>
          </>
        )}
      </div>
    </BuyerLayout>
  );
}
