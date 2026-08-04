"use client";

import { useCallback, useEffect, useState } from "react";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { apiGet, apiPost, apiPut, apiDelete, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

export interface GeoListEntry {
  id: number;
  value: string;
  is_cidr: boolean;
  note: string | null;
  country_code: string | null;
  status: "active" | "disabled";
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

interface FormState {
  value: string;
  is_cidr: boolean;
  note: string;
  country_code: string;
  status: "active" | "disabled";
  expires_at: string;
}

const EMPTY_FORM: FormState = { value: "", is_cidr: false, note: "", country_code: "", status: "active", expires_at: "" };

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export default function GeoListManager({ kind }: { kind: "whitelist" | "blacklist" }) {
  const { success, notifyError } = useToast();
  const basePath = `/admin/geo-${kind}`;
  const noun = kind === "whitelist" ? "Whitelist" : "Blacklist";

  const [entries, setEntries] = useState<GeoListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "20");
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await apiGet<PaginatedResponse<GeoListEntry>>(`${basePath}?${params.toString()}`);
      setEntries(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : `Could not load ${kind} entries.`);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [basePath, kind, page, search, status]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (entry: GeoListEntry) => {
    setEditingId(entry.id);
    setForm({
      value: entry.value,
      is_cidr: entry.is_cidr,
      note: entry.note || "",
      country_code: entry.country_code || "",
      status: entry.status,
      expires_at: entry.expires_at ? entry.expires_at.slice(0, 10) : "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setFormSaving(true);
    setFormError("");
    try {
      const payload = {
        value: form.value.trim(),
        is_cidr: form.is_cidr || form.value.includes("/"),
        note: form.note || null,
        country_code: form.country_code ? form.country_code.toUpperCase() : null,
        status: form.status,
        expires_at: form.expires_at || null,
      };
      if (editingId) {
        await apiPut(`${basePath}/${editingId}`, payload);
        success(`${noun} entry updated.`);
      } else {
        await apiPost(basePath, payload);
        success(`${noun} entry added.`);
      }
      setModalOpen(false);
      fetchEntries();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Could not save this entry.");
    } finally {
      setFormSaving(false);
    }
  };

  const toggleStatus = async (entry: GeoListEntry) => {
    setBusyId(entry.id);
    try {
      await apiPut(`${basePath}/${entry.id}`, { status: entry.status === "active" ? "disabled" : "active" });
      fetchEntries();
    } catch (e) {
      notifyError(e, "Could not update status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Remove this ${kind} entry?`)) return;
    setBusyId(id);
    try {
      await apiDelete(`${basePath}/${id}`);
      success(`${noun} entry removed.`);
      fetchEntries();
    } catch (e) {
      notifyError(e, "Could not remove this entry.");
    } finally {
      setBusyId(null);
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    // Auth here is Bearer-token-only (no session cookie), so a plain link
    // click can't carry it — fetch with the header and download the blob.
    setExporting(true);
    try {
      const token = readAuthToken();
      const res = await fetch(`${API_BASE}${basePath}/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Export failed (${res.status}).`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not export CSV.");
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = readAuthToken();
      const res = await fetch(`${API_BASE}${basePath}/import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const body = await res.json();
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Import failed.");
      }
      success(`Imported ${body.data.imported}, skipped ${body.data.skipped}.`);
      fetchEntries();
    } catch (e) {
      notifyError(e, "Could not import CSV file.");
    } finally {
      setImporting(false);
    }
  };

  const columns: ColumnDef<GeoListEntry>[] = [
    {
      key: "value",
      label: "IP / CIDR",
      render: (e) => (
        <div>
          <span className="font-mono font-semibold text-slate-800">{e.value}</span>
          {e.is_cidr && <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">CIDR</span>}
        </div>
      ),
    },
    { key: "note", label: "Note", render: (e) => <span className="text-slate-600">{e.note || "—"}</span> },
    { key: "country_code", label: "Country", render: (e) => <span className="font-mono text-slate-600">{e.country_code || "—"}</span> },
    {
      key: "status",
      label: "Status",
      render: (e) => (
        <span
          className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
            e.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {e.status}
        </span>
      ),
    },
    {
      key: "expires_at",
      label: "Expires",
      render: (e) => <span className="text-slate-500 text-xs">{e.expires_at ? new Date(e.expires_at).toLocaleDateString() : "Never"}</span>,
    },
    {
      key: "last_used_at",
      label: "Last Used",
      render: (e) => <span className="text-slate-500 text-xs">{e.last_used_at ? new Date(e.last_used_at).toLocaleString() : "Never"}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <label className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
          {importing ? "Importing…" : "Import CSV"}
          <input
            type="file"
            accept=".csv,.txt"
            className="hidden"
            disabled={importing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
        </label>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
        <button onClick={openCreate} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-bold hover:bg-[#b8911f]">
          + Add {noun} Entry
        </button>
      </div>

      <AdminDataTable
        columns={columns}
        rows={entries}
        loading={loading}
        error={error}
        onRetry={fetchEntries}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by IP/CIDR or note…"
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "disabled", label: "Disabled" },
            ],
          },
        ]}
        filterValues={{ status }}
        onFilterChange={(key, value) => key === "status" && setStatus(value)}
        page={page}
        lastPage={lastPage}
        total={total}
        onPageChange={setPage}
        emptyMessage={`No ${kind} entries yet.`}
        rowActions={(entry) => (
          <div className="flex justify-end gap-3">
            <button onClick={() => openEdit(entry)} className="text-xs font-semibold text-[#C9A227] hover:text-[#0A2647]">
              Edit
            </button>
            <button
              onClick={() => toggleStatus(entry)}
              disabled={busyId === entry.id}
              className="text-xs font-semibold text-[#0A2647] hover:text-[#C9A227] disabled:opacity-50"
            >
              {entry.status === "active" ? "Disable" : "Enable"}
            </button>
            <button
              onClick={() => handleDelete(entry.id)}
              disabled={busyId === entry.id}
              className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        )}
      />

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0A2647]">{editingId ? "Edit" : "Add"} {noun} Entry</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address or CIDR</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder="203.0.113.5 or 203.0.113.0/24"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#C9A227] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Developer Home, Office, QA"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country (optional)</label>
                  <input
                    type="text"
                    value={form.country_code}
                    onChange={(e) => setForm((f) => ({ ...f, country_code: e.target.value.toUpperCase() }))}
                    maxLength={2}
                    placeholder="PK"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "active" | "disabled" }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#C9A227] outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (optional)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={formSaving || !form.value.trim()}
                className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-50"
              >
                {formSaving ? "Saving..." : editingId ? "Save Changes" : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
