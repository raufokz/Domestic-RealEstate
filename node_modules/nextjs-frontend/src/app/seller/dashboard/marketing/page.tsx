"use client";

import SellerLayout from "@/components/seller/SellerLayout";

const TOOLS = [
  { id: 1, title: "Social Media Share", description: "Share your listings across Facebook, Instagram, and Twitter with one click.", icon: "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2", color: "bg-blue-500", stats: "12 posts scheduled" },
  { id: 2, title: "Property Flyer Generator", description: "Create professional property flyers with photos and details automatically.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-emerald-500", stats: "8 flyers generated" },
  { id: 3, title: "Virtual Tour", description: "Create immersive 360° virtual tours for your listings.", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", color: "bg-purple-500", stats: "3 tours active" },
  { id: 4, title: "Email Campaign", description: "Send targeted email campaigns to potential buyers.", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "bg-amber-500", stats: "245 recipients" },
];

const CAMPAIGNS = [
  { id: 1, name: "Summer Open House", sent: 156, opened: 89, clicks: 34, status: "Sent", date: "Jul 10, 2026" },
  { id: 2, name: "New Listing Alert — Beachfront Villa", sent: 245, opened: 142, clicks: 67, status: "Sent", date: "Jul 8, 2026" },
  { id: 3, name: "Price Reduction Notice", sent: 0, opened: 0, clicks: 0, status: "Draft", date: "Jul 12, 2026" },
];

export default function SellerMarketingPage() {
  return (
    <SellerLayout title="Marketing Tools" subtitle="Promote your listings effectively.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <div key={tool.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition group">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0A2647] text-base group-hover:text-[#C9A227] transition">{tool.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
                  <p className="text-xs text-slate-400 mt-2">{tool.stats}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="text-sm font-semibold text-[#C9A227] hover:text-[#0A2647] transition">Open →</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0A2647]">Recent Campaigns</h2>
            <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
              + New Campaign
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Campaign</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Sent</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Opened</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Clicks</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CAMPAIGNS.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{c.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{c.sent}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{c.opened}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{c.clicks}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === "Sent" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
