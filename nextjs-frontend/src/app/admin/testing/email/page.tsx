"use client";

import { useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

const EMAIL_TEMPLATES = [
  "Welcome Email",
  "Password Reset",
  "Invoice Generated",
  "Property Alert",
  "Service Confirmation",
  "Lead Follow-Up",
  "Newsletter",
  "Contract Ready",
];

export default function EmailTestingPage() {
  const [smtpStatus, setSmtpStatus] = useState<{ loading: boolean; result: string | null; error: string | null }>({
    loading: false, result: null, error: null,
  });
  const [sendForm, setSendForm] = useState({ to: "", template: "", subject: "", body: "" });
  const [sendResult, setSendResult] = useState<{ loading: boolean; sent: boolean; timestamp: string | null; error: string | null }>({
    loading: false, sent: false, timestamp: null, error: null,
  });
  const [spamInput, setSpamInput] = useState("");
  const [spamResult, setSpamResult] = useState<{ loading: boolean; score: number | null; suggestions: string[] }>({
    loading: false, score: null, suggestions: [],
  });
  const [dnsResult, setDnsResult] = useState<{ loading: boolean; records: { type: string; status: string; detail: string }[] }>({
    loading: false, records: [],
  });
  const [previewTemplate, setPreviewTemplate] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  async function testSmtp() {
    setSmtpStatus({ loading: true, result: null, error: null });
    try {
      const data = await apiPost<{ message: string }>("/admin/testing/email/smtp-test", {});
      setSmtpStatus({ loading: false, result: data.message || "SMTP connection successful", error: null });
    } catch (e: any) {
      setSmtpStatus({ loading: false, result: null, error: e?.message || "SMTP connection failed" });
    }
  }

  async function sendTestEmail() {
    setSendResult({ loading: true, sent: false, timestamp: null, error: null });
    try {
      const data = await apiPost<{ message: string; sent: boolean }>("/admin/email-settings/test", { to: sendForm.to });
      if (data.sent) {
        setSendResult({ loading: false, sent: true, timestamp: new Date().toISOString(), error: null });
      } else {
        setSendResult({ loading: false, sent: false, timestamp: null, error: data.message || "Failed to send test email" });
      }
    } catch (e: any) {
      setSendResult({ loading: false, sent: false, timestamp: null, error: e?.message || "Failed to send test email" });
    }
  }

  async function checkSpamScore() {
    setSpamResult({ loading: true, score: null, suggestions: [] });
    try {
      const data = await apiPost<{ score: number; suggestions: string[] }>("/admin/testing/email/spam-score", { content: spamInput });
      setSpamResult({ loading: false, score: data.score, suggestions: data.suggestions || [] });
    } catch (e: any) {
      setSpamResult({ loading: false, score: null, suggestions: [] });
    }
  }

  async function checkDns() {
    setDnsResult({ loading: true, records: [] });
    try {
      const data = await apiPost<{ records: { type: string; status: string; detail: string }[] }>("/admin/testing/email/dns-check", {});
      setDnsResult({ loading: false, records: data.records || [] });
    } catch (e: any) {
      setDnsResult({ loading: false, records: [] });
    }
  }

  async function loadPreview() {
    if (!previewTemplate) return;
    setPreviewLoading(true);
    try {
      const data = await apiPost<{ html: string }>("/admin/testing/email/send-test", { template: previewTemplate, preview_only: true });
      setPreviewHtml(data.html || "<p>No preview available.</p>");
    } catch {
      setPreviewHtml("<p style='color:#999'>Preview not available. Connect to API to see template previews.</p>");
    }
    setPreviewLoading(false);
  }

  return (
    <AdminLayout title="Email Testing Center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Connection Test */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">SMTP Connection Test</h3>
          <p className="text-sm text-slate-500 mb-4">Test the SMTP server connection and verify credentials.</p>
          <button
            onClick={testSmtp}
            disabled={smtpStatus.loading}
            className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {smtpStatus.loading ? "Testing..." : "Test SMTP Connection"}
          </button>
          {smtpStatus.result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{smtpStatus.result}</div>
          )}
          {smtpStatus.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{smtpStatus.error}</div>
          )}
        </div>

        {/* Send Test Email */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Send Test Email</h3>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Recipient email"
              value={sendForm.to}
              onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <select
              value={sendForm.template}
              onChange={(e) => setSendForm({ ...sendForm, template: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            >
              <option value="">Select template (optional)</option>
              {EMAIL_TEMPLATES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Subject"
              value={sendForm.subject}
              onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <textarea
              placeholder="Body"
              value={sendForm.body}
              onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <button
              onClick={sendTestEmail}
              disabled={sendResult.loading || !sendForm.to}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0A2647] rounded-lg hover:bg-[#0d3366] transition-colors disabled:opacity-50"
            >
              {sendResult.loading ? "Sending..." : "Send Test Email"}
            </button>
          </div>
          {sendResult.sent && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Email sent successfully at {new Date(sendResult.timestamp!).toLocaleString()}
            </div>
          )}
          {sendResult.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{sendResult.error}</div>
          )}
        </div>

        {/* Spam Score Test */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Spam Score Analysis</h3>
          <textarea
            placeholder="Paste email content here to analyze spam score..."
            value={spamInput}
            onChange={(e) => setSpamInput(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm mb-3"
          />
          <button
            onClick={checkSpamScore}
            disabled={spamResult.loading || !spamInput}
            className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {spamResult.loading ? "Analyzing..." : "Analyze Spam Score"}
          </button>
          {spamResult.score !== null && (
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-slate-600">Spam Score:</span>
                <span className={`text-lg font-bold ${spamResult.score <= 3 ? "text-green-600" : spamResult.score <= 6 ? "text-amber-600" : "text-red-600"}`}>
                  {spamResult.score}/10
                </span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${spamResult.score <= 3 ? "bg-green-500" : spamResult.score <= 6 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${spamResult.score * 10}%` }}
                  />
                </div>
              </div>
              {spamResult.suggestions.length > 0 && (
                <ul className="space-y-1">
                  {spamResult.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">{"\u26A0"}</span> {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* DKIM/SPF/DMARC Check */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">DKIM / SPF / DMARC Check</h3>
          <p className="text-sm text-slate-500 mb-4">Verify DNS records for email authentication.</p>
          <button
            onClick={checkDns}
            disabled={dnsResult.loading}
            className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {dnsResult.loading ? "Checking..." : "Verify DNS Records"}
          </button>
          {dnsResult.records.length > 0 && (
            <div className="mt-4 space-y-2">
              {dnsResult.records.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className={`w-2 h-2 rounded-full ${r.status === "pass" ? "bg-green-500" : r.status === "warn" ? "bg-amber-500" : "bg-red-500"}`} />
                  <span className="text-sm font-semibold text-[#0A2647] w-16">{r.type}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === "pass" ? "bg-green-100 text-green-700" : r.status === "warn" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {r.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500 flex-1">{r.detail}</span>
                </div>
              ))}
            </div>
          )}
          {dnsResult.records.length === 0 && !dnsResult.loading && (
            <div className="mt-4 text-sm text-slate-400">Click the button above to verify DNS records.</div>
          )}
        </div>

        {/* Template Preview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="font-semibold text-[#0A2647] mb-4">Template Preview</h3>
          <div className="flex items-center gap-3 mb-4">
            <select
              value={previewTemplate}
              onChange={(e) => setPreviewTemplate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            >
              <option value="">Select a template...</option>
              {EMAIL_TEMPLATES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={loadPreview}
              disabled={previewLoading || !previewTemplate}
              className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
            >
              {previewLoading ? "Loading..." : "Load Preview"}
            </button>
          </div>
          {previewHtml ? (
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 min-h-[200px] prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <div className="border border-dashed border-slate-300 rounded-lg p-10 text-center text-slate-400 text-sm">
              Select a template and click Load Preview to see the rendered email.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
