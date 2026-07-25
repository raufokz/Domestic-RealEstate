"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<Invoice[]>("/invoices/my");
        setInvoices(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load invoices.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-navy to-navy-700 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold text-white">My Invoices</h1>
          <p className="text-navy-200 mt-2">View and track your invoices and payments.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-32" />
                    <div className="h-4 bg-slate-200 rounded w-48" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 shadow-card text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-card text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-navy mb-2">No Invoices Yet</h2>
            <p className="text-slate-500 mb-6">You&apos;ll see your invoices here once a service request is processed.</p>
            <Link href="/services/request" className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold rounded-xl hover:shadow-gold transition-all inline-block">
              Request a Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading font-bold text-navy">{inv.invoice_number}</h3>
                      <StatusBadge status={inv.status} />
                    </div>
                    {inv.description && (
                      <p className="text-slate-500 text-sm mt-1">{inv.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Issued: {new Date(inv.created_at).toLocaleDateString()}</span>
                      {inv.due_at && <span>Due: {new Date(inv.due_at).toLocaleDateString()}</span>}
                      {inv.payoneer_invoice_id && <span>Payoneer: {inv.payoneer_invoice_id}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-2xl font-bold text-gold">
                      {formatAmount(inv.amount, inv.currency)}
                    </p>
                    {inv.status === "paid" && inv.paid_at && (
                      <p className="text-green-600 text-xs mt-1">Paid {new Date(inv.paid_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
