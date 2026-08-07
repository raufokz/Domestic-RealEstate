"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface SavedProperty {
  id: number;
  slug: string;
  title: string;
  address: string;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  status: string;
  savedAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-blue-100 text-blue-700",
  sold: "bg-slate-100 text-slate-600",
};

export default function InvestorSavedPropertiesPage() {
  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notifyError } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<SavedProperty[]>("/investor/saved-properties");
      setProperties(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your saved properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRemove(propertyId: number) {
    try {
      await apiDelete(`/investor/saved-properties/${propertyId}`);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (e) {
      notifyError(e, "Could not remove this property.");
    }
  }

  return (
    <InvestorLayout title="Saved Properties" subtitle="Properties you have bookmarked for further analysis.">
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
            <span className="text-sm text-slate-500">{properties.length} saved properties</span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#0A2647]">{prop.title}</h3>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${STATUS_STYLES[prop.status] || "bg-slate-100 text-slate-600"}`}>{prop.status}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{prop.address}</p>
                    <p className="text-lg font-bold text-[#0A2647] mt-2">${prop.price?.toLocaleString()}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      {prop.beds != null && <span>{prop.beds} Beds</span>}
                      {prop.baths != null && <span>{prop.baths} Baths</span>}
                      {prop.sqft != null && <span>{prop.sqft.toLocaleString()} sqft</span>}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">Saved {prop.savedAt}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRemove(prop.id)} className="text-slate-400 hover:text-red-500 transition p-1" title="Remove">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <Link href={`/properties/${prop.slug}`} target="_blank" className="bg-[#0A2647] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0A2647]/90 transition">
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {properties.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                No saved properties yet. Browse{" "}
                <Link href="/investor/dashboard/opportunities" className="text-[#C9A227] font-semibold hover:underline">opportunities</Link>{" "}
                and save the ones you want to track.
              </div>
            )}
          </>
        )}
      </div>
    </InvestorLayout>
  );
}
