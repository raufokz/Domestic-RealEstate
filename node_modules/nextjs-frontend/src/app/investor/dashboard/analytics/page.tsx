"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface AnalyticsData {
  totalValue: string;
  monthlyCashFlow: string;
  averageROI: string;
  occupancyRate: string;
  properties: Array<{
    id: number;
    name: string;
    value: string;
    cashFlow: string;
    roi: string;
    occupancy: string;
    status: string;
  }>;
}

const FALLBACK_DATA: AnalyticsData = {
  totalValue: "$3.28M",
  monthlyCashFlow: "$18,500",
  averageROI: "13.2%",
  occupancyRate: "92%",
  properties: [
    { id: 1, name: "Riverside Apartment Complex", value: "$1.2M", cashFlow: "$5,600/mo", roi: "14.2%", occupancy: "95%", status: "Performing" },
    { id: 2, name: "Downtown Office Space", value: "$890K", cashFlow: "$4,200/mo", roi: "11.5%", occupancy: "88%", status: "Performing" },
    { id: 3, name: "Beach Vacation Rental", value: "$680K", cashFlow: "$4,800/mo", roi: "18.7%", occupancy: "78%", status: "Seasonal" },
    { id: 4, name: "Suburban Family Home", value: "$320K", cashFlow: "$1,200/mo", roi: "9.8%", occupancy: "100%", status: "Performing" },
    { id: 5, name: "Lakeview Townhome", value: "$190K", cashFlow: "$2,700/mo", roi: "13.1%", occupancy: "90%", status: "Performing" },
  ],
};

export default function InvestorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<AnalyticsData>("/investor/analytics");
        setData(result);
      } catch {
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const STATS = [
    { label: "Total Portfolio Value", value: data.totalValue, change: "+$180K this quarter", color: "bg-blue-50 text-blue-600" },
    { label: "Monthly Cash Flow", value: data.monthlyCashFlow, change: "+8% vs last month", color: "bg-emerald-50 text-emerald-600" },
    { label: "Average ROI", value: data.averageROI, change: "+2.1% this year", color: "bg-amber-50 text-amber-600" },
    { label: "Occupancy Rate", value: data.occupancyRate, change: "Above market avg", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <InvestorLayout title="Portfolio Analytics" subtitle="Track your investment performance.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">{stat.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0A2647]">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Performance by Property</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Value</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Cash Flow</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">ROI</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Occupancy</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{prop.name}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{prop.value}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{prop.cashFlow}</td>
                        <td className="px-5 py-4 text-sm font-bold text-emerald-600">{prop.roi}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-[#C9A227] h-1.5 rounded-full" style={{ width: prop.occupancy }} />
                            </div>
                            <span className="text-xs text-slate-500">{prop.occupancy}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prop.status === "Performing" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {prop.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Monthly Cash Flow</h2>
              <div className="flex items-end gap-3 h-48">
                {[
                  { month: "Jan", value: 15200 },
                  { month: "Feb", value: 15800 },
                  { month: "Mar", value: 16100 },
                  { month: "Apr", value: 16900 },
                  { month: "May", value: 17400 },
                  { month: "Jun", value: 18000 },
                  { month: "Jul", value: 18500 },
                ].map((d) => {
                  const maxVal = 18500;
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-[#0A2647]">${(d.value / 1000).toFixed(1)}K</span>
                      <div className="w-full bg-[#0A2647]/5 rounded-t-lg relative overflow-hidden" style={{ height: `${(d.value / maxVal) * 100}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </InvestorLayout>
  );
}
