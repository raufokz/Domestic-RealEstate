"use client";

import WholesalerLayout from "@/components/wholesaler/WholesalerLayout";

const DEALS = [
  { id: 1, title: "Bank-Owned Duplex", address: "890 Oak Street, Tampa, FL", askingPrice: "$210,000", arv: "$340,000", repair: "$45,000", status: "New", buyers: 5, submitted: "Jul 21, 2026" },
  { id: 2, title: "Probate Sale — Colonial", address: "342 Maple Ave, Orlando, FL", askingPrice: "$175,000", arv: "$280,000", repair: "$35,000", status: "Under Contract", buyers: 3, submitted: "Jul 20, 2026" },
  { id: 3, title: "Tax Lien Property", address: "1208 Pine Blvd, Jacksonville, FL", askingPrice: "$95,000", arv: "$195,000", repair: "$30,000", status: "New", buyers: 8, submitted: "Jul 19, 2026" },
  { id: 4, title: "Distressed Single Family", address: "567 Cedar Lane, Miami, FL", askingPrice: "$285,000", arv: "$450,000", repair: "$60,000", status: "Assigned", buyers: 2, submitted: "Jul 16, 2026" },
  { id: 5, title: "Off-Market Condo", address: "901 Beach Drive, Clearwater, FL", askingPrice: "$140,000", arv: "$225,000", repair: "$20,000", status: "New", buyers: 6, submitted: "Jul 14, 2026" },
  { id: 6, title: "Estate Sale Ranch", address: "2210 Palm Court, St. Petersburg, FL", askingPrice: "$195,000", arv: "$310,000", repair: "$40,000", status: "Closed", buyers: 4, submitted: "Jul 10, 2026" },
  { id: 7, title: "Pre-Foreclosure Townhouse", address: "788 Bay Lane, Sarasota, FL", askingPrice: "$165,000", arv: "$270,000", repair: "$25,000", status: "Under Contract", buyers: 3, submitted: "Jul 8, 2026" },
];

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  "Under Contract": "bg-amber-100 text-amber-700",
  Assigned: "bg-purple-100 text-purple-700",
  Closed: "bg-emerald-100 text-emerald-700",
};

export default function WholesalerDealsPage() {
  return (
    <WholesalerLayout title="My Submitted Deals" subtitle="Track and manage all your submitted wholesale deals.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{DEALS.length} deals submitted</span>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white">
              <option>All Status</option>
              <option>New</option>
              <option>Under Contract</option>
              <option>Assigned</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Deal</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Asking Price</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">ARV</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Repairs</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Buyers</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Submitted</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEALS.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0A2647] text-sm">{deal.title}</p>
                      <p className="text-slate-500 text-xs">{deal.address}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#0A2647]">{deal.askingPrice}</td>
                    <td className="px-5 py-4 text-sm font-medium text-emerald-600">{deal.arv}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{deal.repair}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[deal.status]}`}>{deal.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{deal.buyers}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{deal.submitted}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WholesalerLayout>
  );
}
