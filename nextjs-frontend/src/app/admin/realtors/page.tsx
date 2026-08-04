"use client";

import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

interface RealtorItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  headline: string;
  brokerage_name: string;
  license_number: string;
  license_state: string;
  license_status: string;
  status: "pending" | "verified" | "suspended" | "rejected";
  rating: number;
  listings_count: number;
  created_at: string;
  avatar?: string;
}

const MOCK_REALTORS: RealtorItem[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@domesticrealestate.us",
    phone: "(555) 987-6543",
    headline: "Luxury Real Estate Specialist | Top 1% Producer",
    brokerage_name: "Domestic Real Estate Group",
    license_number: "RE-2847561",
    license_state: "FL",
    license_status: "active",
    status: "verified",
    rating: 4.9,
    listings_count: 14,
    created_at: "2026-01-10",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@example.com",
    phone: "(555) 345-6789",
    headline: "Commercial & Multifamily Investment Consultant",
    brokerage_name: "Apex Commercial Realty",
    license_number: "RE-994821",
    license_state: "NY",
    license_status: "pending",
    status: "pending",
    rating: 4.7,
    listings_count: 5,
    created_at: "2026-02-14",
  },
  {
    id: 3,
    name: "David Miller",
    email: "david.miller@example.com",
    phone: "(555) 888-1122",
    headline: "Residential & First-Time Homebuyer Agent",
    brokerage_name: "Sunbelt Realty Solutions",
    license_number: "RE-100293",
    license_state: "TX",
    license_status: "suspended",
    status: "suspended",
    rating: 4.1,
    listings_count: 0,
    created_at: "2025-11-20",
  },
];

export default function AdminRealtorsPage() {
  const [realtors, setRealtors] = useState<RealtorItem[]>(MOCK_REALTORS);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredRealtors = realtors.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.brokerage_name.toLowerCase().includes(search.toLowerCase()) ||
      r.license_number.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (id: number, newStatus: "verified" | "suspended" | "rejected") => {
    setRealtors((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <AdminLayout title="Realtors & Verification Portal">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A2647]">Realtor & Agent Management</h1>
            <p className="text-slate-500 text-xs mt-1">
              Verify credentials, review license documentation, manage access, and audit profile histories
            </p>
          </div>
          <div className="flex gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
              Verified: {realtors.filter((r) => r.status === "verified").length}
            </span>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
              Pending: {realtors.filter((r) => r.status === "pending").length}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {["all", "pending", "verified", "suspended", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  filterStatus === st
                    ? "bg-[#0A2647] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search agent name, email, license #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none"
            />
          </div>
        </div>

        {/* Realtors Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Realtor</th>
                <th className="py-3.5 px-4">Brokerage / License</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Rating / Listings</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRealtors.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0A2647] text-white flex items-center justify-center font-bold text-xs">
                        {r.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-[#0A2647]">{r.name}</p>
                        <p className="text-[11px] text-slate-500">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{r.brokerage_name}</p>
                    <p className="text-[11px] text-slate-500">License: {r.license_number} ({r.license_state})</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        r.status === "verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "suspended"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">⭐ {r.rating} / 5.0</p>
                    <p className="text-[11px] text-slate-500">{r.listings_count} Active Listings</p>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      href={`/admin/realtors/${r.id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-[#0A2647] px-3 py-1.5 rounded-lg text-xs font-bold transition"
                    >
                      View & Manage
                    </Link>
                    {r.status === "pending" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "verified")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        Verify
                      </button>
                    )}
                    {r.status === "verified" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "suspended")}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
