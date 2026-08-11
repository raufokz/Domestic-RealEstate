"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface ServiceRequest {
  id: number;
  request_number: string;
  full_name: string;
  email: string;
  phone?: string;
  service_type: string;
  budget_range?: string;
  timeline?: string;
  message?: string;
  status: string;
  assigned_admin?: number;
  created_at: string;
}

const STATUS_OPTIONS = ["new", "reviewed", "quoted", "contract_sent", "signed", "activated", "cancelled"];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    reviewed: "bg-amber-100 text-amber-700",
    quoted: "bg-purple-100 text-purple-700",
    contract_sent: "bg-indigo-100 text-indigo-700",
    signed: "bg-teal-100 text-teal-700",
    activated: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${styles[status] || styles.new}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function AdminServiceRequestsPage() {
  const { success, notifyError } = useToast();
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await apiGet<{ data: ServiceRequest[] }>("/admin/service-requests");
      setRequests(Array.isArray(data?.data) ? data.data : []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load service requests. Please try again.");
      setRequests([]);
    }
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    try {
      await apiPut(`/admin/service-requests/${id}`, { status });
      setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
      success("Status updated.");
    } catch (e) {
      // Do not show the new status when the server rejected the change.
      notifyError(e, "Could not update this request's status. Please try again.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Service Requests</h1>
          <p className="text-slate-500 text-sm mt-1">Manage incoming service requests from clients.</p>
        </div>
        <button onClick={loadRequests} className="px-4 py-2 text-sm font-medium text-navy border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-card animate-pulse h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={loadRequests}
            className="mt-3 px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-card text-center">
          <p className="text-slate-500">No service requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-4 font-semibold text-navy">Request #</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Client</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Service Type</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Budget</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Status</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Date</th>
                  <th className="text-right px-5 py-4 font-semibold text-navy">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-medium text-navy">{req.request_number}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-navy">{req.full_name}</p>
                      <p className="text-xs text-slate-400">{req.email}</p>
                    </td>
                    <td className="px-5 py-4 capitalize text-slate-600">{req.service_type}</td>
                    <td className="px-5 py-4 text-slate-600">{req.budget_range || "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={req.status}
                        onChange={(e) => updateStatus(req.id, e.target.value)}
                        disabled={updating === req.id}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-gold"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
