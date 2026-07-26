"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import { useState } from "react";

type StatusFilter = "All" | "Active" | "Pending" | "Sold";

interface Listing {
  id: number;
  title: string;
  address: string;
  price: string;
  status: StatusFilter;
  views: number;
  inquiries: number;
  offers: number;
  daysOnMarket: number;
  gradient: string;
}

const LISTINGS: Listing[] = [
  { id: 1, title: "Luxury Beachfront Villa", address: "890 Ocean Drive, Malibu", price: "$3,450,000", status: "Active", views: 1243, inquiries: 18, offers: 3, daysOnMarket: 22, gradient: "from-cyan-400 to-cyan-600" },
  { id: 2, title: "Modern Downtown Loft", address: "321 Main St, Chicago", price: "$785,000", status: "Active", views: 892, inquiries: 12, offers: 1, daysOnMarket: 14, gradient: "from-violet-400 to-violet-600" },
  { id: 3, title: "Suburban Family Estate", address: "456 Maple Lane, Dallas", price: "$1,120,000", status: "Pending", views: 567, inquiries: 8, offers: 2, daysOnMarket: 31, gradient: "from-rose-400 to-rose-600" },
  { id: 4, title: "Penthouse Suite", address: "100 Skyline Blvd, NYC", price: "$5,200,000", status: "Active", views: 2105, inquiries: 31, offers: 5, daysOnMarket: 8, gradient: "from-amber-400 to-amber-600" },
  { id: 5, title: "Historic Brownstone", address: "78 Beacon Hill, Boston", price: "$2,100,000", status: "Sold", views: 3201, inquiries: 42, offers: 7, daysOnMarket: 12, gradient: "from-emerald-400 to-emerald-600" },
  { id: 6, title: "Lakefront Cottage", address: "321 Lakeshore Dr, Milwaukee", price: "$445,000", status: "Active", views: 312, inquiries: 5, offers: 0, daysOnMarket: 45, gradient: "from-blue-400 to-blue-600" },
];

export default function ListingsPage() {
  const [filter, setFilter] = useState<StatusFilter>("All");
  const filters: StatusFilter[] = ["All", "Active", "Pending", "Sold"];

  const filtered = filter === "All" ? LISTINGS : LISTINGS.filter((l) => l.status === filter);

  return (
    <SellerLayout title="My Listings" subtitle="Manage all your property listings in one place.">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? "bg-[#0A2647] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {f}
                <span className={`ml-1.5 text-xs ${filter === f ? "text-white/70" : "text-slate-400"}`}>
                  {f === "All" ? LISTINGS.length : LISTINGS.filter((l) => l.status === f).length}
                </span>
              </button>
            ))}
          </div>
          <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + Add New Listing
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Views", value: "8,320", change: "+15% this month", color: "bg-blue-50 text-blue-600" },
            { label: "Total Inquiries", value: "116", change: "+22 this week", color: "bg-emerald-50 text-emerald-600" },
            { label: "Active Offers", value: "11", change: "3 new today", color: "bg-amber-50 text-amber-600" },
            { label: "Avg Days on Market", value: "22", change: "Below average", color: "bg-purple-50 text-purple-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs text-slate-500">{stat.label}</span>
              <p className="text-2xl font-bold text-[#0A2647] mt-1">{stat.value}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${stat.color}`}>{stat.change}</span>
            </div>
          ))}
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
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Offers</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Days Listed</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((listing) => (
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
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        listing.status === "Active" ? "bg-green-100 text-green-700" :
                        listing.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{listing.views.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{listing.inquiries}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{listing.offers}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{listing.daysOnMarket}d</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-slate-400 hover:text-[#0A2647] p-1.5 rounded-lg hover:bg-slate-100 transition" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="text-slate-400 hover:text-[#0A2647] p-1.5 rounded-lg hover:bg-slate-100 transition" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400">No listings found for this filter.</div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
