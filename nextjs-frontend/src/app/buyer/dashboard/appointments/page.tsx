"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface Appointment {
  id: number;
  property: string | null;
  address: string | null;
  agent: string | null;
  date: string | null;
  time: string | null;
  type: string;
  status: string;
}

const FILTERS = ["All", "Scheduled", "Completed", "Cancelled"];

export default function BuyerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<Appointment[]>("/buyer/appointments");
      setAppointments(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = filter === "All" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <BuyerLayout title="Appointments" subtitle="Your property viewings and inspections, scheduled by your agent.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
            <button onClick={fetchData} className="ml-3 underline font-semibold">Retry</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {FILTERS.map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? "bg-[#0A2647] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 max-w-xs text-right">To schedule a viewing, reach out to the listing agent from the property page.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Agent</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date & Time</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#0A2647] text-sm">{apt.property || "Property viewing"}</p>
                          <p className="text-slate-500 text-xs">{apt.address || "—"}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{apt.agent || "—"}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#0A2647]">{apt.date || "—"}</p>
                          <p className="text-xs text-slate-500">{apt.time}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.type === "Showing" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                            {apt.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            apt.status === "Scheduled" ? "bg-green-100 text-green-700" :
                            apt.status === "Completed" ? "bg-blue-100 text-blue-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  {appointments.length === 0 ? "No appointments yet — your agent will schedule viewings here." : "No appointments match this filter."}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </BuyerLayout>
  );
}
