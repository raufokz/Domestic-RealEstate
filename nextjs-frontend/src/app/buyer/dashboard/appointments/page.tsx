"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Appointment {
  id: number;
  property: string;
  address: string;
  agent: string;
  date: string;
  time: string;
  type: string;
  status: string;
  gradient: string;
}

const FALLBACK_DATA: Appointment[] = [
  { id: 1, property: "Luxury Beachfront Villa", address: "890 Ocean Drive, Malibu", agent: "Sarah Johnson", date: "Jul 15, 2026", time: "2:30 PM", type: "Showing", status: "Scheduled", gradient: "from-cyan-400 to-cyan-600" },
  { id: 2, property: "Modern Downtown Loft", address: "321 Main St, Chicago", agent: "Michael Chen", date: "Jul 14, 2026", time: "10:00 AM", type: "Inspection", status: "Completed", gradient: "from-violet-400 to-violet-600" },
  { id: 3, property: "Suburban Family Estate", address: "456 Maple Lane, Dallas", agent: "Emily Davis", date: "Jul 18, 2026", time: "11:00 AM", type: "Showing", status: "Scheduled", gradient: "from-rose-400 to-rose-600" },
  { id: 4, property: "Penthouse Suite", address: "100 Skyline Blvd, NYC", agent: "Sarah Johnson", date: "Jul 10, 2026", time: "3:00 PM", type: "Showing", status: "Cancelled", gradient: "from-amber-400 to-amber-600" },
  { id: 5, property: "Lakefront Cottage", address: "321 Lakeshore Dr, Milwaukee", agent: "Lisa Anderson", date: "Jul 20, 2026", time: "1:00 PM", type: "Inspection", status: "Scheduled", gradient: "from-blue-400 to-blue-600" },
];

export default function BuyerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Appointment[]>("/buyer/appointments");
        setAppointments(result);
      } catch {
        setAppointments(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <BuyerLayout title="Appointments" subtitle="Manage your property viewings and inspections.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {["All", "Scheduled", "Completed", "Cancelled"].map((f) => (
                  <button key={f} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${f === "All" ? "bg-[#0A2647] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                + Schedule Viewing
              </button>
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
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${apt.gradient} flex-shrink-0`} />
                            <div>
                              <p className="font-semibold text-[#0A2647] text-sm">{apt.property}</p>
                              <p className="text-slate-500 text-xs">{apt.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{apt.agent}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#0A2647]">{apt.date}</p>
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
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {apt.status === "Scheduled" && (
                              <>
                                <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Reschedule</button>
                                <button className="text-slate-400 hover:text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Cancel</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </BuyerLayout>
  );
}
