"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";

const SAVED_PROPERTIES = [
  { id: 1, title: "Distressed Ranch Home", address: "452 Oak Street, Tampa, FL", price: "$185,000", roi: "18%", beds: 3, baths: 2, sqft: "1,800", status: "Off-Market", gradient: "from-emerald-400 to-teal-500", saved: "2d ago" },
  { id: 2, title: "Multi-Family Duplex", address: "1120 Pine Ave, Orlando, FL", price: "$340,000", roi: "14%", beds: 4, baths: 3, sqft: "2,400", status: "Active", gradient: "from-blue-400 to-indigo-500", saved: "5d ago" },
  { id: 3, title: "Fixer-Upper Colonial", address: "78 Maple Drive, Miami, FL", price: "$275,000", roi: "22%", beds: 3, baths: 2, sqft: "2,100", status: "Pending", gradient: "from-amber-400 to-orange-500", saved: "1w ago" },
  { id: 4, title: "Vacation Rental Cabin", address: "901 Mountain Trail, Gatlinburg, TN", price: "$420,000", roi: "16%", beds: 2, baths: 2, sqft: "1,200", status: "Active", gradient: "from-violet-400 to-purple-500", saved: "1w ago" },
  { id: 5, title: "BRRRR Candidate", address: "335 Cedar Lane, Jacksonville, FL", price: "$155,000", roi: "25%", beds: 3, baths: 1, sqft: "1,400", status: "Off-Market", gradient: "from-rose-400 to-red-500", saved: "2w ago" },
];

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  "Off-Market": "bg-amber-100 text-amber-700",
  Pending: "bg-blue-100 text-blue-700",
};

export default function InvestorSavedPropertiesPage() {
  return (
    <InvestorLayout title="Saved Properties" subtitle="Properties you have bookmarked for further analysis.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{SAVED_PROPERTIES.length} saved properties</span>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white">
              <option>Sort by Saved Date</option>
              <option>Price: Low to High</option>
              <option>ROI: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAVED_PROPERTIES.map((prop) => (
            <div key={prop.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className={`h-40 bg-gradient-to-br ${prop.gradient} flex items-start justify-between p-4`}>
                <span className="bg-white/90 backdrop-blur text-[#0A2647] px-3 py-1 rounded-lg text-sm font-bold">{prop.price}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[prop.status]} backdrop-blur`}>{prop.status}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0A2647]">{prop.title}</h3>
                  <span className="text-emerald-600 font-bold text-sm">{prop.roi} ROI</span>
                </div>
                <p className="text-slate-500 text-sm mt-1">{prop.address}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>{prop.beds} Beds</span>
                  <span>{prop.baths} Baths</span>
                  <span>{prop.sqft} sqft</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Saved {prop.saved}</span>
                  <div className="flex items-center gap-2">
                    <button className="text-slate-400 hover:text-red-500 transition p-1" title="Remove">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button className="bg-[#0A2647] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0A2647]/90 transition">
                      Analyze
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InvestorLayout>
  );
}
