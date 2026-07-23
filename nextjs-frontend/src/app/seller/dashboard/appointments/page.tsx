"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Appointment {
  id: number;
  property: string;
  buyersAgent: string;
  date: string;
  time: string;
  type: string;
  feedback: string;
  status: string;
  gradient: string;
}

const FALLBACK_DATA: Appointment[] = [
  { id: 1, property: "Luxury Beachfront Villa", buyersAgent: "Sarah Johnson", date: "Jul 15, 2026", time: "2:30 PM", type: "Showing", feedback: "Loved the ocean view, concerned about HOA fees", status: "Scheduled", gradient: "from-cyan-400 to-cyan-600" },
  { id: 2, property: "Modern Downtown Loft", buyersAgent: "Michael Chen", date: "Jul 14, 2026", time: "10:00 AM", type: "Open House", feedback: "", status: "Completed", gradient: "from-violet-400 to-violet-600" },
  { id: 3, property: "Suburban Family Estate", buyersAgent: "Emily Davis", date: "Jul 18, 2026", time: "11:00 AM", type: "Showing", feedback: "", status: "Scheduled", gradient: "from-rose-400 to-rose-600" },
  { id: 4, property: "Penthouse Suite", buyersAgent: "Lisa Anderson", date: "Jul 12, 2026", time: "3:00 PM", type: "Showing", feedback: "Excellent property, will make an offer", status: "Completed", gradient: "from-amber-400 to-amber-600" },
];

export default function SellerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Appointment[]>("/seller/appointments");
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
    <SellerLayout title="Showing Appointments" subtitle="Manage property showings and open houses.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {["All", "Scheduled", "Completed"].map((f) => (
                  <button key={f} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${f === "All" ? "bg-[#0A2647] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                + Schedule Showing
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Buyer&apos;s Agent</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date & Time</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Feedback</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${apt.gradient} flex-shrink-0`} />
                            <span className="font-semibold text-[#0A2647] text-sm">{apt.property}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{apt.buyersAgent}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#0A2647]">{apt.date}</p>
                          <p className="text-xs text-slate-500">{apt.time}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.type === "Showing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                            {apt.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 max-w-[200px] truncate">{apt.feedback || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.status === "Scheduled" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                            {apt.status}
                          </span>
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
    </SellerLayout>
  );
}
