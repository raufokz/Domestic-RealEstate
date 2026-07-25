"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface ActionCatalogItem {
  type: string;
  name: string;
  workflow_count: number;
}

const typeColors: Record<string, string> = {
  send_email: "bg-blue-100 text-blue-800",
  send_notification: "bg-purple-100 text-purple-800",
  create_task: "bg-teal-100 text-teal-800",
  assign_agent: "bg-green-100 text-green-800",
  update_status: "bg-indigo-100 text-indigo-800",
  post_social: "bg-pink-100 text-pink-800",
  add_tag: "bg-yellow-100 text-yellow-800",
  add_to_campaign: "bg-orange-100 text-orange-800",
};

export default function AutomationActionsPage() {
  const [actions, setActions] = useState<ActionCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActions();
  }, []);

  async function fetchActions() {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet<{ data: ActionCatalogItem[] }>("/admin/automation/actions");
      setActions(res.data || []);
    } catch (e) {
      // No silent fallback to fake data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load automation actions. Please check the API connection and try again."
      );
      setActions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Automation Actions">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            These are the action types the automation engine can run. Actions are configured
            inside individual{" "}
            <Link href="/admin/automation" className="font-semibold underline hover:text-blue-900">
              Workflows
            </Link>
            . The counts below show how many workflows currently use each action.
          </p>
        </div>

        {!loading && !error && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {actions.length} action type{actions.length !== 1 ? "s" : ""} available
            </p>
            <button
              onClick={fetchActions}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Refresh
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading actions...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchActions}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && actions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No action types found</h3>
            <p className="text-gray-500 text-sm">The automation engine reported no available actions.</p>
          </div>
        )}

        {!loading && !error && actions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Used by Workflows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {actions.map((action) => (
                    <tr key={action.type} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{action.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-mono ${typeColors[action.type] || "bg-gray-100 text-gray-700"}`}>
                          {action.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {action.workflow_count > 0 ? (
                          <span className="font-medium text-[#0A2647]">{action.workflow_count}</span>
                        ) : (
                          <span className="text-gray-400">Not used</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
