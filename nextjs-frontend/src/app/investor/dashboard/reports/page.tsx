"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";

const REPORTS = [
  { id: 1, title: "Monthly Portfolio Summary", date: "Jul 1, 2026", type: "Portfolio", status: "Ready", color: "bg-blue-50 text-blue-600" },
  { id: 2, title: "Miami Market Analysis Q2", date: "Jun 30, 2026", type: "Market", status: "Ready", color: "bg-emerald-50 text-emerald-600" },
  { id: 3, title: "Cash Flow Projection — Rental Properties", date: "Jun 25, 2026", type: "Financial", status: "Ready", color: "bg-purple-50 text-purple-600" },
  { id: 4, title: "Fix & Flip Profit Report", date: "Jun 20, 2026", type: "Deal", status: "Ready", color: "bg-amber-50 text-amber-600" },
  { id: 5, title: "Tax Summary 2025", date: "Jun 15, 2026", type: "Tax", status: "Ready", color: "bg-rose-50 text-rose-600" },
  { id: 6, title: "Rental Market Trends — Tampa Bay", date: "Jun 10, 2026", type: "Market", status: "Processing", color: "bg-indigo-50 text-indigo-600" },
];

export default function InvestorReportsPage() {
  return (
    <InvestorLayout title="Investment Reports" subtitle="View and download your investment performance reports.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: "12", color: "bg-blue-50 text-blue-600" },
            { label: "This Month", value: "3", color: "bg-emerald-50 text-emerald-600" },
            { label: "Downloads", value: "28", color: "bg-purple-50 text-purple-600" },
            { label: "Pending", value: "1", color: "bg-amber-50 text-amber-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <span className="text-sm text-slate-500">{stat.label}</span>
              <p className="text-2xl font-bold text-[#0A2647] mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Report</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REPORTS.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#0A2647] text-sm">{report.title}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${report.color}`}>{report.type}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{report.date}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${report.status === "Ready" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">View</button>
                        <button className="text-slate-400 hover:text-[#0A2647] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Download</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
}
