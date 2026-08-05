"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface DropdownOption {
  id: number;
  name: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function CreateContractPage() {
  const router = useRouter();
  const { success, notifyError } = useToast();
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    title: "",
    client_id: "",
    end_date: "",
    terms: "",
    special_conditions: "",
  });

  useEffect(() => { loadDropdowns(); }, []);

  async function loadDropdowns() {
    setLoadingDropdowns(true);
    setLoadError("");
    try {
      const data = await apiGet<{ properties: DropdownOption[]; agents: DropdownOption[]; clients: DropdownOption[] }>("/admin/contracts/available");
      setClients(data.clients || []);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Could not load contract options.");
      setClients([]);
    } finally {
      setLoadingDropdowns(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.title || !form.client_id) return;
    setSaving(true);
    try {
      const body = [
        form.terms ? `<h2>Terms &amp; Conditions</h2><p>${escapeHtml(form.terms)}</p>` : "",
        form.special_conditions ? `<h2>Special Conditions</h2><p>${escapeHtml(form.special_conditions)}</p>` : "",
      ].filter(Boolean).join("");

      await apiPost("/admin/contracts", {
        user_id: Number(form.client_id),
        template_name: form.title,
        template_html: body || "<p>No terms provided.</p>",
        expires_at: form.end_date || null,
      });
      success("Contract created.", "Contracts");
      router.push("/admin/contracts");
    } catch (e) {
      notifyError(e, "Contract could not be created.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <AdminLayout title="Create Contract">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Fill in the details to create a new contract.</p>
          <button onClick={() => router.back()} className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
            ← Back
          </button>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">{loadError}</p>
            <button onClick={loadDropdowns} className="px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50">
              Retry
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
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

          <div>
            <label className={labelClass}>Client *</label>
            {loadingDropdowns ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <select value={form.client_id} onChange={(e) => updateField("client_id", e.target.value)} className={inputClass}>
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {!loadingDropdowns && clients.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No active clients found. Create a buyer or seller account first.</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Expiry Date</label>
            <input type="date" value={form.end_date} onChange={(e) => updateField("end_date", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Terms &amp; Conditions</label>
            <textarea
              value={form.terms}
              onChange={(e) => updateField("terms", e.target.value)}
              placeholder="Enter the contract terms and conditions..."
              rows={6}
              className={inputClass}
            />
          </div>

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

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title || !form.client_id || saving}
            className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Contract"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
