"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface RecipientPreview {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  type: string;
  score: number;
}

const TEMPLATE_PRESETS = [
  {
    id: "property_match",
    name: "🏠 Exclusive Property Match Follow-Up",
    subject: "New Property Matches Available for {{first_name}}",
    body: `<p>Hi {{first_name}},</p>

<p>We recently listed several luxury residential properties matching your investment criteria and location preferences.</p>

<p>Click below to inspect full photos, floor plans, and pricing details:</p>
<p><a href="https://domesticrealestate.us/properties" style="background:#0A2647;color:#C9A227;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">View Matching Properties</a></p>

<p>Warm regards,<br /><strong>Domestic Real Estate Team</strong><br />info@domesticrealestate.us</p>`,
  },
  {
    id: "seller_valuation",
    name: "🏡 Home Valuation & Market Update",
    subject: "Updated Property Valuation Report for {{first_name}}",
    body: `<p>Dear {{first_name}},</p>

<p>Neighborhood property valuations in your area have shifted this quarter. We've compiled an updated valuation analysis for your property.</p>

<p>Reply directly to this email or request your full digital report online:</p>
<p><a href="https://domesticrealestate.us/sellers/home-valuation" style="background:#C9A227;color:#0A2647;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Request Updated Valuation Report</a></p>

<p>Best,<br /><strong>Domestic Real Estate Valuation Advisory</strong></p>`,
  },
  {
    id: "investor_deal",
    name: "💼 High-Yield Investor Opportunity Alert",
    subject: "Exclusive 12%+ ROI Deal Flow for {{first_name}}",
    body: `<p>Hello {{first_name}},</p>

<p>Our institutional acquisitions team just secured a off-market multi-family portfolio opportunity projected at 12.5% ROI with immediate cash flow.</p>

<p>Access the financial breakdown and cap rate metrics below:</p>
<p><a href="https://domesticrealestate.us/investors/deal-alerts" style="background:#0A2647;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Access Off-Market Deal Flow</a></p>

<p>Sincerely,<br /><strong>Domestic Real Estate Capital Partners</strong></p>`,
  },
];

