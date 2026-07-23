"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const pages = [
  { id: 1, title: "Homes for Sale in Beverly Hills", slug: "/homes-for-sale-beverly-hills", status: "Published", city: "Beverly Hills", state: "CA", published: "2024-09-15" },
  { id: 2, title: "Luxury Real Estate in Malibu", slug: "/luxury-real-estate-malibu", status: "Published", city: "Malibu", state: "CA", published: "2024-09-20" },
  { id: 3, title: "Downtown LA Apartments", slug: "/downtown-la-apartments", status: "Draft", city: "Los Angeles", state: "CA", published: "" },
  { id: 4, title: "Pasadena Family Homes", slug: "/pasadena-family-homes", status: "Published", city: "Pasadena", state: "CA", published: "2024-10-01" },
  { id: 5, title: "Big Bear Lake Properties", slug: "/big-bear-lake-properties", status: "Scheduled", city: "Big Bear Lake", state: "CA", published: "2024-10-30" },
  { id: 6, title: "Hollywood Hills Mansions", slug: "/hollywood-hills-mansions", status: "Published", city: "Hollywood", state: "CA", published: "2024-10-05" },
  { id: 7, title: "Santa Monica Beach Houses", slug: "/santa-monica-beach-houses", status: "Draft", city: "Santa Monica", state: "CA", published: "" },
  { id: 8, title: "Woodland Hills Condos", slug: "/woodland-hills-condos", status: "Published", city: "Woodland Hills", state: "CA", published: "2024-10-08" },
];

const statusColors: Record<string, string> = {
  Published: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
  Scheduled: "bg-blue-100 text-blue-800",
};

export default function SeoPagesPage() {
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = statusFilter === "All" ? pages : pages.filter((p) => p.status === statusFilter);

  return (
    <AdminLayout title="SEO Landing Pages">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          {["All", "Draft", "Published", "Scheduled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#0A2647] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
          + Create New Page
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A2647] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">City/State</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Published</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{page.title}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{page.slug}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{page.city}, {page.state}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs rounded-full ${statusColors[page.status]}`}>{page.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{page.published || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">Edit</button>
                      <button className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                    </div>
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
