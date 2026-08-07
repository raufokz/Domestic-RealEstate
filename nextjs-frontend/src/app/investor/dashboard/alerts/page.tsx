"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Alert {
  id: number;
  name: string;
  location: string | null;
  priceMin: number | null;
  priceMax: number | null;
  newMatches: number;
  lastAlert: string | null;
  alertEnabled: boolean;
}

const EMPTY_FORM = { name: "", location: "", price_min: "", price_max: "" };

export default function InvestorAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
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
      const result = await apiGet<Alert[]>("/investor/alerts");
      setAlerts(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your alerts.");
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
      await apiPost("/investor/alerts", {
        name: form.name,
        location: form.location || undefined,
        price_min: form.price_min ? Number(form.price_min) : undefined,
        price_max: form.price_max ? Number(form.price_max) : undefined,
      });
      success("Alert created.");
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (e) {
      notifyError(e, "Could not create this alert.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(alert: Alert) {
    try {
      await apiPut(`/investor/alerts/${alert.id}`, { alert_enabled: !alert.alertEnabled });
    } catch (e) {
      notifyError(e, "Could not update this alert.");
    }
    fetchData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this alert?")) return;
    try {
      await apiDelete(`/investor/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      notifyError(e, "Could not delete this alert.");
    }
  }

  async function handleRun(id: number) {
    setRunningId(id);
    try {
      await apiPost(`/investor/alerts/${id}/run`);
      success("Alert refreshed.");
      fetchData();
    } catch (e) {
      notifyError(e, "Could not run this alert.");
    } finally {
      setRunningId(null);
    }
  }

  return (
    <InvestorLayout title="Investment Alerts" subtitle="Get notified when new listings match your criteria.">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 mr-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <span className="text-xs text-slate-500">Active Alerts</span>
                  <p className="text-2xl font-bold text-[#0A2647] mt-1">{alerts.filter((a) => a.alertEnabled).length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <span className="text-xs text-slate-500">Total New Matches</span>
                  <p className="text-2xl font-bold text-[#0A2647] mt-1">{alerts.reduce((sum, a) => sum + a.newMatches, 0)}</p>
                </div>
              </div>
              <button onClick={() => setShowForm((v) => !v)} className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                {showForm ? "Cancel" : "+ Create Alert"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-600 block mb-1">Alert Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Austin Multi-Family" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">City or State</label>
                  <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Min Price</label>
                    <input type="number" value={form.price_min} onChange={(e) => setForm((f) => ({ ...f, price_min: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Max Price</label>
                    <input type="number" value={form.price_max} onChange={(e) => setForm((f) => ({ ...f, price_max: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <button type="submit" disabled={saving} className="bg-[#0A2647] text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                    {saving ? "Saving..." : "Create Alert"}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Alert</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Criteria</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Matches</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{alert.name}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {alert.location || "Any location"}
                          {alert.priceMin || alert.priceMax ? ` · $${(alert.priceMin ?? 0).toLocaleString()}–$${(alert.priceMax ?? 0).toLocaleString()}` : ""}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-bold ${alert.newMatches > 0 ? "text-emerald-600" : "text-slate-400"}`}>{alert.newMatches}</span>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleToggle(alert)} className={`text-xs px-2.5 py-1 rounded-full font-medium ${alert.alertEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                            {alert.alertEnabled ? "Active" : "Paused"}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleRun(alert.id)} disabled={runningId === alert.id} className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50">
                              {runningId === alert.id ? "Running..." : "Run"}
                            </button>
                            <button onClick={() => handleDelete(alert.id)} className="text-slate-400 hover:text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {alerts.length === 0 && (
                <div className="p-8 text-center text-slate-400">No alerts set up yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </InvestorLayout>
  );
}
