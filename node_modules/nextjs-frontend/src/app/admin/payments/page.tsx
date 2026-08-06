"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  currency: string;
  status: "pending" | "sent" | "paid" | "voided";
  description: string | null;
  due_date: string | null;
  paid_at: string | null;
  sent_at: string | null;
  payoneer_invoice_id: string | null;
  user: { id: number; name: string; email: string } | null;
  created_at: string;
}

interface InvoiceStats {
  total_invoices: number;
  total_revenue: number;
  pending_amount: number;
  sent_amount: number;
  overdue_amount: number;
  invoices_by_status: { status: string; count: number; total: number }[];
  recent_invoices: Invoice[];
  monthly_revenue: { month: string; revenue: number }[];
}

interface PaginatedResponse {
  data: Invoice[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  voided: { label: "Voided", color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

function getEffectiveStatus(inv: Invoice): string {
  if (inv.status === "sent" && inv.due_date && new Date(inv.due_date) < new Date()) return "overdue";
  return inv.status;
}

export default function PaymentsPage() {
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [payModal, setPayModal] = useState<Invoice | null>(null);
  const [txnId, setTxnId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, invoicesRes] = await Promise.allSettled([
        apiGet<InvoiceStats>("/admin/invoices/stats"),
        apiGet<PaginatedResponse>(`/admin/invoices${filter ? `?status=${filter}` : ""}${search ? `${filter ? "&" : "?"}search=${encodeURIComponent(search)}` : ""}`),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (invoicesRes.status === "fulfilled") setInvoices(invoicesRes.value.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  async function handleMarkPaid(invoice: Invoice) {
    try {
      setActionLoading(invoice.id);
      await apiPost(`/admin/invoices/${invoice.id}/record-manual-payment`, {
        reference: txnId || `manual-${Date.now()}`,
        method: "other",
      });
      setPayModal(null);
      setTxnId("");
      fetchData();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSend(invoice: Invoice) {
    try {
      setActionLoading(invoice.id);
      await apiPost(`/admin/invoices/${invoice.id}/send`, {});
      fetchData();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function handleVoid(invoice: Invoice) {
    try {
      setActionLoading(invoice.id);
      await apiPost(`/admin/invoices/${invoice.id}/void`, {});
      fetchData();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount || 0);
  }

  return (
    <AdminLayout title="Payment Management">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading payments...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: formatCurrency(stats?.total_revenue ?? 0), icon: "\uD83D\uDCB0", bg: "bg-green-50", border: "border-green-200" },
                { label: "Pending", value: formatCurrency(stats?.pending_amount ?? 0), icon: "\u23F3", bg: "bg-yellow-50", border: "border-yellow-200" },
                { label: "Overdue", value: formatCurrency(stats?.overdue_amount ?? 0), icon: "\u26A0\uFE0F", bg: "bg-red-50", border: "border-red-200" },
                { label: "Sent (Unpaid)", value: formatCurrency(stats?.sent_amount ?? 0), icon: "\uD83D\uDCE8", bg: "bg-blue-50", border: "border-blue-200" },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-5`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0A2647]">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Payoneer Instructions */}
            <div className="bg-gradient-to-r from-[#0A2647] to-[#1a3d6d] rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Payoneer Payment Instructions</h3>
              <p className="text-sm text-gray-300 mb-3">Send Payoneer payment requests to clients using the link format below. Invoices can be marked as paid once payment is confirmed.</p>
              <div className="bg-white/10 rounded-lg p-3 text-sm font-mono">
                https://www.payoneer.com/pay?voucher_code=MANUAL&amp;invoice=&lt;INVOICE_NUMBER&gt;
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-300">Total Invoices</p>
                  <p className="text-xl font-bold">{stats?.total_invoices ?? 0}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-300">Paid Invoices</p>
                  <p className="text-xl font-bold">{stats?.invoices_by_status?.find(s => s.status === "paid")?.count ?? 0}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-300">Voided</p>
                  <p className="text-xl font-bold">{stats?.invoices_by_status?.find(s => s.status === "voided")?.count ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-wrap">
                {["", "pending", "sent", "paid", "voided"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === f
                        ? "bg-[#0A2647] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none flex-1 max-w-xs"
              />
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-[#0A2647]">Invoices</h2>
              </div>
              {invoices.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="text-4xl mb-4">{"\uD83D\uDCC4"}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-500 text-sm">Create an invoice to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0A2647] text-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Invoice #</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map((inv) => {
                        const es = getEffectiveStatus(inv);
                        const sc = statusConfig[es] || statusConfig.pending;
                        return (
                          <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-sm font-medium text-[#0A2647]">{inv.invoice_number}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{inv.user?.name ?? "N/A"}</td>
                            <td className="px-6 py-3 text-sm font-semibold text-[#0A2647]">{formatCurrency(inv.amount)}</td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${sc.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {sc.label}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3 text-sm">
                                <button onClick={() => setViewInvoice(inv)} className="text-[#C9A227] hover:text-[#0A2647] font-medium">
                                  View
                                </button>
                                {inv.status === "pending" && (
                                  <button
                                    onClick={() => handleSend(inv)}
                                    disabled={actionLoading === inv.id}
                                    className="text-[#8B1E3F] hover:text-[#6d1832] font-medium disabled:opacity-50"
                                  >
                                    Send
                                  </button>
                                )}
                                {inv.status !== "paid" && inv.status !== "voided" && (
                                  <button
                                    onClick={() => { setPayModal(inv); setTxnId(""); }}
                                    disabled={actionLoading === inv.id}
                                    className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                {inv.status !== "paid" && inv.status !== "voided" && (
                                  <button
                                    onClick={() => handleVoid(inv)}
                                    disabled={actionLoading === inv.id}
                                    className="text-gray-400 hover:text-gray-600 font-medium disabled:opacity-50"
                                  >
                                    Void
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Monthly Revenue */}
            {stats?.monthly_revenue && stats.monthly_revenue.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-[#0A2647]">Monthly Revenue</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {stats.monthly_revenue.map((m) => (
                      <div key={m.month} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm font-medium text-gray-700">{m.month}</span>
                        <span className="text-sm font-bold text-[#0A2647]">{formatCurrency(m.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* View Invoice Modal */}
        {viewInvoice && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Invoice {viewInvoice.invoice_number}</h3>
                  <button onClick={() => setViewInvoice(null)} className="text-gray-400 hover:text-gray-600">{"\u2715"}</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Client</p>
                    <p className="font-semibold text-[#0A2647]">{viewInvoice.user?.name ?? "N/A"}</p>
                    <p className="text-xs text-gray-400">{viewInvoice.user?.email ?? ""}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="font-semibold text-[#0A2647]">{formatCurrency(viewInvoice.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${statusConfig[getEffectiveStatus(viewInvoice)]?.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[getEffectiveStatus(viewInvoice)]?.dot}`} />
                      {statusConfig[getEffectiveStatus(viewInvoice)]?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Currency</p>
                    <p className="font-semibold text-[#0A2647]">{viewInvoice.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <p className="font-semibold text-[#0A2647]">{viewInvoice.due_date ? new Date(viewInvoice.due_date).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="font-semibold text-[#0A2647]">{new Date(viewInvoice.created_at).toLocaleDateString()}</p>
                  </div>
                  {viewInvoice.description && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-700">{viewInvoice.description}</p>
                    </div>
                  )}
                  {viewInvoice.payoneer_invoice_id && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Payoneer Transaction ID</p>
                      <p className="text-sm font-mono text-gray-700">{viewInvoice.payoneer_invoice_id}</p>
                    </div>
                  )}
                </div>
                {viewInvoice.status !== "paid" && viewInvoice.status !== "voided" && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Payoneer Payment Link</p>
                    <p className="text-xs font-mono text-[#0A2647] break-all">
                      https://www.payoneer.com/pay?voucher_code=MANUAL&invoice={viewInvoice.invoice_number}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button onClick={() => setViewInvoice(null)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark Paid Modal */}
        {payModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Mark Invoice as Paid</h3>
                  <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-600">{"\u2715"}</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Invoice: <strong>{payModal.invoice_number}</strong></p>
                  <p className="text-lg font-bold text-[#0A2647]">{formatCurrency(payModal.amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payoneer Transaction ID (optional)</label>
                  <input
                    type="text"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="e.g. TXN-12345678"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setPayModal(null)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkPaid(payModal)}
                  disabled={actionLoading === payModal.id}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {actionLoading === payModal.id ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
