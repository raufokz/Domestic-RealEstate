"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "@/lib/api";

interface Search {
  id: number;
  name: string;
  location: string;
  priceMin: string;
  priceMax: string;
  beds: number;
  baths: number;
  newMatches: number;
  lastAlert: string;
  alertEnabled: boolean;
}

const FALLBACK_DATA: Search[] = [
  { id: 1, name: "Miami Beach Homes", location: "Miami, FL", priceMin: "$300K", priceMax: "$600K", beds: 3, baths: 2, newMatches: 5, lastAlert: "2h ago", alertEnabled: true },
  { id: 2, name: "Austin Family Homes", location: "Austin, TX", priceMin: "$250K", priceMax: "$500K", beds: 4, baths: 3, newMatches: 2, lastAlert: "1d ago", alertEnabled: true },
  { id: 3, name: "NYC Luxury Condos", location: "New York, NY", priceMin: "$800K", priceMax: "$2M", beds: 2, baths: 2, newMatches: 0, lastAlert: "3d ago", alertEnabled: false },
  { id: 4, name: "Denver Mountain Homes", location: "Denver, CO", priceMin: "$400K", priceMax: "$750K", beds: 3, baths: 2, newMatches: 8, lastAlert: "12h ago", alertEnabled: true },
  { id: 5, name: "Dallas Suburban", location: "Dallas, TX", priceMin: "$200K", priceMax: "$400K", beds: 3, baths: 2, newMatches: 1, lastAlert: "5d ago", alertEnabled: true },
];

export default function BuyerSearchesPage() {
  const [searches, setSearches] = useState<Search[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Search[]>("/buyer/searches");
        setSearches(result);
      } catch {
        setSearches(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleDelete(id: number) {
    try {
      await apiDelete(`/buyer/searches/${id}`);
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setSearches((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <BuyerLayout title="Saved Searches" subtitle="Manage your property search alerts.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{searches.length} saved searches</span>
              </div>
              <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                + New Search
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Search Name</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Criteria</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">New Matches</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Last Alert</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Alert</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searches.map((search) => (
                      <tr key={search.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <span className="font-semibold text-[#0A2647] text-sm">{search.name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-slate-600">
                            <p>{search.location}</p>
                            <p className="text-xs text-slate-400">{search.priceMin} — {search.priceMax} · {search.beds} bd / {search.baths} ba</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-semibold ${search.newMatches > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                            {search.newMatches > 0 ? `${search.newMatches} new` : "None"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{search.lastAlert}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${search.alertEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                            {search.alertEnabled ? "On" : "Off"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Run</button>
                            <button className="text-slate-400 hover:text-[#0A2647] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Edit</button>
                            <button onClick={() => handleDelete(search.id)} className="text-slate-400 hover:text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {searches.length === 0 && (
                <div className="p-8 text-center text-slate-400">No saved searches yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </BuyerLayout>
  );
}
