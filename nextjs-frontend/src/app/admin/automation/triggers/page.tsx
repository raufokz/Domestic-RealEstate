"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface TriggerCatalogItem {
  event_type: string;
  name: string;
  workflow_count: number;
  active_count: number;
}

const eventColors: Record<string, string> = {
  new_lead: "bg-blue-100 text-blue-800",
  form_submitted: "bg-green-100 text-green-800",
  status_changed: "bg-indigo-100 text-indigo-800",
  property_approved: "bg-teal-100 text-teal-800",
  appointment_booked: "bg-yellow-100 text-yellow-800",
  contract_signed: "bg-pink-100 text-pink-800",
  newsletter_subscribed: "bg-purple-100 text-purple-800",
  contact_imported: "bg-cyan-100 text-cyan-800",
  scheduled_time: "bg-orange-100 text-orange-800",
};

export default function AutomationTriggersPage() {
  const [triggers, setTriggers] = useState<TriggerCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTriggers();
  }, []);

  async function fetchTriggers() {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet<{ data: TriggerCatalogItem[] }>("/admin/automation/triggers");
      setTriggers(res.data || []);
    } catch (e) {
      // No silent fallback to fake data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load automation triggers. Please check the API connection and try again."
      );
      setTriggers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Automation Triggers">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            These are the events that can start an automation. Triggers are selected when you build a{" "}
            <Link href="/admin/automation" className="font-semibold underline hover:text-blue-900">
              Workflow
            </Link>
            . The counts below show how many workflows listen to each event.
          </p>
        </div>

        {!loading && !error && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {triggers.length} trigger event{triggers.length !== 1 ? "s" : ""} available
            </p>
            <button
              onClick={fetchTriggers}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Refresh
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading triggers...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchTriggers}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && triggers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trigger events found</h3>
            <p className="text-gray-500 text-sm">The automation engine reported no available triggers.</p>
          </div>
        )}

        {!loading && !error && triggers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Trigger</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Event Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Workflows</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {triggers.map((t) => (
                    <tr key={t.event_type} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{t.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-mono ${eventColors[t.event_type] || "bg-gray-100 text-gray-700"}`}>
                          {t.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.workflow_count > 0 ? (
                          <span className="font-medium text-[#0A2647]">{t.workflow_count}</span>
                        ) : (
                          <span className="text-gray-400">Not used</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.active_count > 0 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            {t.active_count} active
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
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
