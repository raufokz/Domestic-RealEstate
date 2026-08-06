"use client";

import WholesalerLayout from "@/components/wholesaler/WholesalerLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface Deal {
  id: number;
  deal_number: string;
  title: string;
  address: string;
  city: string | null;
  state: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  year_built: number | null;
  asking_price: number | null;
  arv: number | null;
  repair_estimate: number | null;
  assignment_fee: number | null;
  monthly_rent_estimate: number | null;
  deal_source: string | null;
  condition: string | null;
  description: string | null;
  repair_details: string | null;
  status: "draft" | "new" | "under_contract" | "assigned" | "closed";
  assigned_buyer: { id: number; name: string; email: string } | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  new: "bg-blue-100 text-blue-700",
  under_contract: "bg-amber-100 text-amber-700",
  assigned: "bg-purple-100 text-purple-700",
  closed: "bg-emerald-100 text-emerald-700",
};

function formatMoney(n: number | null): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function WholesalerDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewing, setViewing] = useState<Deal | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const result = await apiGet<{ data: Deal[] }>(`/wholesaler/deals?${params}`);
      setDeals(result.data ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your deals.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return (
    <WholesalerLayout title="My Submitted Deals" subtitle="Track and manage all your submitted wholesale deals.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{deals.length} deal{deals.length === 1 ? "" : "s"} {statusFilter ? "matching filter" : "submitted"}</span>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="new">New</option>
              <option value="under_contract">Under Contract</option>
              <option value="assigned">Assigned</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-700 text-sm">{error}</p>
              <button onClick={fetchDeals} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:opacity-90">
                Retry
              </button>
            </div>
          ) : deals.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">No deals found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Deal</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Asking Price</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">ARV</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Repairs</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Assigned Buyer</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Submitted</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#0A2647] text-sm">{deal.title}</p>
                        <p className="text-slate-500 text-xs">{[deal.address, deal.city, deal.state].filter(Boolean).join(", ")}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[#0A2647]">{formatMoney(deal.asking_price)}</td>
                      <td className="px-5 py-4 text-sm font-medium text-emerald-600">{formatMoney(deal.arv)}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{formatMoney(deal.repair_estimate)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[deal.status]}`}>{deal.status.replace("_", " ")}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{deal.assigned_buyer?.name || "—"}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{new Date(deal.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => setViewing(deal)} className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A2647]">{viewing.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{viewing.deal_number}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[viewing.status]}`}>{viewing.status.replace("_", " ")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500 text-xs block">Address</span>{[viewing.address, viewing.city, viewing.state].filter(Boolean).join(", ")}</div>
              <div><span className="text-slate-500 text-xs block">Property Type</span>{viewing.property_type || "—"}</div>
              <div><span className="text-slate-500 text-xs block">Bed / Bath</span>{viewing.bedrooms ?? "—"} / {viewing.bathrooms ?? "—"}</div>
              <div><span className="text-slate-500 text-xs block">Sqft / Year Built</span>{viewing.sqft ?? "—"} / {viewing.year_built ?? "—"}</div>
              <div><span className="text-slate-500 text-xs block">Asking Price</span>{formatMoney(viewing.asking_price)}</div>
              <div><span className="text-slate-500 text-xs block">ARV</span>{formatMoney(viewing.arv)}</div>
              <div><span className="text-slate-500 text-xs block">Repair Estimate</span>{formatMoney(viewing.repair_estimate)}</div>
              <div><span className="text-slate-500 text-xs block">Assignment Fee</span>{formatMoney(viewing.assignment_fee)}</div>
              <div><span className="text-slate-500 text-xs block">Monthly Rent Est.</span>{formatMoney(viewing.monthly_rent_estimate)}</div>
              <div><span className="text-slate-500 text-xs block">Deal Source</span>{viewing.deal_source || "—"}</div>
              <div><span className="text-slate-500 text-xs block">Condition</span>{viewing.condition || "—"}</div>
              <div><span className="text-slate-500 text-xs block">Assigned Buyer</span>{viewing.assigned_buyer?.name || "—"}</div>
            </div>
            {viewing.description && (
              <div><span className="text-slate-500 text-xs block mb-1">Description</span><p className="text-sm text-slate-700">{viewing.description}</p></div>
            )}
            {viewing.repair_details && (
              <div><span className="text-slate-500 text-xs block mb-1">Repair Details</span><p className="text-sm text-slate-700">{viewing.repair_details}</p></div>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewing(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </WholesalerLayout>
  );
}
