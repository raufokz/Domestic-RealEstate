"use client";

import WholesalerLayout from "@/components/wholesaler/WholesalerLayout";

const BUYERS = [
  { id: 1, name: "Michael Chen", email: "m.chen@email.com", phone: "(555) 234-5678", budget: "$200K - $400K", criteria: "Single Family, Fix & Flip", deals: 3, lastActive: "2h ago" },
  { id: 2, name: "Lisa Rodriguez", email: "lisa.r@email.com", phone: "(555) 345-6789", budget: "$150K - $300K", criteria: "Multi-Family, Buy & Hold", deals: 5, lastActive: "5h ago" },
  { id: 3, name: "David Park", email: "d.park@email.com", phone: "(555) 456-7890", budget: "$300K - $600K", criteria: "Single Family, BRRRR", deals: 2, lastActive: "1d ago" },
  { id: 4, name: "Emma Wilson", email: "emma.w@email.com", phone: "(555) 567-8901", budget: "$100K - $250K", criteria: "Condo, Buy & Hold", deals: 8, lastActive: "2d ago" },
  { id: 5, name: "James Thompson", email: "j.thompson@email.com", phone: "(555) 678-9012", budget: "$250K - $500K", criteria: "Townhouse, Fix & Flip", deals: 1, lastActive: "3d ago" },
  { id: 6, name: "Angela Foster", email: "a.foster@email.com", phone: "(555) 789-0123", budget: "$400K - $800K", criteria: "Multi-Family, Commercial", deals: 12, lastActive: "1w ago" },
];

export default function WholesalerBuyersPage() {
  return (
    <WholesalerLayout title="Buyer List" subtitle="Your network of active real estate investors.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{BUYERS.length} buyers in your network</span>
          <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + Add Buyer
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Buyer</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Budget</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Criteria</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Deals Closed</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Last Active</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BUYERS.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0A2647] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {buyer.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0A2647] text-sm">{buyer.name}</p>
                          <p className="text-slate-500 text-xs">{buyer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#0A2647]">{buyer.budget}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{buyer.criteria}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{buyer.deals}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{buyer.lastActive}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Email</button>
                        <button className="text-slate-400 hover:text-[#0A2647] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Edit</button>
                      </div>
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
