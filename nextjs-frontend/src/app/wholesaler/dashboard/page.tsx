"use client";

import WholesalerLayout from "@/components/wholesaler/WholesalerLayout";
import Link from "next/link";

const STATS = [
  { label: "Active Deals", value: "8", change: "3 new this week", color: "bg-blue-50 text-blue-600" },
  { label: "Total Buyers", value: "42", change: "+5 this month", color: "bg-emerald-50 text-emerald-600" },
  { label: "Deals Closed", value: "15", change: "$1.2M total volume", color: "bg-purple-50 text-purple-600" },
  { label: "Avg. Assignment Fee", value: "$18.5K", change: "Last 90 days", color: "bg-amber-50 text-amber-600" },
];

const RECENT_DEALS = [
  { id: 1, title: "Bank-Owned Duplex", address: "890 Oak Street, Tampa, FL", askingPrice: "$210,000", arv: "$340,000", status: "New", buyers: 5, submitted: "2h ago" },
  { id: 2, title: "Probate Sale — Colonial", address: "342 Maple Ave, Orlando, FL", askingPrice: "$175,000", arv: "$280,000", status: "Under Contract", buyers: 3, submitted: "1d ago" },
  { id: 3, title: "Tax Lien Property", address: "1208 Pine Blvd, Jacksonville, FL", askingPrice: "$95,000", arv: "$195,000", status: "New", buyers: 8, submitted: "2d ago" },
  { id: 4, title: "Distressed Single Family", address: "567 Cedar Lane, Miami, FL", askingPrice: "$285,000", arv: "$450,000", status: "Assigned", buyers: 2, submitted: "5d ago" },
  { id: 5, title: "Off-Market Condo", address: "901 Beach Drive, Clearwater, FL", askingPrice: "$140,000", arv: "$225,000", status: "New", buyers: 6, submitted: "1w ago" },
];

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  "Under Contract": "bg-amber-100 text-amber-700",
  Assigned: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-500",
};

export default function WholesalerDashboardPage() {
  return (
    <WholesalerLayout title="Wholesaler Dashboard" subtitle="Manage your deals and buyer network.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>{stat.change}</span>
              </div>
              <p className="text-3xl font-bold text-[#0A2647] mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Submit Deal", href: "/wholesaler/dashboard/submit-deal", icon: "M12 4v16m8-8H4", color: "bg-[#C9A227]" },
            { label: "View Deals", href: "/wholesaler/dashboard/deals", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-blue-500" },
            { label: "Manage Buyers", href: "/wholesaler/dashboard/buyers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "bg-emerald-500" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#0A2647]">{action.label}</span>
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0A2647]">Recent Deals</h2>
            <Link href="/wholesaler/dashboard/deals" className="text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold">View All →</Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Deal</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Asking Price</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">ARV</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Buyers</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_DEALS.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#0A2647] text-sm">{deal.title}</p>
                        <p className="text-slate-500 text-xs">{deal.address}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[#0A2647]">{deal.askingPrice}</td>
                      <td className="px-5 py-4 text-sm font-medium text-emerald-600">{deal.arv}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[deal.status]}`}>{deal.status}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{deal.buyers} interested</td>
                      <td className="px-5 py-4 text-sm text-slate-400 text-right">{deal.submitted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </WholesalerLayout>
  );
}
