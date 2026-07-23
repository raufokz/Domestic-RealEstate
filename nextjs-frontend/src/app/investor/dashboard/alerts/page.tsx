"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Alert {
  id: number;
  type: string;
  location: string;
  criteria: string;
  status: string;
  lastTriggered: string;
  matchesFound: number;
}

const FALLBACK_DATA: Alert[] = [
  { id: 1, type: "Price Drop", location: "Austin, TX", criteria: "Multi-family under $1.5M", status: "Active", lastTriggered: "2h ago", matchesFound: 3 },
  { id: 2, type: "New Listing", location: "Miami, FL", criteria: "Short-term rental with 15%+ ROI", status: "Active", lastTriggered: "1d ago", matchesFound: 5 },
  { id: 3, type: "Market Change", location: "Denver, CO", criteria: "Cap rate above 6%", status: "Triggered", lastTriggered: "3h ago", matchesFound: 2 },
  { id: 4, type: "Price Drop", location: "Chicago, IL", criteria: "Commercial under $2M", status: "Paused", lastTriggered: "5d ago", matchesFound: 0 },
  { id: 5, type: "New Listing", location: "Dallas, TX", criteria: "Single-family with 10%+ ROI", status: "Active", lastTriggered: "12h ago", matchesFound: 8 },
];

const TYPE_ICONS: Record<string, string> = {
  "Price Drop": "M19 14l-7 7m0 0l-7-7m7 7V3",
  "New Listing": "M12 4v16m8-8H4",
  "Market Change": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
};

export default function InvestorAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Alert[]>("/investor/alerts");
        setAlerts(result);
      } catch {
        setAlerts(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <InvestorLayout title="Investment Alerts" subtitle="Stay informed about market opportunities.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {["All", "Active", "Triggered", "Paused"].map((f) => (
                  <button key={f} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${f === "All" ? "bg-[#0A2647] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                + Create Alert
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Active Alerts", value: String(alerts.filter((a) => a.status === "Active").length), color: "bg-blue-50 text-blue-600" },
                { label: "Triggered Today", value: String(alerts.filter((a) => a.status === "Triggered").length), color: "bg-green-50 text-green-600" },
                { label: "Total Matches", value: String(alerts.reduce((sum, a) => sum + a.matchesFound, 0)), color: "bg-amber-50 text-amber-600" },
                { label: "Paused", value: String(alerts.filter((a) => a.status === "Paused").length), color: "bg-slate-50 text-slate-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <p className="text-2xl font-bold text-[#0A2647] mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Alert Type</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Location</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Criteria</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Matches</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Last Triggered</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#0A2647]/10 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-[#0A2647]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TYPE_ICONS[alert.type] || "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"} />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-[#0A2647]">{alert.type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{alert.location}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">{alert.criteria}</td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-bold ${alert.matchesFound > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                            {alert.matchesFound}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            alert.status === "Active" ? "bg-green-100 text-green-700" :
                            alert.status === "Triggered" ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{alert.lastTriggered}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Edit</button>
                            <button className="text-slate-400 hover:text-[#0A2647] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Pause</button>
                            <button className="text-slate-400 hover:text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </InvestorLayout>
  );
}
