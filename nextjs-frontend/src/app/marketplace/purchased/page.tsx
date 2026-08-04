"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { apiGet } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface PurchasedLead {
  id: number;
  lead_id: number;
  amount: string;
  purchased_at: string | null;
  lead: {
    id: number;
    lead_number: string;
    full_name?: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
    location: string | null;
    state: string | null;
    city: string | null;
    budget_min: number | null;
    budget_max: number | null;
    type: string | null;
    marketplace_title: string | null;
    marketplace_category: string | null;
    marketplace_description: string | null;
    marketplace_price: string | null;
    sold_at: string | null;
    property_type: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
  };
}

interface InvoiceData {
  invoice_number: string;
  purchase_id: number;
  lead_number: string;
  lead_title: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: string;
  payment_gateway: string;
  transaction_id: string;
  purchased_at: string;
  company: {
    name: string;
    address: string;
    support_email: string;
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayTitle(lead: PurchasedLead["lead"]): string {
  return lead.marketplace_title || lead.full_name || lead.first_name || `Lead #${lead.lead_number}`;
}

function budgetRange(lead: PurchasedLead["lead"]): string {
  if (!lead.budget_min && !lead.budget_max) return "Budget not provided";
  if (lead.budget_min && lead.budget_max) {
    return `$${Number(lead.budget_min).toLocaleString()}–$${Number(lead.budget_max).toLocaleString()}`;
  }
  return `$${Number(lead.budget_min || lead.budget_max).toLocaleString()}+`;
}

export default function PurchasedLeadsPage() {
  const { user, loading: authLoading } = useAuth();
  const { notifyError } = useToast();

  const [search, setSearch] = useState("");
  const { data, loading, error } = useFetch<{ data: PurchasedLead[] }>(
    `/marketplace/my-purchases${search ? `?search=${encodeURIComponent(search)}` : ""}`
  );

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const fetchInvoice = async (purchaseId: number) => {
    setInvoiceLoading(true);
    try {
      const res = await apiGet<InvoiceData>(`/marketplace/purchases/${purchaseId}/invoice`);
      setSelectedInvoice(res);
    } catch (e) {
      notifyError(e, "Could not fetch invoice details.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const exportCsv = (leadId: number, leadNumber: string) => {
    window.open(`/api/marketplace/purchases/${leadId}/export?format=csv`, "_blank");
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0A2647] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
          <div className="text-4xl mb-3">🔓</div>
          <h1 className="text-2xl font-bold text-[#0A2647] mb-2">Sign in to view your leads</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your unlocked contact details and purchase receipts appear here after signing in.
          </p>
          <Link href="/login" className="inline-block bg-[#C9A227] text-[#0A2647] font-bold px-6 py-3 rounded-xl hover:bg-[#b8911f] transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A2647]">My Purchased Leads</h1>
          <p className="text-slate-500 mt-1">
            Full contact information, property requirements, and receipts for your unlocked leads.
          </p>
        </div>
        <Link href="/marketplace" className="shrink-0 text-sm font-semibold text-[#C9A227] hover:text-[#0A2647] transition">
          ← Back to Marketplace
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, phone, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0A2647]"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg"
          >
            Clear Search
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
              <div className="h-6 bg-slate-100 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="h-4 bg-slate-100 rounded" />
                <div className="h-4 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="text-lg font-bold text-[#0A2647] mb-1">No purchased leads found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {search ? "No leads matched your search query." : "You have not purchased any leads yet."}
          </p>
          <Link
            href="/marketplace"
            className="inline-block mt-5 bg-[#0A2647] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#07162C] transition shadow-sm text-sm"
          >
            Browse Lead Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {data.data.map((purchase) => {
            const lead = purchase.lead;
            return (
              <div
                key={purchase.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header Banner */}
                <div className="bg-[#0A2647] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-white">{displayTitle(lead)}</h2>
                    <p className="text-white/70 text-xs mt-0.5">
                      {lead.lead_number} · Unlocked on {formatDate(purchase.purchased_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchInvoice(purchase.id)}
                      disabled={invoiceLoading}
                      className="text-xs font-bold text-[#0A2647] bg-[#C9A227] px-3.5 py-1.5 rounded-lg hover:bg-[#b8911f] transition"
                    >
                      🧾 View Receipt
                    </button>
                    <button
                      onClick={() => exportCsv(lead.id, lead.lead_number)}
                      className="text-xs font-bold text-white bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-lg hover:bg-white/20 transition"
                    >
                      📥 Export CSV
                    </button>
                  </div>
                </div>

                {/* Main Lead Details Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                  <InfoRow label="Full Name" value={lead.full_name || [lead.first_name, lead.last_name].filter(Boolean).join(" ")} />
                  <InfoRow label="Email Address" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
                  <InfoRow label="Phone Number" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
                  <InfoRow label="Location" value={lead.location || [lead.city, lead.state].filter(Boolean).join(", ")} />
                  <InfoRow label="Estimated Budget" value={budgetRange(lead)} />
                  <InfoRow
                    label="Lead Type"
                    value={lead.type ? `${lead.type.charAt(0).toUpperCase()}${lead.type.slice(1)}` : "—"}
                  />
                  {lead.property_type && <InfoRow label="Property Type" value={lead.property_type} />}
                  {(lead.bedrooms || lead.bathrooms) && (
                    <InfoRow
                      label="Bedrooms / Baths"
                      value={[
                        lead.bedrooms ? `${lead.bedrooms} beds` : "",
                        lead.bathrooms ? `${lead.bathrooms} baths` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  )}
                  <InfoRow label="Amount Paid" value={`$${Number(purchase.amount).toLocaleString()}`} />
                </div>

                {/* Notes or Description */}
                {(lead.marketplace_description || lead.notes) && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-slate-100 pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        {lead.marketplace_description ? "Lead Requirements Summary" : "Notes"}
                      </h3>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {lead.marketplace_description || lead.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#0A2647]">Official Payment Receipt</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedInvoice.invoice_number}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-[#0A2647]">{selectedInvoice.customer_name} ({selectedInvoice.customer_email})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Item:</span>
                <span className="font-bold text-[#0A2647]">{selectedInvoice.lead_title} ({selectedInvoice.lead_number})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-semibold text-slate-700 uppercase">{selectedInvoice.payment_gateway}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-xs text-slate-600">{selectedInvoice.transaction_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date Paid:</span>
                <span className="font-semibold text-slate-700">{formatDate(selectedInvoice.purchased_at)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-[#0A2647]">Total Amount Paid:</span>
                <span className="text-2xl font-black text-emerald-600">${selectedInvoice.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">{selectedInvoice.company.name} · {selectedInvoice.company.support_email}</span>
              <button
                onClick={() => window.print()}
                className="bg-[#0A2647] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#07162C] transition"
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  const display = value && String(value).trim() ? String(value).trim() : "—";
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-[#0A2647] mt-0.5 break-words">
        {href ? (
          <a href={href} className="text-[#C9A227] hover:text-[#0A2647] transition underline underline-offset-2">
            {display}
          </a>
        ) : (
          display
        )}
      </dd>
    </div>
  );
}
