"use client";

import StaffLayout from "@/components/staff/StaffLayout";

const STATS = [
  { label: "Pending Tasks", value: "12", change: "4 due today", color: "bg-amber-50 text-amber-600", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { label: "Assigned Leads", value: "18", change: "+3 this week", color: "bg-blue-50 text-blue-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Completed Today", value: "7", change: "Target: 10", color: "bg-emerald-50 text-emerald-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Performance Score", value: "94%", change: "+2% vs last week", color: "bg-purple-50 text-purple-600", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
];

const TASKS = [
  { id: 1, title: "Review new agent applications", priority: "High", due: "10:00 AM", status: "Pending" },
  { id: 2, title: "Update property listings for compliance", priority: "Medium", due: "12:00 PM", status: "In Progress" },
  { id: 3, title: "Process commission payments", priority: "High", due: "2:00 PM", status: "Pending" },
  { id: 4, title: "Respond to buyer escalations", priority: "Medium", due: "3:30 PM", status: "Pending" },
  { id: 5, title: "Generate weekly performance report", priority: "Low", due: "5:00 PM", status: "Pending" },
];

const ACTIVITY_FEED = [
  { action: "Lead converted", detail: "John Martinez → Closed deal on 789 Lakeview Dr", time: "25 min ago", type: "success" },
  { action: "New assignment", detail: "3 leads assigned by Admin for Q3 follow-up", time: "1h ago", type: "info" },
  { action: "Task completed", detail: "Property inspection checklist submitted for Oak Lane", time: "2h ago", type: "success" },
  { action: "Escalation resolved", detail: "Karen White pricing query resolved at $465K", time: "3h ago", type: "warning" },
  { action: "Document uploaded", detail: "Signed NDA for Downtown Loft showing", time: "5h ago", type: "info" },
];

export default function StaffDashboardPage() {
  return (
    <StaffLayout title="Dashboard" subtitle="Daily operations and task management">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#0A2647]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Today&apos;s Tasks</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {TASKS.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === "High" ? "bg-red-500" :
                      task.priority === "Medium" ? "bg-amber-400" :
                      "bg-slate-300"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0A2647] text-sm">{task.title}</p>
                      <p className="text-xs text-slate-500">Due: {task.due}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        task.priority === "High" ? "bg-red-100 text-red-700" :
                        task.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        task.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Recent Activity</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
                {ACTIVITY_FEED.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.type === "success" ? "bg-emerald-100" :
                      item.type === "warning" ? "bg-amber-100" :
                      "bg-blue-100"
                    }`}>
                      <svg className={`w-4 h-4 ${
                        item.type === "success" ? "text-emerald-600" :
                        item.type === "warning" ? "text-amber-600" :
                        "text-blue-600"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                          item.type === "success" ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                          item.type === "warning" ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" :
                          "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        } />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0A2647] text-sm">{item.action}</p>
                      <p className="text-xs text-slate-500 truncate">{item.detail}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Performance Overview</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-500">Tasks Completed</span>
                    <span className="text-sm font-bold text-[#0A2647]">87 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "87%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-500">Lead Conversion</span>
                    <span className="text-sm font-bold text-[#0A2647]">14 / 18</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#C9A227] h-2 rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-500">Client Satisfaction</span>
                    <span className="text-sm font-bold text-[#0A2647]">4.8 / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "96%" }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#0A2647]">Overall Score</span>
                    <span className="text-lg font-bold text-[#C9A227]">94%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A2647] mb-4">Quick Actions</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                {[
                  { label: "Add New Task", icon: "M12 4v16m8-8H4" },
                  { label: "View All Leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" },
                  { label: "Generate Report", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                  { label: "Send Follow-up", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                ].map((action) => (
                  <span
                    key={action.label}
                    aria-disabled="true"
                    title={`${action.label} is not available yet`}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed select-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                    {action.label}
                    <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400 border border-slate-300 rounded px-1.5 py-0.5">
                      Soon
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
