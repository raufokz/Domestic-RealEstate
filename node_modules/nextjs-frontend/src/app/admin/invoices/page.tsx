"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Invoice {
  id: number;
  invoice_number: string;
  payoneer_invoice_id?: string;
  description?: string;
  amount: number;
  currency: string;
  status: string;
  due_at?: string;
  paid_at?: string;
  user_id: number;
  created_at: string;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    sent: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-500 line-through",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default function AdminInvoicesPage() {
  const { success, notifyError } = useToast();
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [manualPaymentFor, setManualPaymentFor] = useState<Invoice | null>(null);
  const [manualRef, setManualRef] = useState("");
  const [manualMethod, setManualMethod] = useState<"bank_transfer" | "check" | "other">("bank_transfer");
  const [manualNote, setManualNote] = useState("");

  useEffect(() => { loadInvoices(); }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await apiGet<Invoice[]>("/admin/invoices");
      setInvoices(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load invoices. Please try again.");
      setInvoices([]);
    }
    setLoading(false);
  }

  async function sendInvoice(id: number) {
    setUpdating(id);
    try {
      const res = await apiPost<{ payoneer_link: string }>(`/admin/invoices/${id}/send`);
      success(`Invoice sent with a real Payoneer checkout link: ${res.payoneer_link}`);
      loadInvoices();
    } catch (e) {
      notifyError(e, "Could not send this invoice.");
    } finally {
      setUpdating(null);
    }
  }

  async function downloadPdf(id: number, invoiceNumber: string) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_BASE}/admin/invoices/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Could not generate PDF.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not download this invoice.");
    }
  }

  async function submitManualPayment() {
    if (!manualPaymentFor || !manualRef.trim()) return;
    setUpdating(manualPaymentFor.id);
    try {
      await apiPost(`/admin/invoices/${manualPaymentFor.id}/record-manual-payment`, {
        reference: manualRef,
        method: manualMethod,
        note: manualNote || undefined,
      });
      success("Payment recorded — invoice marked paid.");
      setManualPaymentFor(null);
      setManualRef("");
      setManualNote("");
      loadInvoices();
    } catch (e) {
      notifyError(e, "Could not record this payment.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">Manage Payoneer invoices and track payment status.</p>
        </div>
        <button onClick={loadInvoices} className="px-4 py-2 text-sm font-medium text-navy border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl p-5 shadow-card animate-pulse h-20" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={loadInvoices}
            className="mt-3 px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-card text-center">
          <p className="text-slate-500">No invoices yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-4 font-semibold text-navy">Invoice #</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Description</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Amount</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Status</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Due Date</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Payoneer ID</th>
                  <th className="text-right px-5 py-4 font-semibold text-navy">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-medium text-navy">{inv.invoice_number}</td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{inv.description || "—"}</td>
                    <td className="px-5 py-4 font-heading font-bold text-navy">{formatAmount(inv.amount, inv.currency)}</td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {inv.due_at ? new Date(inv.due_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{inv.payoneer_invoice_id || "—"}</td>
                    <td className="px-5 py-4 text-right space-x-3 whitespace-nowrap">
                      {inv.status === "draft" && (
                        <button
                          onClick={() => sendInvoice(inv.id)}
                          disabled={updating === inv.id}
                          className="text-xs font-semibold text-navy hover:text-gold transition-colors disabled:opacity-50"
                        >
                          {updating === inv.id ? "Sending..." : "Send via Payoneer"}
                        </button>
                      )}
                      {inv.status !== "paid" && inv.status !== "voided" && (
                        <button
                          onClick={() => setManualPaymentFor(inv)}
                          disabled={updating === inv.id}
                          className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                        >
                          Record Manual Payment
                        </button>
                      )}
                      <button
                        onClick={() => downloadPdf(inv.id, inv.invoice_number)}
                        className="text-xs font-semibold text-slate-500 hover:text-navy transition-colors"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {manualPaymentFor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-navy">Record Manual Payment</h3>
              <p className="text-xs text-slate-500 mt-1">
                For payments received outside Payoneer (wire transfer, check). This is logged to the audit trail.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Method</label>
              <select
                value={manualMethod}
                onChange={(e) => setManualMethod(e.target.value as typeof manualMethod)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference # *</label>
              <input
                type="text"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                placeholder="e.g. wire confirmation number"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Note (optional)</label>
              <textarea
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setManualPaymentFor(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={submitManualPayment}
                disabled={!manualRef.trim() || updating === manualPaymentFor.id}
                className="px-4 py-2.5 bg-gold text-navy rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {updating === manualPaymentFor.id ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
