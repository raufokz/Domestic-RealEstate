"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AgentLayout from "@/components/agent/AgentLayout";
import { useAuth } from "@/hooks/useAuth";
import { apiPut, ApiError } from "@/lib/api";

export default function AgentSettingsPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("account");
  const [name, setName] = useState(user?.name || "");
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new_password: "",
    confirm: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  async function handleSaveAccount() {
    setSavingAccount(true);
    setAccountMessage(null);
    try {
      await apiPut("/auth/profile", { name });
      setAccountMessage("Account information saved.");
    } catch (e) {
      setAccountMessage(e instanceof ApiError ? e.message : "Could not save account information.");
    } finally {
      setSavingAccount(false);
      setTimeout(() => setAccountMessage(null), 4000);
    }
  }

  async function handleUpdatePassword() {
    if (passwordForm.new_password !== passwordForm.confirm) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }
    setSavingPassword(true);
    setPasswordMessage(null);
    try {
      await apiPut("/auth/change-password", {
        current_password: passwordForm.current,
        password: passwordForm.new_password,
        password_confirmation: passwordForm.confirm,
      });
      setPasswordMessage("Password updated successfully.");
      setPasswordForm({ current: "", new_password: "", confirm: "" });
    } catch (e) {
      setPasswordMessage(e instanceof ApiError ? e.message : "Could not update password.");
    } finally {
      setSavingPassword(false);
      setTimeout(() => setPasswordMessage(null), 4000);
    }
  }

  return (
    <AgentLayout title="Settings" subtitle="Manage your account settings">
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { key: "account", label: "Account" },
            { key: "password", label: "Password" },
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
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
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
            <div className="flex items-center gap-3">
              <button onClick={handleSaveAccount} disabled={savingAccount} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
                {savingAccount ? "Saving..." : "Save Changes"}
              </button>
              {accountMessage && <span className="text-xs font-semibold text-slate-600">{accountMessage}</span>}
            </div>
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
              <div className="flex items-center gap-3">
                <button onClick={handleUpdatePassword} disabled={savingPassword || !passwordForm.current || !passwordForm.new_password} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
                {passwordMessage && <span className="text-xs font-semibold text-slate-600">{passwordMessage}</span>}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#0A2647]">Full Profile, Media & Notification Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage your public bio, license/MLS details, profile photo, brokerage info, and notification preferences from your Profile page.</p>
          </div>
          <Link href="/agent/dashboard/profile" className="shrink-0 px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0d3366] transition">
            Go to Profile
          </Link>
        </div>

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
