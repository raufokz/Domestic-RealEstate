"use client";

import BrokerLayout from "@/components/broker/BrokerLayout";
import { useState } from "react";

type StatusFilter = "All" | "Active" | "On Leave" | "Inactive";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  listings: number;
  sold: number;
  revenue: string;
  rating: number;
  leads: number;
  status: "Active" | "On Leave" | "Inactive";
  joinedDate: string;
  specialization: string;
}

const TEAM: TeamMember[] = [
  { id: 1, name: "Sarah Johnson", email: "sarah@domesticre.com", role: "Senior Agent", avatar: "SJ", listings: 24, sold: 18, revenue: "$142K", rating: 4.9, leads: 32, status: "Active", joinedDate: "Jan 2024", specialization: "Luxury Residential" },
  { id: 2, name: "Lisa Anderson", email: "lisa@domesticre.com", role: "Senior Agent", avatar: "LA", listings: 21, sold: 16, revenue: "$124K", rating: 4.9, leads: 28, status: "Active", joinedDate: "Mar 2024", specialization: "Commercial" },
  { id: 3, name: "Michael Chen", email: "michael@domesticre.com", role: "Agent", avatar: "MC", listings: 19, sold: 14, revenue: "$108K", rating: 4.7, leads: 25, status: "Active", joinedDate: "Jun 2024", specialization: "Condos & Lofts" },
  { id: 4, name: "Emily Davis", email: "emily@domesticre.com", role: "Agent", avatar: "ED", listings: 15, sold: 11, revenue: "$86K", rating: 4.8, leads: 19, status: "Active", joinedDate: "Aug 2024", specialization: "Family Homes" },
  { id: 5, name: "Robert Wilson", email: "robert@domesticre.com", role: "Junior Agent", avatar: "RW", listings: 12, sold: 9, revenue: "$72K", rating: 4.6, leads: 15, status: "Active", joinedDate: "Oct 2024", specialization: "First-Time Buyers" },
  { id: 6, name: "Anna Martinez", email: "anna@domesticre.com", role: "Agent", avatar: "AM", listings: 8, sold: 5, revenue: "$42K", rating: 4.5, leads: 11, status: "On Leave", joinedDate: "Feb 2025", specialization: "Waterfront Properties" },
  { id: 7, name: "James Taylor", email: "james@domesticre.com", role: "Junior Agent", avatar: "JT", listings: 6, sold: 3, revenue: "$28K", rating: 4.3, leads: 8, status: "Active", joinedDate: "Apr 2025", specialization: "Investment Properties" },
  { id: 8, name: "Rachel Kim", email: "rachel@domesticre.com", role: "Agent", avatar: "RK", listings: 0, sold: 0, revenue: "$0", rating: 0, leads: 0, status: "Inactive", joinedDate: "Jan 2026", specialization: "Residential" },
];

export default function TeamPage() {
  const [filter, setFilter] = useState<StatusFilter>("All");
  const filters: StatusFilter[] = ["All", "Active", "On Leave", "Inactive"];

  const filtered = filter === "All" ? TEAM : TEAM.filter((m) => m.status === filter);

  const totalRevenue = TEAM.reduce((sum, m) => sum + parseInt(m.revenue.replace(/[$K,]/g, "")), 0);
  const activeCount = TEAM.filter((m) => m.status === "Active").length;

  return (
    <BrokerLayout title="Team Management" subtitle="Manage your brokerage team members and their performance.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Agents", value: TEAM.length.toString(), change: "+2 this quarter", color: "bg-blue-50 text-blue-600" },
            { label: "Active Agents", value: activeCount.toString(), change: `${activeCount} currently active`, color: "bg-emerald-50 text-emerald-600" },
            { label: "Combined Revenue", value: `$${totalRevenue}K`, change: "+22% vs last quarter", color: "bg-amber-50 text-amber-600" },
            { label: "Avg Performance", value: `${(TEAM.filter((m) => m.rating > 0).reduce((sum, m) => sum + m.rating, 0) / TEAM.filter((m) => m.rating > 0).length).toFixed(1)}`, change: "Team rating", color: "bg-purple-50 text-purple-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>{stat.change}</span>
              </div>
              <p className="text-3xl font-bold text-[#0A2647] mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

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
                  {f === "All" ? TEAM.length : TEAM.filter((m) => m.status === f).length}
                </span>
              </button>
            ))}
          </div>
          <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + Add Team Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <div key={member.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.status === "Active" ? "bg-[#0A2647]" : member.status === "On Leave" ? "bg-amber-500" : "bg-slate-300"}`}>
                    <span className="text-white text-sm font-bold">{member.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A2647] text-sm">{member.name}</h3>
                    <p className="text-slate-500 text-xs">{member.role}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  member.status === "Active" ? "bg-green-100 text-green-700" :
                  member.status === "On Leave" ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {member.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#0A2647]">{member.listings}</p>
                  <p className="text-xs text-slate-500">Listings</p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="text-lg font-bold text-[#0A2647]">{member.sold}</p>
                  <p className="text-xs text-slate-500">Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#0A2647]">{member.revenue}</p>
                  <p className="text-xs text-slate-500">Revenue</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Leads</span>
                  <span className="font-medium text-[#0A2647]">{member.leads}</span>
                </div>
                {member.rating > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Rating</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-medium text-[#0A2647]">{member.rating}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Specialization</span>
                  <span className="text-xs text-slate-600">{member.specialization}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button className="flex-1 bg-slate-100 text-[#0A2647] py-2 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">
                  View Profile
                </button>
                <button className="flex-1 bg-[#0A2647] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#0d3360] transition">
                  Assign Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrokerLayout>
  );
}
