"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/lib/api";

interface SentEmail {
  id: number;
  to_email: string;
  subject: string;
  status: string;
  sent_at: string;
  body?: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Sent" },
  delivered: { bg: "bg-green-100", text: "text-green-700", label: "Delivered" },
  opened: { bg: "bg-purple-100", text: "text-purple-700", label: "Opened" },
  clicked: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Clicked" },
  bounced: { bg: "bg-red-100", text: "text-red-700", label: "Bounced" },
  failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
};

export default function SentEmailsPage() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewEmail, setViewEmail] = useState<SentEmail | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      const res = await 
apiGet<any>(`/sent-emails?${params.toString()}`);
      setEmails(res.data || res.emails || []);
      setTotalPages(res.last_page || res.total_pages || 1);
    } catch {
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [page, dateFrom, dateTo]);

  return (
    <AdminLayout title="Sent Emails History">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
              className="text-sm text-[#8B1E3F] hover:underline pb-2"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2647]" />
          </div>
        ) : emails.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No emails found</p>
            <p className="text-gray-400 text-sm mt-1">Sent emails will appear here</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">To</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sent At</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {emails.map((email) => {
                    const statusConfig = STATUS_CONFIG[email.status] || STATUS_CONFIG.sent;
                    return (
                      <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{email.to_email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-[300px]">{email.subject}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(email.sent_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setViewEmail(email)}
                            className="text-sm text-[#0A2647] hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {viewEmail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0A2647]">Email Content</h3>
                <button onClick={() => setViewEmail(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">To:</span>
                  <span className="text-gray-900">{viewEmail.to_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subject:</span>
                  <span className="text-gray-900">{viewEmail.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-gray-900 capitalize">{viewEmail.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sent:</span>
                  <span className="text-gray-900">{new Date(viewEmail.sent_at).toLocaleString()}</span>
                </div>
                {viewEmail.body && (
                  <div className="pt-3 border-t">
                    <p className="text-gray-500 mb-2">Content:</p>
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">{viewEmail.body}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
