"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";

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

interface Recipient {
  id: number;
  email: string;
  name: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-yellow-100 text-yellow-700",
  sent: "bg-green-100 text-green-700",
  paused: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
};

const RECIPIENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-600",
  delivered: "bg-green-100 text-green-600",
  opened: "bg-purple-100 text-purple-600",
  clicked: "bg-indigo-100 text-indigo-600",
  bounced: "bg-red-100 text-red-600",
  failed: "bg-red-100 text-red-600",
  unsubscribed: "bg-orange-100 text-orange-600",
};

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignRes, recipientsRes] = await Promise.all([
        apiGet<any>(`/email-campaigns/${id}`),
        apiGet<any>(`/email-campaigns/${id}/recipients`),
      ]);
      setCampaign(campaignRes.data || campaignRes.campaign || campaignRes);
      setRecipients(recipientsRes.data || recipientsRes.recipients || []);
    } catch {
      setError("Failed to load campaign data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleSend = async () => {
    setSending(true);
    try {
      await apiPost(`/email-campaigns/${id}/send`, {});
      fetchData();
    } catch {
      setError("Failed to send campaign");
    } finally {
      setSending(false);
      setShowConfirm(false);
    }
  };

  const getRate = (num: number, denom: number) =>
    denom > 0 ? ((num / denom) * 100).toFixed(1) : "0.0";

  if (loading) {
    return (
      <AdminLayout title="Campaign Detail">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2647]" />
        </div>
      </AdminLayout>
    );
  }

  if (!campaign) {
    return (
      <AdminLayout title="Campaign Detail">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Campaign not found</p>
        </div>
      </AdminLayout>
    );
  }

  const deliveryProgress = campaign.recipients_count > 0
    ? (campaign.sent_count / campaign.recipients_count) * 100
    : 0;

  return (
    <AdminLayout title={`Campaign: ${campaign.name}`}>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-[#0A2647]">{campaign.name}</h2>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status] || "bg-gray-100 text-gray-700"}`}>
                  {campaign.status}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p><span className="font-medium">Type:</span> {campaign.type}</p>
                <p><span className="font-medium">From:</span> {campaign.from_email}</p>
                {campaign.reply_to && <p><span className="font-medium">Reply To:</span> {campaign.reply_to}</p>}
                <p><span className="font-medium">Subject:</span> {campaign.subject}</p>
                <p><span className="font-medium">Created:</span> {new Date(campaign.created_at).toLocaleString()}</p>
                {campaign.sent_at && <p><span className="font-medium">Sent:</span> {new Date(campaign.sent_at).toLocaleString()}</p>}
              </div>
            </div>
            <div className="flex space-x-3">
              {campaign.status === "draft" && (
                <>
                  <a href={`/admin/campaigns/${id}/edit`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Edit
                  </a>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-4 py-2 bg-[#8B1E3F] text-white rounded-lg text-sm font-medium hover:bg-[#721833]"
                  >
                    Send Campaign
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
              <span className="text-sm text-gray-500">{campaign.sent_count} / {campaign.recipients_count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#0A2647] h-3 rounded-full transition-all duration-500"
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {[
            { label: "Sent", value: campaign.sent_count, color: "text-[#0A2647]" },
            { label: "Delivered", value: campaign.delivered_count, color: "text-green-600", rate: getRate(campaign.delivered_count, campaign.sent_count) },
            { label: "Opened", value: campaign.opened_count, color: "text-blue-600", rate: getRate(campaign.opened_count, campaign.delivered_count) },
            { label: "Clicked", value: campaign.clicked_count, color: "text-purple-600", rate: getRate(campaign.clicked_count, campaign.opened_count) },
            { label: "Bounced", value: campaign.bounced_count, color: "text-red-600", rate: getRate(campaign.bounced_count, campaign.sent_count) },
            { label: "Unsubscribed", value: campaign.unsubscribed_count, color: "text-orange-600", rate: getRate(campaign.unsubscribed_count, campaign.delivered_count) },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              {stat.rate && <p className="text-xs text-gray-400 mt-0.5">{stat.rate}%</p>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-[#0A2647]">Recipients ({recipients.length})</h3>
          </div>
          {recipients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No recipients found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sent At</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Opened At</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Clicked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recipients.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{r.email}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{r.name || "—"}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${RECIPIENT_STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{r.sent_at ? new Date(r.sent_at).toLocaleString() : "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{r.opened_at ? new Date(r.opened_at).toLocaleString() : "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{r.clicked_at ? new Date(r.clicked_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Confirm Send</h3>
              <p className="text-gray-600 text-sm mb-4">
                This will send <strong>{campaign.subject}</strong> to{" "}
                <strong>{campaign.recipients_count} recipients</strong>. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="px-4 py-2 bg-[#8B1E3F] text-white rounded-lg hover:bg-[#721833] disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Confirm Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
