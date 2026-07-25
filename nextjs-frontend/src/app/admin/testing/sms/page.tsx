"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface SmsLog {
  id: number;
  to: string;
  message: string;
  status: string;
  cost: number | null;
  sent_at: string;
  carrier?: string;
}

interface WebhookRecord {
  id: number;
  event: string;
  payload: Record<string, unknown>;
  received_at: string;
}

export default function SmsTestingPage() {
  const [sendForm, setSendForm] = useState({ phone: "", message: "" });
  const [sendResult, setSendResult] = useState<{ loading: boolean; sent: boolean; status: string | null; error: string | null }>({
    loading: false, sent: false, status: null, error: null,
  });
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [webhookLoading, setWebhookLoading] = useState(true);
  const [webhookError, setWebhookError] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupResult, setLookupResult] = useState<{ loading: boolean; carrier: string | null; type: string | null; error: string | null }>({
    loading: false, carrier: null, type: null, error: null,
  });
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");

  useEffect(() => {
    loadWebhooks();
    loadLogs();
  }, []);

  async function loadWebhooks() {
    setWebhookLoading(true);
    try {
      const data = await apiGet<{ webhooks: WebhookRecord[] }>("/admin/testing/sms/webhooks");
      setWebhooks(data.webhooks || []);
      setWebhookError("");
    } catch (e) {
      setWebhookError(e instanceof Error ? e.message : "Could not load webhook records.");
      setWebhooks([]);
    }
    setWebhookLoading(false);
  }

  async function loadLogs() {
    setLogsLoading(true);
    try {
      const data = await apiGet<{ logs: SmsLog[] }>("/admin/testing/sms/webhooks");
      setLogs(data.logs || []);
      setLogsError("");
    } catch (e) {
      setLogsError(e instanceof Error ? e.message : "Could not load SMS logs.");
      setLogs([]);
    }
    setLogsLoading(false);
  }

  async function sendTestSms() {
    setSendResult({ loading: true, sent: false, status: null, error: null });
    try {
      const data = await apiPost<{ status: string; message: string }>("/admin/testing/sms/send", sendForm);
      setSendResult({ loading: false, sent: true, status: data.status || "queued", error: null });
      loadLogs();
    } catch (e: any) {
      setSendResult({ loading: false, sent: false, status: null, error: e?.message || "Failed to send SMS" });
    }
  }

  async function lookupNumber() {
    setLookupResult({ loading: true, carrier: null, type: null, error: null });
    try {
      const data = await apiPost<{ carrier: string; type: string }>("/admin/testing/sms/lookup", { phone: lookupPhone });
      setLookupResult({ loading: false, carrier: data.carrier || null, type: data.type || null, error: null });
    } catch (e: any) {
      setLookupResult({ loading: false, carrier: null, type: null, error: e?.message || "Lookup failed" });
    }
  }

  return (
    <AdminLayout title="SMS Testing Center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Test SMS */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Send Test SMS</h3>
          <div className="space-y-3">
            <input
              type="tel"
              placeholder="Phone number (e.g. +15551234567)"
              value={sendForm.phone}
              onChange={(e) => setSendForm({ ...sendForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <textarea
              placeholder="Message content"
              value={sendForm.message}
              onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <button
              onClick={sendTestSms}
              disabled={sendResult.loading || !sendForm.phone || !sendForm.message}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0A2647] rounded-lg hover:bg-[#0d3366] transition-colors disabled:opacity-50"
            >
              {sendResult.loading ? "Sending..." : "Send Test SMS"}
            </button>
          </div>
          {sendResult.sent && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              SMS sent successfully. Status: <strong>{sendResult.status}</strong>
            </div>
          )}
          {sendResult.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{sendResult.error}</div>
          )}
        </div>

        {/* Phone Lookup */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Phone Lookup</h3>
          <p className="text-sm text-slate-500 mb-4">Verify carrier information for a phone number.</p>
          <div className="flex gap-3">
            <input
              type="tel"
              placeholder="Enter phone number"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <button
              onClick={lookupNumber}
              disabled={lookupResult.loading || !lookupPhone}
              className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
            >
              {lookupResult.loading ? "Looking up..." : "Lookup"}
            </button>
          </div>
          {lookupResult.carrier && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Carrier</p>
                  <p className="text-sm font-medium text-[#0A2647]">{lookupResult.carrier}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Line Type</p>
                  <p className="text-sm font-medium text-[#0A2647]">{lookupResult.type}</p>
                </div>
              </div>
            </div>
          )}
          {lookupResult.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{lookupResult.error}</div>
          )}
        </div>

        {/* Webhook Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Latest Webhook</h3>
          {webhookLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ) : webhookError ? (
            <div className="text-center py-4">
              <p className="text-red-700 text-sm">{webhookError}</p>
              <button
                onClick={loadWebhooks}
                className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
              >
                Retry
              </button>
            </div>
          ) : webhooks.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Event:</span>
                <span className="text-sm font-semibold text-[#0A2647]">{webhooks[0].event}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Received:</span>
                <span className="text-sm text-slate-500">{new Date(webhooks[0].received_at).toLocaleString()}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Payload:</p>
                <pre className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 overflow-x-auto max-h-40">
                  {JSON.stringify(webhooks[0].payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No webhooks received yet.</p>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">SMS Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-[#0A2647]">{logs.length}</p>
              <p className="text-xs text-slate-500">Total Sent</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xl font-bold text-green-600">{logs.filter((l) => l.status === "delivered").length}</p>
              <p className="text-xs text-slate-500">Delivered</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-xl font-bold text-amber-600">{logs.filter((l) => l.status === "pending").length}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-[#0A2647]">${logs.reduce((s, l) => s + (l.cost || 0), 0).toFixed(2)}</p>
              <p className="text-xs text-slate-500">Total Cost</p>
            </div>
          </div>
        </div>

        {/* Delivery Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0A2647]">Delivery Logs</h3>
            <button onClick={loadLogs} className="text-xs font-medium text-[#C9A227] hover:text-[#b8911f] transition-colors">
              \u21BB Refresh
            </button>
          </div>
          {logsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : logsError ? (
            <div className="p-6 text-center">
              <p className="text-red-700 text-sm">{logsError}</p>
              <button
                onClick={loadLogs}
                className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
              >
                Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No SMS logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">To</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Message</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Cost</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[#0A2647]">{log.to}</td>
                      <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{log.message}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          log.status === "delivered" ? "bg-green-100 text-green-700" :
                          log.status === "pending" ? "bg-amber-100 text-amber-700" :
                          log.status === "failed" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{log.cost !== null ? `$${log.cost.toFixed(4)}` : "\u2014"}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{new Date(log.sent_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
