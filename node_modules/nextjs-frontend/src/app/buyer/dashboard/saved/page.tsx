"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useState } from "react";

interface SavedProperty {
  id: number;
  title: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  gradient: string;
  savedDate: string;
  agent: string;
}

const INITIAL_PROPERTIES: SavedProperty[] = [
  { id: 1, title: "Modern Villa with Pool", address: "123 Sunset Blvd, Miami", price: "$1,250,000", beds: 4, baths: 3, sqft: "3,200", gradient: "from-blue-400 to-blue-600", savedDate: "Jul 8, 2026", agent: "Sarah Johnson" },
  { id: 2, title: "Downtown Luxury Condo", address: "456 Park Ave, New York", price: "$875,000", beds: 2, baths: 2, sqft: "1,800", gradient: "from-emerald-400 to-emerald-600", savedDate: "Jul 6, 2026", agent: "Michael Chen" },
  { id: 3, title: "Suburban Family Home", address: "789 Oak Street, Austin", price: "$520,000", beds: 3, baths: 2, sqft: "2,400", gradient: "from-amber-400 to-amber-600", savedDate: "Jul 4, 2026", agent: "Emily Davis" },
  { id: 4, title: "Beachfront Bungalow", address: "101 Coast Rd, San Diego", price: "$980,000", beds: 3, baths: 2, sqft: "1,950", gradient: "from-cyan-400 to-cyan-600", savedDate: "Jul 2, 2026", agent: "Sarah Johnson" },
  { id: 5, title: "Mountain View Retreat", address: "555 Pinecrest Dr, Denver", price: "$675,000", beds: 4, baths: 3, sqft: "2,700", gradient: "from-rose-400 to-rose-600", savedDate: "Jun 30, 2026", agent: "Robert Wilson" },
  { id: 6, title: "Urban Studio Apartment", address: "220 Broadway, Chicago", price: "$310,000", beds: 1, baths: 1, sqft: "650", gradient: "from-violet-400 to-violet-600", savedDate: "Jun 28, 2026", agent: "Michael Chen" },
];

export default function SavedPropertiesPage() {
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const removeProperty = (id: number) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
  };

  const shareProperty = (property: SavedProperty) => {
    if (navigator.share) {
      navigator.share({ title: property.title, text: `${property.title} — ${property.price}`, url: window.location.href });
    }
  };

  return (
    <BuyerLayout title="Saved Properties" subtitle="Properties you've favorited for later review.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{properties.length} properties saved</span>
            {selected.length > 0 && (
              <span className="text-sm font-semibold text-[#C9A227]">{selected.length} selected</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selected.length >= 2 && (
              <button className="bg-[#0A2647] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0d3360] transition">
                Compare ({selected.length})
              </button>
            )}
            <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-[#0A2647] text-white" : "text-slate-400 hover:text-slate-600"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-[#0A2647] text-white" : "text-slate-400 hover:text-slate-600"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => {
              const isSelected = selected.includes(prop.id);
              return (
                <div key={prop.id} className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition ${isSelected ? "border-[#C9A227] ring-2 ring-[#C9A227]/20" : "border-slate-200"}`}>
                  <div className={`h-44 bg-gradient-to-br ${prop.gradient} flex items-end p-4 relative`}>
                    <span className="bg-white/90 backdrop-blur text-[#0A2647] px-3 py-1 rounded-lg text-sm font-bold">{prop.price}</span>
                    <button onClick={() => toggleSelect(prop.id)} className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition ${isSelected ? "bg-[#C9A227] text-[#0A2647]" : "bg-white/80 text-slate-500 hover:bg-white"}`}>
                      <svg className="w-4 h-4" fill={isSelected ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#0A2647]">{prop.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{prop.address}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>{prop.beds} Beds</span>
                      <span>{prop.baths} Baths</span>
                      <span>{prop.sqft} sqft</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">Saved {prop.savedDate}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => shareProperty(prop)} className="p-1.5 text-slate-400 hover:text-[#0A2647] hover:bg-slate-100 rounded-lg transition" title="Share">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <button onClick={() => removeProperty(prop.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition" title="Remove">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Details</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Agent</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Saved</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${prop.gradient} flex-shrink-0`} />
                        <div>
                          <p className="font-semibold text-[#0A2647] text-sm">{prop.title}</p>
                          <p className="text-slate-500 text-xs">{prop.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{prop.price}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{prop.beds}bd / {prop.baths}ba / {prop.sqft}sqft</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{prop.agent}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{prop.savedDate}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => shareProperty(prop)} className="text-slate-400 hover:text-[#0A2647] p-1.5 rounded-lg hover:bg-slate-100 transition" title="Share">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <button onClick={() => removeProperty(prop.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Remove">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
