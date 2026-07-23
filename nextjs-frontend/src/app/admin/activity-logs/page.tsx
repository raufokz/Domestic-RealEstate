"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const logs = [
  { id: 1, time: "2024-10-15 14:32:15", user: "Admin User", action: "User Login", type: "Auth", details: "Successful login from Chrome on Windows", ip: "192.168.1.100" },
  { id: 2, time: "2024-10-15 14:28:45", user: "John Smith", action: "Property Created", type: "Property", details: "Added new listing: Luxury Villa in Beverly Hills", ip: "192.168.1.101" },
  { id: 3, time: "2024-10-15 14:15:22", user: "Sarah Johnson", action: "Lead Updated", type: "Lead", details: "Changed lead L003 status from New to Qualified", ip: "192.168.1.102" },
  { id: 4, time: "2024-10-15 13:55:10", user: "Admin User", action: "Settings Updated", type: "System", details: "Updated site meta description", ip: "192.168.1.100" },
  { id: 5, time: "2024-10-15 13:42:33", user: "Emily Brown", action: "Blog Published", type: "Content", details: "Published article: 10 Tips for First-Time Home Buyers", ip: "192.168.1.103" },
  { id: 6, time: "2024-10-15 13:30:05", user: "Admin User", action: "Agent Approved", type: "Agent", details: "Approved agent registration for Michael Davis", ip: "192.168.1.100" },
  { id: 7, time: "2024-10-15 12:18:44", user: "System", action: "Backup Completed", type: "System", details: "Daily database backup completed successfully", ip: "—" },
  { id: 8, time: "2024-10-15 11:55:28", user: "John Smith", action: "Property Updated", type: "Property", details: "Updated pricing for Modern Downtown Apartment", ip: "192.168.1.101" },
  { id: 9, time: "2024-10-15 11:30:12", user: "Sarah Johnson", action: "Email Sent", type: "Communication", details: "Sent follow-up email to lead L007", ip: "192.168.1.102" },
  { id: 10, time: "2024-10-15 10:45:00", user: "Admin User", action: "User Created", type: "User", details: "Created new user account for David Lee", ip: "192.168.1.100" },
];

const typeColors: Record<string, string> = {
  Auth: "bg-blue-100 text-blue-800",
  Property: "bg-green-100 text-green-800",
  Lead: "bg-yellow-100 text-yellow-800",
  System: "bg-gray-100 text-gray-800",
  Content: "bg-purple-100 text-purple-800",
  Agent: "bg-orange-100 text-orange-800",
  Communication: "bg-cyan-100 text-cyan-800",
  User: "bg-pink-100 text-pink-800",
};

export default function ActivityLogsPage() {
  const [userFilter, setUserFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = logs.filter((log) => {
    const matchUser = userFilter === "All" || log.user === userFilter;
    const matchType = typeFilter === "All" || log.type === typeFilter;
    return matchUser && matchType;
  });

  return (
    <AdminLayout title="Activity Logs">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]"
        >
          <option value="All">All Users</option>
          <option value="Admin User">Admin User</option>
          <option value="John Smith">John Smith</option>
          <option value="Sarah Johnson">Sarah Johnson</option>
          <option value="Emily Brown">Emily Brown</option>
          <option value="System">System</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]"
        >
          <option value="All">All Types</option>
          <option value="Auth">Auth</option>
          <option value="Property">Property</option>
          <option value="Lead">Lead</option>
          <option value="System">System</option>
          <option value="Content">Content</option>
          <option value="Agent">Agent</option>
          <option value="Communication">Communication</option>
          <option value="User">User</option>
        </select>
        <button className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
          Export Logs
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A2647] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">{log.time}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{log.user}</td>
                  <td className="px-4 py-3 text-gray-700 text-sm">{log.action}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs rounded-full ${typeColors[log.type]}`}>{log.type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
