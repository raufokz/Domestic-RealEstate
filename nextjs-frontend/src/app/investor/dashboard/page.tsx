"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import Link from "next/link";

const STATS = [
  { label: "Portfolio Value", value: "$3.28M", change: "+$180K this quarter", color: "bg-blue-50 text-blue-600", icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" },
  { label: "Active Investments", value: "5", change: "1 pending review", color: "bg-amber-50 text-amber-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "ROI", value: "13.2%", change: "+2.1% this year", color: "bg-emerald-50 text-emerald-600", icon: "M2 11l1.5 1.5L7 7m4 4l-1.5 1.5L7 15m5-10l5 5m-5-5v10m0-10l5 5" },
  { label: "Total Returns", value: "$487,200", change: "+$52K this month", color: "bg-purple-50 text-purple-600", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" },
];

const OPPORTUNITIES = [
  { id: 1, name: "Riverside Commercial Complex", type: "Commercial", roi: "16.5%", location: "Austin, TX", price: "$2.1M", minInvestment: "$50K" },
  { id: 2, name: "Highland Park Townhomes", type: "Multi-Family", roi: "12.8%", location: "Denver, CO", price: "$1.8M", minInvestment: "$25K" },
  { id: 3, name: "Coastal Vacation Villas", type: "Short-Term Rental", roi: "19.2%", location: "Miami, FL", price: "$3.4M", minInvestment: "$100K" },
];

const PERFORMANCE_DATA = [
  { month: "Jan", value: 10.1 },
  { month: "Feb", value: 10.8 },
  { month: "Mar", value: 11.2 },
  { month: "Apr", value: 11.9 },
  { month: "May", value: 12.4 },
  { month: "Jun", value: 13.2 },
];

export default function InvestorDashboardPage() {
  const maxVal = Math.max(...PERFORMANCE_DATA.map((d) => d.value));

  return (
    <InvestorLayout title="Dashboard" subtitle="Portfolio performance and investment insights">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#0A2647]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">Portfolio Performance</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-end gap-3 h-48">
                {PERFORMANCE_DATA.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-[#0A2647]">{d.value}%</span>
                    <div className="w-full bg-[#0A2647]/5 rounded-t-lg relative overflow-hidden" style={{ height: `${(d.value / maxVal) * 100}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#C9A227] to-[#C9A227]/60 rounded-t-lg" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">ROI Summary</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">YTD Return</span>
                <span className="text-sm font-bold text-emerald-600">+13.2%</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">12-Month Return</span>
                <span className="text-sm font-bold text-emerald-600">+18.7%</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Monthly Cash Flow</span>
                <span className="text-sm font-bold text-[#0A2647]">$18,500</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Occupancy Rate</span>
                <span className="text-sm font-bold text-[#0A2647]">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Avg. Hold Period</span>
                <span className="text-sm font-bold text-[#0A2647]">4.2 yrs</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0A2647]">Recent Opportunities</h2>
            <Link href="/investor/dashboard/opportunities" className="text-sm font-medium text-[#C9A227] hover:text-[#b8911f] transition">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OPPORTUNITIES.map((opp) => (
              <div key={opp.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0A2647]/10 text-[#0A2647]">
                    {opp.type}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    {opp.roi} ROI
                  </span>
                </div>
                <h3 className="font-bold text-[#0A2647] text-base mb-1 group-hover:text-[#C9A227] transition">{opp.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{opp.location}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400">Asking Price</p>
                    <p className="text-sm font-bold text-[#0A2647]">{opp.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Min. Investment</p>
                    <p className="text-sm font-bold text-[#C9A227]">{opp.minInvestment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
}
