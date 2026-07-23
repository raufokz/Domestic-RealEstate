"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/realtor/dashboard", active: false, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Leads", href: "/realtor/dashboard/leads", active: false, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Properties", href: "/realtor/dashboard/properties", active: true, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
  { label: "Profile", href: "/realtor/dashboard/profile", active: false, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const PROPERTIES = [
  { id: 1, title: "Luxury Beachfront Villa", address: "890 Ocean Drive, Malibu, CA", price: "$3,450,000", status: "Active", views: 1243, image: "bg-gradient-to-br from-cyan-400 to-cyan-600", beds: 5, baths: 4, sqft: "4,800" },
  { id: 2, title: "Modern Downtown Loft", address: "321 Main St, Chicago, IL", price: "$785,000", status: "Active", views: 892, image: "bg-gradient-to-br from-violet-400 to-violet-600", beds: 2, baths: 2, sqft: "1,600" },
  { id: 3, title: "Suburban Family Estate", address: "456 Maple Lane, Dallas, TX", price: "$1,120,000", status: "Pending", views: 567, image: "bg-gradient-to-br from-rose-400 to-rose-600", beds: 4, baths: 3, sqft: "3,200" },
  { id: 4, title: "Penthouse Suite", address: "100 Skyline Blvd, New York, NY", price: "$5,200,000", status: "Active", views: 2105, image: "bg-gradient-to-br from-amber-400 to-amber-600", beds: 3, baths: 3, sqft: "2,800" },
  { id: 5, title: "Mountain Retreat", address: "789 Pine Summit, Aspen, CO", price: "$2,800,000", status: "Sold", views: 3210, image: "bg-gradient-to-br from-emerald-400 to-emerald-600", beds: 4, baths: 4, sqft: "5,100" },
  { id: 6, title: "Urban Studio Apartment", address: "55 Fifth Ave, Miami, FL", price: "$425,000", status: "Draft", views: 0, image: "bg-gradient-to-br from-pink-400 to-pink-600", beds: 1, baths: 1, sqft: "650" },
];

const STATUS_TABS = ["All", "Active", "Pending", "Sold", "Draft"];

export default function PropertiesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All" ? PROPERTIES : PROPERTIES.filter((p) => p.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2647] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Logo size="md" />
          <span className="text-white font-bold">Domestic RE</span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${item.active ? "bg-[#C9A227]/10 text-[#C9A227]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0A2647]">Properties</h1>
              <p className="text-slate-500 text-sm">Manage your property listings</p>
            </div>
          </div>
          <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </button>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-[#C9A227] text-[#0A2647]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-[#0A2647] text-white" : "bg-slate-100 text-slate-500"}`}>
                  {tab === "All" ? PROPERTIES.length : PROPERTIES.filter((p) => p.status === tab).length}
                </span>
              </button>
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
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Details</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Views</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-lg ${prop.image} flex-shrink-0`} />
                          <div>
                            <p className="font-semibold text-[#0A2647] text-sm">{prop.title}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{prop.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{prop.price}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          prop.status === "Active" ? "bg-green-100 text-green-700" :
                          prop.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                          prop.status === "Sold" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{prop.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{prop.beds} bd</span>
                          <span>{prop.baths} ba</span>
                          <span>{prop.sqft} sqft</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{prop.views.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition" title="View">
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
          </div>
        </div>
      </main>
    </div>
  );
}
