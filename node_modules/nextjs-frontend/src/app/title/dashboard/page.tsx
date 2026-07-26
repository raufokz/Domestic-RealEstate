"use client";

import TitleLayout from "@/components/title/TitleLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface DashboardData {
  activeOrders: number;
  completedThisMonth: number;
  pendingDocuments: number;
  revenue: string;
  recentOrders: Array<{
    id: number;
    property: string;
    buyer: string;
    seller: string;
    status: string;
    date: string;
    type: string;
  }>;
}

const FALLBACK_DATA: DashboardData = {
  activeOrders: 18,
  completedThisMonth: 7,
  pendingDocuments: 12,
  revenue: "$68,400",
  recentOrders: [
    { id: 1, property: "123 Oak Lane, Austin", buyer: "James Wilson", seller: "Emily Davis", status: "In Progress", date: "Jul 12, 2026", type: "Purchase" },
    { id: 2, property: "456 Pine St, Miami", buyer: "Maria Garcia", seller: "Robert Kim", status: "Completed", date: "Jul 11, 2026", type: "Purchase" },
    { id: 3, property: "789 Elm Dr, Denver", buyer: "David Kim", seller: "Sarah Chen", status: "Pending Documents", date: "Jul 10, 2026", type: "Refinance" },
    { id: 4, property: "321 Maple Ave, Dallas", buyer: "Sarah Chen", seller: "Michael Brown", status: "Under Review", date: "Jul 9, 2026", type: "Purchase" },
    { id: 5, property: "555 Cedar Blvd, Chicago", buyer: "Robert Taylor", seller: "Lisa Anderson", status: "In Progress", date: "Jul 8, 2026", type: "Purchase" },
  ],
};

export default function TitleDashboard() {
  const [data, setData] = useState<DashboardData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<DashboardData>("/title/dashboard");
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
    { label: "Active Orders", value: String(data.activeOrders), change: "+4 this week", color: "bg-blue-50 text-blue-600" },
    { label: "Completed This Month", value: String(data.completedThisMonth), change: "+2 vs last month", color: "bg-emerald-50 text-emerald-600" },
    { label: "Pending Documents", value: String(data.pendingDocuments), change: "3 urgent", color: "bg-amber-50 text-amber-600" },
    { label: "Revenue", value: data.revenue, change: "+12% vs last month", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <TitleLayout title="Dashboard" subtitle="Welcome back! Here's your title company overview.">
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{stat.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>{stat.change}</span>
                  </div>
                  <p className="text-3xl font-bold text-[#0A2647] mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "New Order", href: "/title/dashboard/orders/new", icon: "M12 4v16m8-8H4", color: "bg-emerald-500" },
                { label: "Track Orders", href: "/title/dashboard/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "bg-blue-500" },
                { label: "Documents", href: "/title/dashboard/documents", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-amber-500" },
                { label: "Settings", href: "/title/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "bg-purple-500" },
              ].map((action) => (
                <div

                  key={action.label}

                  aria-disabled="true"

                  title={`${action.label} is not available yet`}

                  className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 opacity-50 cursor-not-allowed select-none"

                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#0A2647]">{action.label}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0A2647]">Recent Title Orders</h2>
                <span className="text-sm text-slate-400 cursor-not-allowed" title="Not available yet">View All →</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Buyer</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Seller</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{order.property}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{order.buyer}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{order.seller}</td>
                          <td className="px-5 py-4">
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#0A2647]/10 text-[#0A2647]">{order.type}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              order.status === "Completed" ? "bg-green-100 text-green-700" :
                              order.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                              order.status === "Pending Documents" ? "bg-orange-100 text-orange-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </TitleLayout>
  );
}
