"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPut } from "@/lib/api";
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

  async function markPaid(id: number) {
    setUpdating(id);
    try {
      await apiPut(`/admin/invoices/${id}`, { status: "paid" });
      setInvoices((is) => is.map((i) => i.id === id ? { ...i, status: "paid", paid_at: new Date().toISOString() } : i));
      success("Invoice marked as paid.");
    } catch (e) {
      // Payment status must never be shown as paid unless the server confirmed it.
      notifyError(e, "Could not mark this invoice as paid. Please try again.");
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
                    <td className="px-5 py-4 text-right">
                      {inv.status !== "paid" && inv.status !== "cancelled" && (
                        <button
                          onClick={() => markPaid(inv.id)}
                          disabled={updating === inv.id}
                          className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                        >
                          {updating === inv.id ? "Updating..." : "Mark as Paid"}
                        </button>
                      )}
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
