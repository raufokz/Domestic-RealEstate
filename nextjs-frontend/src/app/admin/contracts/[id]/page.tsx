"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, API_BASE, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Signer {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  signed_at?: string;
}

interface Version {
  id: number;
  version_number: number;
  change_note?: string;
  changed_by?: number;
  changer?: { name: string } | null;
  created_at: string;
}

interface DiffLine {
  type: "same" | "added" | "removed";
  line: string;
}

interface TimelineEntry {
  action: string;
  user?: string;
  ip_address?: string;
  created_at: string;
}

interface ContractDetail {
  id: number;
  contract_number: string;
  template_name: string;
  status: string;
  client_details?: Record<string, unknown> | null;
  current_version: number;
  sent_at?: string;
  signed_at?: string;
  expires_at?: string;
  created_at: string;
  user?: { name: string; email: string } | null;
  signers: Signer[];
  versions: Version[];
}

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-amber-100 text-amber-700",
  signed: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-600",
  cancelled: "bg-slate-100 text-slate-500 line-through",
};

export default function ContractDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { success, notifyError } = useToast();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [latestDiff, setLatestDiff] = useState<DiffLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "versions" | "timeline">("overview");
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);
      const [detailRes, versionsRes] = await Promise.all([
        apiGet<{ data: ContractDetail; timeline: TimelineEntry[] }>(`/admin/contracts/${id}`),
        apiGet<{ versions: Version[]; latest_diff: DiffLine[] | null }>(`/admin/contracts/${id}/versions`),
      ]);
      setContract(detailRes.data);
      setTimeline(detailRes.timeline || []);
      setVersions(versionsRes.versions || []);
      setLatestDiff(versionsRes.latest_diff || []);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNotFound(true);
      } else {
        setError(e instanceof ApiError ? e.message : "Could not load this contract.");
      }
      setContract(null);
    } finally {
      setLoading(false);
    }
  }

  async function sendContract() {
    if (!contract) return;
    setBusy(true);
    try {
      await apiPost(`/admin/contracts/${contract.id}/send`);
      setContract((prev) => (prev ? { ...prev, status: "sent", sent_at: new Date().toISOString() } : prev));
      success("Contract sent to client.", "Contracts");
    } catch (e) {
      notifyError(e, "Could not send this contract.");
    } finally {
      setBusy(false);
    }
  }

  async function renewContract() {
    if (!contract) return;
    setBusy(true);
    try {
      const renewed = await apiPost<{ id: number }>(`/admin/contracts/${contract.id}/renew`);
      success("Contract renewed as a new draft.", "Contracts");
      window.location.href = `/admin/contracts/${renewed.id}`;
    } catch (e) {
      notifyError(e, "Could not renew this contract.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    if (!contract) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_BASE}/admin/contracts/${contract.id}/pdf`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contract.contract_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not generate the PDF.");
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Contract">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading contract...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Contract">
        <div className="bg-red-50 border border-red-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load contract</h3>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold">
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (notFound || !contract) {
    return (
      <AdminLayout title="Contract Not Found">
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract not found</h3>
          <Link href="/admin/contracts" className="mt-4 inline-block px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold">
            Back to Contracts
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={contract.template_name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/contracts" className="text-sm text-gray-500 hover:text-[#0A2647]">Contracts</Link>
              <span className="text-gray-400">/</span>
              <h1 className="font-heading text-xl font-bold text-navy">{contract.template_name}</h1>
              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusStyles[contract.status] || statusStyles.draft}`}>
                {contract.status}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              {contract.contract_number} · v{contract.current_version}
              {contract.user ? ` · ${contract.user.name}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {contract.status === "draft" && (
              <button onClick={sendContract} disabled={busy} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-50">
                {busy ? "Sending..." : "Send to Client"}
              </button>
            )}
            <button onClick={downloadPdf} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              Download PDF
            </button>
            <button onClick={renewContract} disabled={busy} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
              Renew
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex border-b border-gray-200">
            {([
              ["overview", `Overview`],
              ["versions", `Versions (${versions.length})`],
              ["timeline", `Timeline (${timeline.length})`],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab ? "border-[#C9A227] text-[#0A2647]" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="text-sm font-medium text-slate-800">{contract.user?.name || "—"}</p>
                  <p className="text-xs text-slate-400">{contract.user?.email}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Sent</p>
                  <p className="text-sm font-medium text-slate-800">{contract.sent_at ? new Date(contract.sent_at).toLocaleDateString() : "—"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Signed</p>
                  <p className="text-sm font-medium text-slate-800">{contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : "—"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Expires</p>
                  <p className="text-sm font-medium text-slate-800">{contract.expires_at ? new Date(contract.expires_at).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0A2647] mb-4">Signers</h3>
              {contract.signers.length === 0 ? (
                <p className="text-sm text-gray-500">No additional signers — single-party signing flow.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 font-semibold text-gray-700">Signed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {contract.signers.map((s) => (
                        <tr key={s.id}>
                          <td className="py-3 font-medium">{s.name}</td>
                          <td className="py-3 text-gray-600">{s.email}</td>
                          <td className="py-3 text-gray-600 capitalize">{s.role}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${s.status === "signed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 text-xs">{s.signed_at ? new Date(s.signed_at).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "versions" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#0A2647] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Version</th>
                      <th className="px-4 py-3 text-left font-semibold">Changed By</th>
                      <th className="px-4 py-3 text-left font-semibold">Note</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {versions.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-medium text-navy">v{v.version_number}</td>
                        <td className="px-4 py-3 text-gray-600">{v.changer?.name || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{v.change_note || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(v.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {latestDiff.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-[#0A2647] mb-4">Latest Changes</h3>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-0.5 max-h-96 overflow-auto">
                  {latestDiff.map((d, idx) => (
                    <div
                      key={idx}
                      className={
                        d.type === "added"
                          ? "bg-green-900/40 text-green-300 px-2 py-0.5"
                          : d.type === "removed"
                            ? "bg-red-900/40 text-red-300 px-2 py-0.5"
                            : "text-slate-300 px-2 py-0.5"
                      }
                    >
                      {d.type === "added" ? "+ " : d.type === "removed" ? "− " : "  "}
                      {d.line}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-sm text-gray-500">
                {versions.length >= 2 ? "No differences between the latest versions." : "Save edits to this contract to compare versions here."}
              </div>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Activity Timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-500">No activity recorded yet.</p>
            ) : (
              <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                {timeline.map((entry, idx) => (
                  <li key={idx} className="ml-6">
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-[#C9A227]" />
                    <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                    <p className="text-xs text-gray-500">
                      {entry.user ? `${entry.user} · ` : ""}
                      {new Date(entry.created_at).toLocaleString()}
                      {entry.ip_address ? ` · ${entry.ip_address}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
