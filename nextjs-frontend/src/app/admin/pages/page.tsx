"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const cmsPages = [
  { id: 1, title: "About Us", slug: "/about-us", status: "Published", updated: "2024-10-10" },
  { id: 2, title: "Terms of Service", slug: "/terms-of-service", status: "Published", updated: "2024-10-05" },
  { id: 3, title: "Privacy Policy", slug: "/privacy-policy", status: "Published", updated: "2024-10-05" },
  { id: 4, title: "Careers", slug: "/careers", status: "Draft", updated: "2024-10-12" },
  { id: 5, title: "Contact Us", slug: "/contact-us", status: "Published", updated: "2024-10-08" },
];

const statusColors: Record<string, string> = {
  Published: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
};

export default function CmsPagesPage() {
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = statusFilter === "All" ? cmsPages : cmsPages.filter((p) => p.status === statusFilter);

  return (
    <AdminLayout title="CMS Pages">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          {["All", "Draft", "Published"].map((status) => {
            const count = status === "All" ? cmsPages.length : cmsPages.filter((p) => p.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-[#0A2647] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
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
                <th className="px-4 py-3 text-left text-sm font-semibold">Page Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Updated</th>
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
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs rounded-full ${statusColors[page.status]}`}>{page.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{page.updated}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">Edit</button>
                      <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">Preview</button>
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
