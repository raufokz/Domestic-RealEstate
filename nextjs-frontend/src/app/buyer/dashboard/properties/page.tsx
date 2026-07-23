"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import Link from "next/link";

const PROPERTIES = [
  { id: 1, title: "Oceanfront Retreat", address: "222 Coastal Hwy, Miami Beach, FL", price: "$890,000", match: "96%", beds: 3, baths: 2, sqft: "2,100", gradient: "from-cyan-400 to-blue-500", daysOnMarket: 5 },
  { id: 2, title: "Urban Loft Downtown", address: "55 Main Street, Austin, TX", price: "$445,000", match: "91%", beds: 2, baths: 1, sqft: "1,400", gradient: "from-violet-400 to-purple-500", daysOnMarket: 12 },
  { id: 3, title: "Family Ranch Home", address: "890 Elm Circle, Dallas, TX", price: "$375,000", match: "88%", beds: 4, baths: 3, sqft: "2,800", gradient: "from-emerald-400 to-teal-500", daysOnMarket: 8 },
  { id: 4, title: "Modern Penthouse Suite", address: "1200 Skyline Blvd, Denver, CO", price: "$1,250,000", match: "85%", beds: 3, baths: 3, sqft: "3,200", gradient: "from-rose-400 to-red-500", daysOnMarket: 3 },
  { id: 5, title: "Charming Cottage", address: "78 Oak Lane, Nashville, TN", price: "$285,000", match: "82%", beds: 2, baths: 2, sqft: "1,600", gradient: "from-amber-400 to-orange-500", daysOnMarket: 21 },
  { id: 6, title: "Luxury Waterfront Villa", address: "45 Bayshore Dr, Tampa, FL", price: "$1,675,000", match: "79%", beds: 5, baths: 4, sqft: "4,500", gradient: "from-indigo-400 to-blue-600", daysOnMarket: 15 },
];

export default function BuyerPropertiesPage() {
  return (
    <BuyerLayout title="Recommended Properties" subtitle="Properties matched to your search criteria and preferences.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{PROPERTIES.length} properties recommended</span>
          </div>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white">
              <option>Sort by Match</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROPERTIES.map((prop) => (
            <div key={prop.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className={`h-44 bg-gradient-to-br ${prop.gradient} flex items-start justify-between p-4`}>
                <span className="bg-white/90 backdrop-blur text-[#0A2647] px-3 py-1 rounded-lg text-sm font-bold">{prop.price}</span>
                <span className="bg-[#C9A227] text-[#0A2647] px-2.5 py-1 rounded-lg text-xs font-bold">{prop.match} match</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#0A2647] text-lg">{prop.title}</h3>
                <p className="text-slate-500 text-sm mt-1">{prop.address}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  <span>{prop.beds} Beds</span>
                  <span>{prop.baths} Baths</span>
                  <span>{prop.sqft} sqft</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{prop.daysOnMarket} days on market</span>
                  <div className="flex items-center gap-2">
                    <button className="text-slate-400 hover:text-[#C9A227] transition p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <Link href="/buyer/dashboard/compare" className="bg-[#0A2647] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0A2647]/90 transition">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BuyerLayout>
  );
}