export default function BulkEmailFollowUpPage() {
  const { success, notifyError, warning } = useToast();

  const [segment, setSegment] = useState<string>("all_leads");
  const [subject, setSubject] = useState<string>("Important Follow-Up from Domestic Real Estate");
  const [body, setBody] = useState<string>(TEMPLATE_PRESETS[0].body);
  const [testEmail, setTestEmail] = useState<string>("admin@domesticrealestate.us");

  const [recipients, setRecipients] = useState<RecipientPreview[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchRecipients();
  }, [segment]);

  async function fetchRecipients() {
    setLoadingRecipients(true);
    try {
      const res = await apiGet<RecipientPreview[] | { data: RecipientPreview[] }>(`/admin/leads?segment=${segment}&per_page=500`);
      const list = Array.isArray(res) ? res : res.data || [];
      
      let filtered = list;
      if (segment === "hot_leads") {
        filtered = list.filter((l) => l.score >= 70);
      } else if (["buyers", "sellers", "investors", "realtors"].includes(segment)) {
        const type = segment.replace(/s$/, "");
        filtered = list.filter((l) => l.type === type);
      }

      setRecipients(filtered.filter((l) => l.email));
    } catch {
      // Fallback preview
      setRecipients([
        { id: 1, first_name: "Jane", last_name: "Doe", name: "Jane Doe", email: "jane@example.com", type: "buyer", score: 85 },
        { id: 2, first_name: "John", last_name: "Smith", name: "John Smith", email: "john@example.com", type: "seller", score: 90 },
        { id: 3, first_name: "Robert", last_name: "Johnson", name: "Robert Johnson", email: "robert@example.com", type: "investor", score: 78 },
      ]);
    } finally {
      setLoadingRecipients(false);
    }
  }

  const applyTemplate = (presetId: string) => {
    const preset = TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSubject(preset.subject);
      setBody(preset.body);
      success(`Applied "${preset.name}" template.`, "Email Template");
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !subject || !body) return;
    setTesting(true);
    try {
      await apiPost("/email-campaigns/send-test", {
        target_email: testEmail,
        subject,
        body,
      });
      success(`Test follow-up email sent to ${testEmail}!`, "SMTP Email");
    } catch (err) {
      notifyError(err, "Test email dispatch failed.");
    } finally {
      setTesting(false);
    }
  };

  const handleBulkDispatch = async () => {
    if (recipients.length === 0) {
      warning("No valid email recipients found in the selected segment.");
      return;
    }

    if (!confirm(`Are you sure you want to send this follow-up email to ALL ${recipients.length} clients in "${segment}"?`)) {
      return;
    }

    setDispatching(true);
    try {
      const res = await apiPost<{ message?: string; recipients_count?: number }>("/email-campaigns/bulk-followup", {
        recipient_group: segment,
        subject,
        body,
        sync_send: true,
      });
      success(res.message || `Bulk email follow-up sent to ${recipients.length} clients!`, "Bulk Email");
    } catch (err) {
      notifyError(err, "Bulk follow-up email dispatch failed.");
    } finally {
      setDispatching(false);
    }
  };

  return (
    <AdminLayout title="Bulk Client Email Follow-Up">
      {/* HowTo Guidance */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700">
        <h3 className="font-semibold text-sm text-[#0A2647] flex items-center gap-2 mb-2">
          <span>✉️</span> One-Time to Many Client Follow-Up Tool
        </h3>
        <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
          <li><strong>Client Segmenting:</strong> Filter clients by <em>All Leads</em>, <em>Hot Leads (&ge;70 Score)</em>, <em>Buyers</em>, <em>Sellers</em>, <em>Investors</em>, or <em>Realtors</em>.</li>
          <li><strong>Merge Tags:</strong> Personalize emails dynamically using <code>{"{{first_name}}"}</code>, <code>{"{{last_name}}"}</code>, and <code>{"{{email}}"}</code> tags.</li>
          <li><strong>Instant Dispatch:</strong> Dispatches real SMTP emails instantly to all selected clients with live delivery status notifications.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Template Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audience Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0A2647]">1. Select Client Audience</h2>
              <span className="text-xs font-semibold px-3 py-1 bg-[#C9A227]/20 text-[#0A2647] rounded-full">
                {loadingRecipients ? "Counting..." : `${recipients.length} Target Clients`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: "all_leads", label: "All Leads" },
                { key: "hot_leads", label: "🔥 Hot Leads (Score 70+)" },
                { key: "buyers", label: "🏠 Buyers" },
                { key: "sellers", label: "🏡 Sellers" },
                { key: "investors", label: "💼 Investors" },
                { key: "realtors", label: "🤝 Realtors" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSegment(s.key)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    segment === s.key
                      ? "border-[#C9A227] bg-[#C9A227]/10 text-[#0A2647]"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Templates */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#0A2647]">2. Choose Preset Template</h2>
            <div className="space-y-2">
              {TEMPLATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyTemplate(preset.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#C9A227] hover:bg-slate-50 transition-all flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-slate-800">{preset.name}</span>
                  <span className="text-xs text-[#C9A227] font-bold">Apply Preset &rarr;</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email Content Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#0A2647]">3. Compose Follow-Up Message</h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  HTML Body Content *
                </label>
                <div className="flex gap-2 text-[10px]">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{"{{first_name}}"}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{"{{last_name}}"}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{"{{email}}"}</span>
                </div>
              </div>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#C9A227] outline-none"
              />
            </div>
          </div>

          {/* Action Triggers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0A2647]">Send Single Test Email</h3>
                <p className="text-xs text-slate-500">Preview exact inbox layout before sending to clients</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                />
                <button
                  onClick={handleSendTest}
                  disabled={testing}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 disabled:opacity-50"
                >
                  {testing ? "Sending..." : "Send Test"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-bold text-[#0A2647]">Ready to Dispatch?</p>
                <p className="text-xs text-slate-500">Will send to {recipients.length} target client email(s)</p>
              </div>
              <button
                onClick={handleBulkDispatch}
                disabled={dispatching || recipients.length === 0}
                className="px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-xl font-bold text-sm hover:bg-[#b8911f] transition-all shadow-md hover:scale-105 disabled:opacity-50 cursor-pointer"
              >
                {dispatching ? "Dispatching Follow-Up..." : `🚀 Dispatch to ${recipients.length} Clients`}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Recipient List & Email Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Recipient Roster */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-[#0A2647] mb-3">Target Clients ({recipients.length})</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-100 pr-1">
              {recipients.map((r) => (
                <div key={r.id} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{r.name || `${r.first_name} ${r.last_name}`}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{r.email}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-bold">
                    {r.type || "Lead"}
                  </span>
                </div>
              ))}
              {recipients.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No email recipients found for this segment.</p>
              )}
            </div>
          </div>

          {/* Rendered Email Preview Box */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#0A2647]">Live Inbox Email Preview</h3>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs">
              <p className="text-slate-500 mb-1"><strong>Subject:</strong> {subject.replace("{{first_name}}", "Jane")}</p>
              <p className="text-slate-500 mb-3 border-b pb-2"><strong>From:</strong> admin@domesticrealestate.us</p>
              <div
                className="prose prose-xs max-w-none text-slate-800 font-body"
                dangerouslySetInnerHTML={{
                  __html: body
                    .replace(/\{\{first_name\}\}/g, "Jane")
                    .replace(/\{\{last_name\}\}/g, "Doe")
                    .replace(/\{\{email\}\}/g, "jane@example.com"),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
