"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface WebhookEndpoint {
  id: number;
  url: string;
  method: string;
  last_triggered: string | null;
  status: string;
  description?: string;
}

interface WebhookHistoryEntry {
  id: number;
  endpoint_url: string;
  request_payload: string;
  response_status: number | null;
  response_body: string | null;
  response_time: number | null;
  created_at: string;
}

export default function WebhookTestingPage() {
  const { success, notifyError } = useToast();
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [endpointsLoading, setEndpointsLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState("");
  const [payload, setPayload] = useState('{\n  "event": "test",\n  "data": {\n    "id": 1,\n    "message": "Test webhook payload"\n  }\n}');
  const [sendResult, setSendResult] = useState<{ loading: boolean; status: number | null; body: string | null; time: number | null; error: string | null }>({
    loading: false, status: null, body: null, time: null, error: null,
  });
  const [sigInput, setSigInput] = useState("");
  const [sigResult, setSigResult] = useState<{ loading: boolean; valid: boolean | null; error: string | null }>({
    loading: false, valid: null, error: null,
  });
  const [history, setHistory] = useState<WebhookHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<number | null>(null);

  useEffect(() => {
    loadEndpoints();
    loadHistory();
  }, []);

  async function loadEndpoints() {
    setEndpointsLoading(true);
    try {
      const data = await apiGet<{ endpoints: WebhookEndpoint[] }>("/admin/testing/webhooks/endpoints");
      setEndpoints(data.endpoints || []);
    } catch (e) {
      setEndpoints([]);
      notifyError(e, "Could not load webhook endpoints.");
    }
    setEndpointsLoading(false);
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const data = await apiGet<{ history: WebhookHistoryEntry[] }>("/admin/testing/webhooks/history");
      setHistory(data.history || []);
    } catch (e) {
      setHistory([]);
      notifyError(e, "Could not load webhook history.");
    }
    setHistoryLoading(false);
  }

  async function sendTestPayload() {
    setSendResult({ loading: true, status: null, body: null, time: null, error: null });
    try {
      const endpoint = endpoints.find((e) => e.id.toString() === selectedEndpoint);
      const data = await apiPost<{ status: number; body: string; response_time: number }>("/admin/testing/webhooks/send-test", {
        endpoint_id: selectedEndpoint,
        payload: JSON.parse(payload),
      });
      setSendResult({
        loading: false,
        status: data.status || 200,
        body: data.body || null,
        time: data.response_time || null,
        error: null,
      });
      loadHistory();
    } catch (e: any) {
      setSendResult({ loading: false, status: null, body: null, time: null, error: e?.message || "Failed to send payload" });
    }
  }

  async function testSignature() {
    setSigResult({ loading: true, valid: null, error: null });
    try {
      const data = await apiPost<{ valid: boolean }>("/admin/testing/webhooks/send-test", { type: "signature_validation", payload: sigInput });
      setSigResult({ loading: false, valid: data.valid, error: null });
    } catch (e: any) {
      setSigResult({ loading: false, valid: false, error: e?.message || "Validation failed" });
    }
  }

  async function retryWebhook(entry: WebhookHistoryEntry) {
    setRetryingId(entry.id);
    try {
      await apiPost("/admin/testing/webhooks/send-test", {
        endpoint_url: entry.endpoint_url,
        payload: JSON.parse(entry.request_payload),
      });
      success("Test webhook sent.");
      loadHistory();
    } catch (e) {
      notifyError(e, "Could not resend this webhook. Please try again.");
    }
    setRetryingId(null);
  }

  return (
    <AdminLayout title="Webhook Testing Center">
      <div className="space-y-6">
        {/* Endpoint List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0A2647]">Webhook Endpoints</h3>
            <button onClick={loadEndpoints} className="text-xs font-medium text-[#C9A227] hover:text-[#b8911f] transition-colors">
              \u21BB Refresh
            </button>
          </div>
          {endpointsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : endpoints.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No webhook endpoints configured.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">URL</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Method</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Last Triggered</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((ep) => (
                    <tr key={ep.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[#0A2647] max-w-xs truncate">{ep.url}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          ep.method === "POST" ? "bg-blue-100 text-blue-700" :
                          ep.method === "GET" ? "bg-green-100 text-green-700" :
                          ep.method === "PUT" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {ep.method}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          ep.status === "active" ? "bg-green-100 text-green-700" :
                          ep.status === "inactive" ? "bg-slate-100 text-slate-500" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {ep.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">
                        {ep.last_triggered ? new Date(ep.last_triggered).toLocaleString() : "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Test Payload */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-[#0A2647] mb-4">Send Test Payload</h3>
            <div className="space-y-3">
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
              >
                <option value="">Select an endpoint...</option>
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>{ep.method} {ep.url}</option>
                ))}
              </select>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm font-mono"
                placeholder='{"event": "test"}'
              />
              <button
                onClick={sendTestPayload}
                disabled={sendResult.loading || !selectedEndpoint}
                className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
              >
                {sendResult.loading ? "Sending..." : "Send Test Payload"}
              </button>
            </div>
            {sendResult.status !== null && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-[#0A2647]">Status: <span className="text-green-700">{sendResult.status}</span></span>
                  <span className="text-slate-500">Response Time: {sendResult.time}ms</span>
                </div>
                {sendResult.body && (
                  <pre className="mt-2 bg-white p-2 rounded text-xs text-slate-700 overflow-x-auto max-h-32">{sendResult.body}</pre>
                )}
              </div>
            )}
            {sendResult.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{sendResult.error}</div>
            )}
          </div>

          {/* Signature Validation */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-[#0A2647] mb-4">Signature Validation</h3>
            <p className="text-sm text-slate-500 mb-4">Test webhook signature verification.</p>
            <textarea
              value={sigInput}
              onChange={(e) => setSigInput(e.target.value)}
              placeholder='{"header": "sha256=abc123...", "body": "..."}'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm font-mono mb-3"
            />
            <button
              onClick={testSignature}
              disabled={sigResult.loading || !sigInput}
              className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
            >
              {sigResult.loading ? "Validating..." : "Validate Signature"}
            </button>
            {sigResult.valid !== null && (
              <div className={`mt-4 p-3 rounded-lg border ${sigResult.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <p className={`text-sm font-semibold ${sigResult.valid ? "text-green-700" : "text-red-700"}`}>
                  {sigResult.valid ? "Signature is valid" : "Signature is invalid"}
                </p>
              </div>
            )}
            {sigResult.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{sigResult.error}</div>
            )}
          </div>
        </div>

        {/* Payload History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0A2647]">Payload History</h3>
            <button onClick={loadHistory} className="text-xs font-medium text-[#C9A227] hover:text-[#b8911f] transition-colors">
              \u21BB Refresh
            </button>
          </div>
          {historyLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No webhook history yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Endpoint</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Response Time</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Sent At</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[#0A2647] max-w-[200px] truncate">{h.endpoint_url}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          h.response_status && h.response_status >= 200 && h.response_status < 300
                            ? "bg-green-100 text-green-700"
                            : h.response_status
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {h.response_status || "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{h.response_time !== null ? `${h.response_time}ms` : "\u2014"}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{new Date(h.created_at).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => retryWebhook(h)}
                          disabled={retryingId === h.id}
                          className="text-xs font-medium text-[#C9A227] hover:text-[#b8911f] disabled:opacity-50 transition-colors"
                        >
                          {retryingId === h.id ? "Retrying..." : "Retry"}
                        </button>
                      </td>
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
