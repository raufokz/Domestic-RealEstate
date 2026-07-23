"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface AutomationRule {
  id: number;
  name: string;
  trigger_event: string;
  template: string;
  delay: number;
  delay_unit: string;
  active: boolean;
  executions: number;
  last_run: string | null;
  created_at: string;
}

const emptyForm = { name: "", trigger_event: "", template: "", delay: "0", delay_unit: "minutes", active: true };

const triggerOptions = [
  "user_registered",
  "property_listed",
  "inquiry_received",
  "booking_confirmed",
  "payment_received",
  "lead_created",
  "lead_status_changed",
  "property_viewed",
  "offer_submitted",
  "contract_signed",
];

export default function EmailAutomationPage() {
  const { success, notifyError } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ data: AutomationRule[] }>("/admin/email-automation");
      setRules(data.data || []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const filtered = rules.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.trigger_event.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditingRule(null); setForm(emptyForm); setShowModal(true); setError(""); };
  const openEdit = (r: AutomationRule) => { setEditingRule(r); setForm({ name: r.name, trigger_event: r.trigger_event, template: r.template || "", delay: String(r.delay || 0), delay_unit: r.delay_unit || "minutes", active: r.active }); setShowModal(true); setError(""); };

  const handleSave = async () => {
    if (!form.name || !form.trigger_event) { setError("Name and trigger event are required"); return; }
    try {
      setSaving(true);
      const payload = { ...form, delay: Number(form.delay) };
      if (editingRule) {
        await apiPut(`/admin/email-automation/${editingRule.id}`, payload);
      } else {
        await apiPost("/admin/email-automation", payload);
      }
      setShowModal(false);
      fetchRules();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/admin/email-automation/${id}`);
      setDeleteConfirm(null);
      success("Automation rule deleted.");
      fetchRules();
    } catch (e) {
      notifyError(e, "Could not delete this automation rule. Please try again.");
    }
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      await apiPut(`/admin/email-automation/${rule.id}`, { active: !rule.active });
      success(`Rule ${rule.active ? "paused" : "activated"}.`);
      fetchRules();
    } catch (e) {
      notifyError(e, "Could not change this rule's status. Please try again.");
    }
  };

  return (
    <AdminLayout title="Email Automation Rules">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Search rules by name or trigger..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
          </div>
          <button onClick={openCreate} className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] transition-colors whitespace-nowrap">
            + Create Rule
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No automation rules found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first rule to automate emails</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Rule Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Trigger Event</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Template</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Delay</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Active</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Executions</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Run</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{rule.trigger_event.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{rule.template || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{rule.delay > 0 ? `${rule.delay} ${rule.delay_unit}` : "Immediate"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(rule)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.active ? "bg-green-500" : "bg-gray-300"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.active ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-center">{rule.executions ?? 0}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{rule.last_run ? new Date(rule.last_run).toLocaleDateString() : "Never"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(rule)} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">Edit</button>
                          <button onClick={() => setDeleteConfirm(rule.id)} className="text-[#8B1E3F] hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing {filtered.length} of {rules.length} rules</p>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0A2647]">{editingRule ? "Edit Rule" : "Create Rule"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {error && <p className="text-[#8B1E3F] text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="e.g. Welcome Email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Event *</label>
                <select value={form.trigger_event} onChange={(e) => setForm({ ...form, trigger_event: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
                  <option value="">Select a trigger...</option>
                  {triggerOptions.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Template</label>
                <input type="text" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="e.g. welcome_email" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delay</label>
                  <input type="number" value={form.delay} onChange={(e) => setForm({ ...form, delay: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delay Unit</label>
                  <select value={form.delay_unit} onChange={(e) => setForm({ ...form, delay_unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Active</label>
                <button type="button" onClick={() => setForm({ ...form, active: !form.active })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Delete Rule</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this automation rule? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-[#8B1E3F] text-white rounded-lg font-semibold hover:bg-red-800">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
