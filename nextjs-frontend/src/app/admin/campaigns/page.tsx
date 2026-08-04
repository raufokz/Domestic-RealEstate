"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";
import HowTo from "@/components/ui/HowTo";

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  subject: string;
  body: string;
  from_email: string;
  reply_to: string;
  recipient_source: string;
  recipients_count: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_at: string;
  sent_at: string | null;
}

const CAMPAIGN_TYPES = [
  "Prospect Outreach",
  "Lead Nurture",
  "New Listing Alert",
  "Market Update/Newsletter",
  "Price Drop/Sold",
  "Open House",
  "Re-engagement",
  "Agent Recruitment",
  "Custom",
];

const DEPARTMENT_EMAILS = [
  "admin@domesticrealestate.us",
  "info@domesticrealestate.us",
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-yellow-100 text-yellow-700",
  sent: "bg-green-100 text-green-700",
  paused: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
};

const TABS = ["All", "Drafts", "Sending", "Sent"];

export default function CampaignsPage() {
  const { success, notifyError } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [confirmSendId, setConfirmSendId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "Prospect Outreach",
    subject: "",
    body: "",
    from_email: DEPARTMENT_EMAILS[0],
    reply_to: "",
    recipient_source: "contacts",
    segment_tag: "",
    segment_city: "",
    segment_source: "",
    manual_emails: "",
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>("/email-campaigns");
      setCampaigns(res.data || res.campaigns || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "Drafts") return c.status === "draft";
    if (activeTab === "Sending") return c.status === "sending" || c.status === "scheduled";
    if (activeTab === "Sent") return c.status === "sent";
    return true;
  });

  const handleCreate = async () => {
    try {
      if (editing) {
        await apiPut(`/email-campaigns/${editing.id}`, form);
        success("Campaign updated.", "Email");
      } else {
        await apiPost("/email-campaigns", form);
        success("Campaign created.", "Email");
      }
      setShowCreateModal(false);
      setEditing(null);
      setForm({
        name: "", type: "Prospect Outreach", subject: "", body: "",
        from_email: DEPARTMENT_EMAILS[0], reply_to: "",
        recipient_source: "contacts", segment_tag: "", segment_city: "",
        segment_source: "", manual_emails: "",
      });
      fetchCampaigns();
    } catch (err) {
      notifyError(err, "Campaign could not be saved.");
      setError("Failed to save campaign");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await apiDelete(`/email-campaigns/${id}`);
      success("Campaign deleted.", "Email");
      fetchCampaigns();
    } catch (err) {
      notifyError(err, "Campaign could not be deleted.");
    }
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      name: c.name,
      type: c.type,
      subject: c.subject,
      body: c.body || "",
      from_email: c.from_email || DEPARTMENT_EMAILS[0],
      reply_to: c.reply_to || "",
      recipient_source: c.recipient_source || "contacts",
      segment_tag: "",
      segment_city: "",
      segment_source: "",
      manual_emails: "",
    });
    setShowCreateModal(true);
  };

  const handleSend = async (id: number) => {
    setSendingId(id);
    try {
      await apiPost(`/email-campaigns/${id}/send`, {});
      success("Campaign queued for sending.", "Email");
      fetchCampaigns();
    } catch (err) {
      notifyError(err, "Campaign send failed.");
      setError("Failed to send campaign");
    } finally {
      setSendingId(null);
      setConfirmSendId(null);
    }
  };

  return (
    <AdminLayout title="Email Campaign Manager">
      <div className="space-y-6">
        <HowTo
          title="How to Send an Email Campaign"
          summary="Send one message to many contacts, then track how it performed."
          requirements={[
            "SMTP must be configured, or nothing will send.",
            "A queue worker must be running — campaigns are queued, not sent from the browser.",
            "Recipients must have a valid email address and recorded consent.",
          ]}
          steps={[
            { text: "Select a consented audience.", detail: "Filter by pipeline, tags, lead type, source, score, or assigned agent. Unsubscribed and suppressed contacts are excluded automatically." },
            "Choose an approved email template.",
            { text: "Preview the recipient count and a sample personalised email.", detail: "Check that merge variables such as {{lead.first_name}} resolve correctly." },
            "Send a test email to yourself first.",
            "Schedule the campaign, or send it now and confirm.",
            { text: "Review opens, clicks, and unsubscribes.", detail: "Tracking data appears on the campaign detail page as recipients engage." },
          ]}
          actionUrl="/admin/email-settings"
          actionLabel="Check email settings"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#0A2647] text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <a
              href="/admin/crm/bulk-email"
              className="px-4 py-2.5 bg-[#0A2647] text-white rounded-lg font-medium hover:bg-[#0c2f57] transition-colors flex items-center gap-1.5 text-sm shadow-sm"
            >
              <span>✉️</span> One-Time Bulk Follow-Up Tool
            </a>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-[#C9A227] text-white rounded-lg font-medium hover:bg-[#b89220] transition-colors text-sm shadow-sm"
            >
              Create Campaign
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2647]" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No campaigns found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first campaign to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Recipients</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sent</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Delivered</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Opened</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Clicked</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <a href={`/admin/campaigns/${campaign.id}`} className="font-medium text-[#0A2647] hover:underline">
                        {campaign.name}
                      </a>
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{campaign.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{campaign.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status] || "bg-gray-100 text-gray-700"}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 font-medium">{campaign.recipients_count}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600">{campaign.sent_count}</td>
                    <td className="px-6 py-4 text-sm text-center text-green-600">{campaign.delivered_count}</td>
                    <td className="px-6 py-4 text-sm text-center text-blue-600">{campaign.opened_count}</td>
                    <td className="px-6 py-4 text-sm text-center text-purple-600">{campaign.clicked_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(campaign.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <a href={`/admin/campaigns/${campaign.id}`} className="text-sm text-[#0A2647] hover:underline">View</a>
                      <button onClick={() => openEdit(campaign)} className="text-sm text-[#C9A227] hover:underline font-medium">Edit</button>
                      {campaign.status === "draft" && (
                        <button
                          onClick={() => setConfirmSendId(campaign.id)}
                          className="text-sm text-[#C9A227] hover:underline font-medium"
                        >
                          Send
                        </button>
                      )}
                      <button onClick={() => handleDelete(campaign.id)} className="text-sm text-red-600 hover:underline font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {confirmSendId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Confirm Send</h3>
              <p className="text-gray-600 text-sm mb-4">
                This will send to{" "}
                <strong>{campaigns.find((c) => c.id === confirmSendId)?.recipients_count || 0} recipients</strong>.
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmSendId(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSend(confirmSendId)}
                  disabled={sendingId === confirmSendId}
                  className="px-4 py-2 bg-[#8B1E3F] text-white rounded-lg hover:bg-[#721833] disabled:opacity-50"
                >
                  {sendingId === confirmSendId ? "Sending..." : "Confirm Send"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 my-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#0A2647]">{editing ? "Edit Campaign" : "Create Campaign"}</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                      placeholder="e.g. Summer Open House Series"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                    >
                      {CAMPAIGN_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                    <select
                      value={form.from_email}
                      onChange={(e) => setForm({ ...form, from_email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                    >
                      {DEPARTMENT_EMAILS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reply To</label>
                    <input
                      type="email"
                      value={form.reply_to}
                      onChange={(e) => setForm({ ...form, reply_to: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                      placeholder="reply@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                    placeholder="Email subject line"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                    placeholder="Email content..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Source</label>
                  <select
                    value={form.recipient_source}
                    onChange={(e) => setForm({ ...form, recipient_source: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                  >
                    <option value="contacts">All Contacts</option>
                    <option value="leads">All Leads</option>
                    <option value="subscribers">Subscribers</option>
                    <option value="segment">Segment (Filter)</option>
                    <option value="manual">Manual List</option>
                  </select>
                </div>
                {form.recipient_source === "segment" && (
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tag</label>
                      <input
                        type="text"
                        value={form.segment_tag}
                        onChange={(e) => setForm({ ...form, segment_tag: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g. buyer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        value={form.segment_city}
                        onChange={(e) => setForm({ ...form, segment_city: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g. Miami"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
                      <input
                        type="text"
                        value={form.segment_source}
                        onChange={(e) => setForm({ ...form, segment_source: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g. website"
                      />
                    </div>
                  </div>
                )}
                {form.recipient_source === "manual" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paste Email Addresses (one per line)</label>
                    <textarea
                      value={form.manual_emails}
                      onChange={(e) => setForm({ ...form, manual_emails: e.target.value })}
                      rows={5}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                      placeholder="user1@example.com&#10;user2@example.com"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-5 py-2 bg-[#0A2647] text-white rounded-lg hover:bg-[#0d3260] font-medium"
                  >
                    {editing ? "Save Changes" : "Create Campaign"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
