"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useState } from "react";

const ALERTS = [
  { id: 1, name: "Miami 3+ Beds Under $600K", location: "Miami, FL", frequency: "Instant", enabled: true, matches: 5, lastTriggered: "2h ago" },
  { id: 2, name: "Austin Family Homes", location: "Austin, TX", frequency: "Daily", enabled: true, matches: 2, lastTriggered: "1d ago" },
  { id: 3, name: "NYC Luxury Condos", location: "New York, NY", frequency: "Weekly", enabled: false, matches: 0, lastTriggered: "5d ago" },
  { id: 4, name: "Denver Mountain Properties", location: "Denver, CO", frequency: "Instant", enabled: true, matches: 8, lastTriggered: "12h ago" },
  { id: 5, name: "Tampa Waterfront Homes", location: "Tampa, FL", frequency: "Daily", enabled: false, matches: 1, lastTriggered: "3d ago" },
];

export default function BuyerAlertsPage() {
  const [alerts, setAlerts] = useState(ALERTS);

  function toggleAlert(id: number) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  }

  return (
    <BuyerLayout title="Property Alerts" subtitle="Manage your property search alerts and notifications.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{alerts.filter((a) => a.enabled).length} active alerts</span>
          <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + New Alert
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2647]">{alerts.filter((a) => a.enabled).length}</p>
                <p className="text-xs text-slate-500">Active Alerts</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2647]">{alerts.reduce((sum, a) => sum + a.matches, 0)}</p>
                <p className="text-xs text-slate-500">Total Matches</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2647]">{alerts.length}</p>
                <p className="text-xs text-slate-500">Total Searches</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0A2647] text-sm">{alert.name}</p>
                  <p className="text-slate-500 text-xs">{alert.location} · {alert.frequency} · {alert.matches} matches</p>
                </div>
                <span className="text-xs text-slate-400">{alert.lastTriggered}</span>
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${alert.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${alert.enabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
