"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Opportunity {
  id: number;
  slug: string;
  address: string;
  type: string;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
}

export default function InvestorOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const { success, notifyError } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<Opportunity[]>("/investor/opportunities");
      setOpportunities(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load opportunities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave(propertyId: number) {
    setSavingId(propertyId);
    try {
      await apiPost(`/properties/${propertyId}/favorite`);
      success("Saved to your properties.");
    } catch (e) {
      notifyError(e, "Could not save this property.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <InvestorLayout title="Investment Opportunities" subtitle="Active listings on the platform. Run your own numbers with the calculators.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
            <button onClick={fetchData} className="ml-3 underline font-semibold">Retry</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {opportunities.map((opp) => (
                <div key={opp.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{opp.type}</span>
                  <h3 className="font-bold text-[#0A2647] text-sm group-hover:text-[#C9A227] transition mb-1 mt-3">{opp.address}</h3>
                  <p className="text-lg font-bold text-[#0A2647] mt-2">${opp.price?.toLocaleString()}</p>
                  {(opp.beds || opp.baths || opp.sqft) && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      {opp.beds != null && <span>{opp.beds} Beds</span>}
                      {opp.baths != null && <span>{opp.baths} Baths</span>}
                      {opp.sqft != null && <span>{opp.sqft.toLocaleString()} sqft</span>}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/properties/${opp.slug}`} target="_blank" className="flex-1 text-center text-xs font-semibold text-[#0A2647] bg-slate-100 hover:bg-slate-200 rounded-lg py-2 transition">View Details</Link>
                    <button onClick={() => handleSave(opp.id)} disabled={savingId === opp.id} className="flex-1 text-center text-xs font-semibold text-[#C9A227] bg-[#C9A227]/10 hover:bg-[#C9A227]/20 rounded-lg py-2 transition disabled:opacity-50">
                      {savingId === opp.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {opportunities.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">No active listings right now.</div>
            )}
          </>
        )}
      </div>
    </InvestorLayout>
  );
}
