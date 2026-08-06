"use client";

import WholesalerLayout from "@/components/wholesaler/WholesalerLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";

interface Buyer {
  id: number;
  wholesaler_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_areas: string[] | null;
  property_types: string[] | null;
  criteria: string | null;
  deals_closed: number;
  last_active_at: string | null;
}

const emptyForm = { name: "", email: "", phone: "", budget_min: "", budget_max: "", criteria: "" };

function formatBudget(min: number | null, max: number | null): string {
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return "—";
}

export default function WholesalerBuyersPage() {
  const { user } = useAuth();
  const { success, notifyError } = useToast();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Buyer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<{ data: Buyer[] }>("/wholesaler/buyers");
      setBuyers(result.data ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your buyer list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(buyer: Buyer) {
    setEditing(buyer);
    setForm({
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone || "",
      budget_min: buyer.budget_min ? String(buyer.budget_min) : "",
      budget_max: buyer.budget_max ? String(buyer.budget_max) : "",
      criteria: buyer.criteria || "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      notifyError(null, "Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        budget_min: form.budget_min ? Number(form.budget_min) : undefined,
        budget_max: form.budget_max ? Number(form.budget_max) : undefined,
        criteria: form.criteria.trim() || undefined,
      };
      if (editing) {
        await apiPut(`/wholesaler/buyers/${editing.id}`, payload);
        success("Buyer updated.", "Buyer List");
      } else {
        await apiPost("/wholesaler/buyers", payload);
        success("Buyer added.", "Buyer List");
      }
      setShowModal(false);
      fetchBuyers();
    } catch (e) {
      notifyError(e, "Could not save this buyer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WholesalerLayout title="Buyer List" subtitle="Your network of active real estate investors.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{buyers.length} buyer{buyers.length === 1 ? "" : "s"} in your network</span>
          <button onClick={openAdd} className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + Add Buyer
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-700 text-sm">{error}</p>
              <button onClick={fetchBuyers} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:opacity-90">
                Retry
              </button>
            </div>
          ) : buyers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">No buyers yet. Add your first cash buyer to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Buyer</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Budget</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Criteria</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Deals Closed</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#0A2647] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {buyer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0A2647] text-sm">{buyer.name}</p>
                            <p className="text-slate-500 text-xs">{buyer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[#0A2647]">{formatBudget(buyer.budget_min, buyer.budget_max)}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{buyer.criteria || "—"}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{buyer.deals_closed}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a href={`mailto:${buyer.email}`} className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Email</a>
                          {buyer.wholesaler_id === user?.id && (
                            <button onClick={() => openEdit(buyer)} className="text-slate-400 hover:text-[#0A2647] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Edit</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#0A2647]">{editing ? "Edit Buyer" : "Add Buyer"}</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Min ($)</label>
                <input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Max ($)</label>
                <input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Buying Criteria</label>
              <textarea value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} rows={2} placeholder="e.g. Single Family, Fix & Flip" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} disabled={saving} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </WholesalerLayout>
  );
}
