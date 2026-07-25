"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { useAuth } from "@/hooks/useAuth";

export default function AgentSettingsPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("account");

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new_password: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    email_leads: true,
    email_messages: true,
    email_marketing: false,
    sms_leads: false,
    sms_messages: false,
    push_leads: true,
    push_messages: true,
  });

  return (
    <AgentLayout title="Settings" subtitle="Manage your account settings">
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { key: "account", label: "Account" },
            { key: "password", label: "Password" },
            { key: "notifications", label: "Notifications" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
                tab === t.key ? "border-[#C9A227] text-[#0A2647]" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "account" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-5">Account Information</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input type="text" defaultValue={user?.name || ""} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" defaultValue={user?.email || ""} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <input type="text" value={user?.role || ""} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 capitalize" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <input type="text" value={user?.status || ""} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 capitalize" disabled />
              </div>
            </div>
            <button className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">Save Changes</button>
          </div>
        )}

        {tab === "password" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-5">Change Password</h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
              </div>
              <button className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">Update Password</button>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#0A2647] mb-5">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: "email_leads", label: "Email: New lead assigned", group: "Email Notifications" },
                { key: "email_messages", label: "Email: New message received", group: "Email Notifications" },
                { key: "email_marketing", label: "Email: Marketing & product updates", group: "Email Notifications" },
                { key: "sms_leads", label: "SMS: New lead assigned (Coming Soon)", group: "SMS Notifications" },
                { key: "sms_messages", label: "SMS: Urgent messages (Coming Soon)", group: "SMS Notifications" },
                { key: "push_leads", label: "Push: New lead assigned", group: "Push Notifications" },
                { key: "push_messages", label: "Push: New messages", group: "Push Notifications" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <button
                    onClick={() => setNotifications((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifications[item.key as keyof typeof notifications] ? "bg-[#C9A227]" : "bg-slate-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-6 px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">Save Preferences</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-4">Sign out of your account on this device.</p>
          <div className="flex gap-3">
            <button onClick={() => logout()} className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition">Sign Out</button>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
