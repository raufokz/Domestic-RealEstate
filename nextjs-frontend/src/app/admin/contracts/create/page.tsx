"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";

interface DropdownOption {
  id: number;
  name: string;
}

export default function CreateContractPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<DropdownOption[]>([]);
  const [agents, setAgents] = useState<DropdownOption[]>([]);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const [form, setForm] = useState({
    title: "",
    type: "buyer",
    property_id: "",
    agent_id: "",
    client_id: "",
    start_date: "",
    end_date: "",
    terms: "",
    special_conditions: "",
  });

  useEffect(() => { loadDropdowns(); }, []);

  async function loadDropdowns() {
    setLoadingDropdowns(true);
    try {
      const data = await apiGet<{ properties: DropdownOption[]; agents: DropdownOption[]; clients: DropdownOption[] }>("/admin/contracts/available");
      setProperties(data.properties || []);
      setAgents(data.agents || []);
      setClients(data.clients || []);
    } catch {
      setProperties([{ id: 1, name: "Sunset Villa Estate" }, { id: 2, name: "Oceanview Penthouse" }, { id: 3, name: "Downtown Luxury Loft" }]);
      setAgents([{ id: 1, name: "John Smith" }, { id: 2, name: "Sarah Johnson" }, { id: 3, name: "Emily Brown" }]);
      setClients([{ id: 1, name: "Alice Johnson" }, { id: 2, name: "Bob Martinez" }, { id: 3, name: "Carol White" }]);
    } finally {
      setLoadingDropdowns(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(draft: boolean) {
    if (!form.title) return;
    setSaving(true);
    try {
      await apiPost("/admin/contracts", { ...form, status: draft ? "draft" : "sent" });
      router.push("/admin/contracts");
    } catch {
      router.push("/admin/contracts");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <AdminLayout title="Create Contract">
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Fill in the details to create a new contract.</p>
          <button onClick={() => router.back()} className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
            ← Back
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Contract Title */}
          <div>
            <label className={labelClass}>Contract Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g., Purchase Agreement - Sunset Villa"
              className={inputClass}
            />
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Contract Type *</label>
            <div className="flex gap-3">
              {[
                { value: "buyer", label: "Buyer Agreement", icon: "🏠" },
                { value: "seller", label: "Seller Agreement", icon: "💰" },
                { value: "lease", label: "Lease Agreement", icon: "📝" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateField("type", t.value)}
                  className={`flex-1 p-4 rounded-xl border-2 text-center transition-colors ${
                    form.type === t.value
                      ? "border-[#C9A227] bg-[#C9A227]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl block mb-1">{t.icon}</span>
                  <span className={`text-sm font-medium ${form.type === t.value ? "text-[#0A2647]" : "text-gray-600"}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dropdowns */}
          {loadingDropdowns ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-10 bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Property</label>
                <select value={form.property_id} onChange={(e) => updateField("property_id", e.target.value)} className={inputClass}>
                  <option value="">Select property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Agent</label>
                <select value={form.agent_id} onChange={(e) => updateField("agent_id", e.target.value)} className={inputClass}>
                  <option value="">Select agent</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Client</label>
                <select value={form.client_id} onChange={(e) => updateField("client_id", e.target.value)} className={inputClass}>
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => updateField("start_date", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => updateField("end_date", e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className={labelClass}>Terms & Conditions</label>
            <textarea
              value={form.terms}
              onChange={(e) => updateField("terms", e.target.value)}
              placeholder="Enter the contract terms and conditions..."
              rows={6}
              className={inputClass}
            />
          </div>

          {/* Special Conditions */}
          <div>
            <label className={labelClass}>Special Conditions</label>
            <textarea
              value={form.special_conditions}
              onChange={(e) => updateField("special_conditions", e.target.value)}
              placeholder="Any special conditions or addendums..."
              rows={3}
              className={inputClass}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={!form.title || saving}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={!form.title || saving}
            className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Send for Signature"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
