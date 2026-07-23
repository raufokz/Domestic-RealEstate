"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import Link from "next/link";

const STATS = [
  { label: "Active Listings", value: "4", change: "+1 this month", color: "bg-blue-50 text-blue-600" },
  { label: "Total Views", value: "4,807", change: "+12% vs last month", color: "bg-emerald-50 text-emerald-600" },
  { label: "Valuation Requests", value: "2", change: "1 pending", color: "bg-amber-50 text-amber-600" },
  { label: "Messages", value: "8", change: "3 unread", color: "bg-purple-50 text-purple-600" },
];

const LISTINGS = [
  { id: 1, title: "Luxury Beachfront Villa", address: "890 Ocean Drive, Malibu", price: "$3,450,000", status: "Active", views: 1243, inquiries: 18, gradient: "from-cyan-400 to-cyan-600" },
  { id: 2, title: "Modern Downtown Loft", address: "321 Main St, Chicago", price: "$785,000", status: "Active", views: 892, inquiries: 12, gradient: "from-violet-400 to-violet-600" },
  { id: 3, title: "Suburban Family Estate", address: "456 Maple Lane, Dallas", price: "$1,120,000", status: "Pending", views: 567, inquiries: 8, gradient: "from-rose-400 to-rose-600" },
  { id: 4, title: "Penthouse Suite", address: "100 Skyline Blvd, NYC", price: "$5,200,000", status: "Active", views: 2105, inquiries: 31, gradient: "from-amber-400 to-amber-600" },
];

const ENQUIRIES = [
  { id: 1, name: "David Miller", property: "Luxury Beachfront Villa", message: "Is the pool heated? Can we schedule a weekend viewing?", time: "3h ago", status: "New" },
  { id: 2, name: "Emily Chen", property: "Modern Downtown Loft", message: "What are the HOA fees? Are pets allowed?", time: "6h ago", status: "Replied" },
  { id: 3, name: "Robert Kim", property: "Penthouse Suite", message: "I'd like to make an offer. What's the best price?", time: "1d ago", status: "New" },
];

export default function SellerDashboard() {
  return (
    <SellerLayout title="Dashboard" subtitle="Manage your property listings and enquiries.">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Listing", href: "/seller/dashboard/listings", icon: "M12 4v16m8-8H4", color: "bg-emerald-500" },
            { label: "My Listings", href: "/seller/dashboard/listings", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5", color: "bg-blue-500" },
            { label: "Request Valuation", href: "/seller/dashboard/valuations", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2", color: "bg-amber-500" },
            { label: "View Analytics", href: "/seller/dashboard/marketing", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "bg-purple-500" },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0A2647]">My Listings</h2>
              <Link href="/seller/dashboard/listings" className="text-sm text-[#C9A227] hover:text-[#0A2647] font-semibold">View All →</Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Views</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Inquiries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {LISTINGS.map((listing) => (
                      <tr key={listing.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${listing.gradient} flex-shrink-0`} />
                            <div>
                              <p className="font-semibold text-[#0A2647] text-sm">{listing.title}</p>
                              <p className="text-slate-500 text-xs">{listing.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{listing.price}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${listing.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{listing.views.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{listing.inquiries}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">Recent Enquiries</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              {ENQUIRIES.map((enq) => (
                <div key={enq.id} className="p-3 rounded-lg hover:bg-slate-50 transition border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[#0A2647] text-sm">{enq.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${enq.status === "New" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">Re: {enq.property}</p>
                  <p className="text-xs text-slate-600 truncate">{enq.message}</p>
                  <span className="text-xs text-slate-400 mt-1 block">{enq.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">Performance Summary</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Average days on market</span>
                  <span className="text-sm font-bold text-[#0A2647]">18 days</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "65%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Price-to-list ratio</span>
                  <span className="text-sm font-bold text-[#0A2647]">97.2%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "97%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Inquiry conversion rate</span>
                  <span className="text-sm font-bold text-[#0A2647]">24%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#C9A227] h-2 rounded-full" style={{ width: "24%" }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A2647] mb-4">Listing Tips</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-blue-800">Update your photos</p>
                <p className="text-xs text-blue-600 mt-1">Listings with 10+ photos get 2x more inquiries.</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-800">Respond quickly</p>
                <p className="text-xs text-emerald-600 mt-1">Sellers who reply within 1 hour close 40% more deals.</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm font-semibold text-amber-800">Price competitively</p>
                <p className="text-xs text-amber-600 mt-1">Properties priced within 5% of market value sell fastest.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
