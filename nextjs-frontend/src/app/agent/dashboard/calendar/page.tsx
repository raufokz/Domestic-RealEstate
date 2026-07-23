"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  client: string;
  location: string;
  color: string;
}

const EVENTS: Event[] = [
  { id: 1, title: "Property Showing - Ocean View Villa", date: "2026-07-11", time: "10:00 AM", duration: "1h", type: "showing", client: "Sarah Thompson", location: "890 Ocean Drive, Malibu", color: "bg-blue-500" },
  { id: 2, title: "Client Meeting - Investment Review", date: "2026-07-11", time: "2:00 PM", duration: "45m", type: "meeting", client: "David Kim", location: "Office", color: "bg-emerald-500" },
  { id: 3, title: "Open House", date: "2026-07-12", time: "11:00 AM", duration: "3h", type: "showing", client: "Walk-in", location: "456 Maple Lane, Dallas", color: "bg-purple-500" },
  { id: 4, title: "Contract Signing", date: "2026-07-13", time: "3:00 PM", duration: "30m", type: "meeting", client: "Rachel Green", location: "Virtual", color: "bg-amber-500" },
  { id: 5, title: "Follow-up Call", date: "2026-07-14", time: "9:00 AM", duration: "15m", type: "call", client: "Marcus Williams", location: "Phone", color: "bg-cyan-500" },
  { id: 6, title: "Home Inspection", date: "2026-07-15", time: "1:00 PM", duration: "2h", type: "showing", client: "Emily Park", location: "321 Main St, Chicago", color: "bg-rose-500" },
];

const TYPE_COLORS: Record<string, string> = {
  showing: "bg-blue-100 text-blue-700",
  meeting: "bg-emerald-100 text-emerald-700",
  call: "bg-cyan-100 text-cyan-700",
};

export default function AgentCalendarPage() {
  const [selectedDate, setSelectedDate] = useState("2026-07-11");
  const [showAddModal, setShowAddModal] = useState(false);

  const todayEvents = EVENTS.filter((e) => e.date === selectedDate);
  const upcomingEvents = EVENTS.filter((e) => e.date > selectedDate).slice(0, 5);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date("2026-07-11");
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      day: days[d.getDay()],
      num: d.getDate(),
      hasEvents: EVENTS.some((e) => e.date === d.toISOString().split("T")[0]),
    };
  });

  return (
    <AgentLayout title="Calendar" subtitle="Manage your appointments and showings">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0A2647]">July 2026</h3>
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
              + Add Event
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`p-3 rounded-lg text-center transition border-2 ${
                  selectedDate === day.date
                    ? "border-[#C9A227] bg-[#C9A227]/10"
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <p className="text-xs text-slate-500">{day.day}</p>
                <p className={`text-lg font-bold ${selectedDate === day.date ? "text-[#C9A227]" : "text-[#0A2647]"}`}>{day.num}</p>
                {day.hasEvents && <div className="w-1.5 h-1.5 bg-[#C9A227] rounded-full mx-auto mt-1" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Events on {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h3>
            {todayEvents.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                <p className="text-sm">No events scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-1 h-10 rounded-full ${event.color}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#0A2647] text-sm">{event.title}</h4>
                        <p className="text-slate-500 text-xs">{event.time} · {event.duration}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_COLORS[event.type]}`}>{event.type}</span>
                    </div>
                    <div className="ml-4 text-xs text-slate-500 space-y-1">
                      <p>Client: {event.client}</p>
                      <p>Location: {event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#0A2647] mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition cursor-pointer">
                  <div className={`w-1 h-10 rounded-full ${event.color}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#0A2647] text-sm truncate">{event.title}</h4>
                    <p className="text-slate-500 text-xs">{new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {event.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_COLORS[event.type]}`}>{event.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#0A2647]">Add Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input type="time" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm">
                  <option value="showing">Property Showing</option>
                  <option value="meeting">Meeting</option>
                  <option value="call">Phone Call</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">Save Event</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AgentLayout>
  );
}
