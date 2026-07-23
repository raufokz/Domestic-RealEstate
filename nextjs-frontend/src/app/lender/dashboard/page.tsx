"use client";

import LenderLayout from "@/components/lender/LenderLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface DashboardData {
  activeLoans: number;
  pendingApplications: number;
  totalFunded: string;
  applicationsThisMonth: number;
  recentApplications: Array<{
    id: number;
    borrower: string;
    property: string;
    amount: string;
    status: string;
    date: string;
    type: string;
  }>;
}

const FALLBACK_DATA: DashboardData = {
  activeLoans: 34,
  pendingApplications: 12,
  totalFunded: "$42.8M",
  applicationsThisMonth: 28,
  recentApplications: [
    { id: 1, borrower: "James Wilson", property: "123 Oak Lane, Austin", amount: "$485,000", status: "Under Review", date: "Jul 12, 2026", type: "Conventional" },
    { id: 2, borrower: "Maria Garcia", property: "456 Pine St, Miami", amount: "$320,000", status: "Approved", date: "Jul 11, 2026", type: "FHA" },
    { id: 3, borrower: "David Kim", property: "789 Elm Dr, Denver", amount: "$675,000", status: "Pending Docs", date: "Jul 10, 2026", type: "Jumbo" },
    { id: 4, borrower: "Sarah Chen", property: "321 Maple Ave, Dallas", amount: "$290,000", status: "Processing", date: "Jul 9, 2026", type: "VA" },
    { id: 5, borrower: "Robert Taylor", property: "555 Cedar Blvd, Chicago", amount: "$520,000", status: "Submitted", date: "Jul 8, 2026", type: "Conventional" },
  ],
};

export default function LenderDashboard() {
  const [data, setData] = useState<DashboardData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<DashboardData>("/lender/dashboard");
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
    { label: "Active Loans", value: String(data.activeLoans), change: "+3 this month", color: "bg-blue-50 text-blue-600" },
    { label: "Pending Applications", value: String(data.pendingApplications), change: "5 new today", color: "bg-amber-50 text-amber-600" },
    { label: "Total Funded", value: data.totalFunded, change: "+$4.2M this quarter", color: "bg-emerald-50 text-emerald-600" },
    { label: "Applications This Month", value: String(data.applicationsThisMonth), change: "+18% vs last month", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <LenderLayout title="Dashboard" subtitle="Welcome back! Here's your lending overview.">
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
                { label: "New Application", href: "/lender/dashboard/applications/new", icon: "M12 4v16m8-8H4", color: "bg-emerald-500" },
                { label: "View Pipeline", href: "/lender/dashboard/pipeline", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "bg-blue-500" },
                { label: "Documents", href: "/lender/dashboard/documents", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-amber-500" },
                { label: "Settings", href: "/lender/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "bg-purple-500" },
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
                <h2 className="text-lg font-bold text-[#0A2647]">Recent Applications</h2>
                <span className="text-sm text-slate-400 cursor-not-allowed" title="Not available yet">View All →</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Borrower</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.recentApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4">
                            <span className="font-semibold text-[#0A2647] text-sm">{app.borrower}</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">{app.property}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{app.amount}</td>
                          <td className="px-5 py-4">
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#0A2647]/10 text-[#0A2647]">{app.type}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              app.status === "Approved" ? "bg-green-100 text-green-700" :
                              app.status === "Under Review" ? "bg-yellow-100 text-yellow-700" :
                              app.status === "Pending Docs" ? "bg-orange-100 text-orange-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">{app.date}</td>
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
    </LenderLayout>
  );
}
