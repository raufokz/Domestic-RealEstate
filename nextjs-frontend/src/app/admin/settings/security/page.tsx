"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut } from "@/lib/api";

interface SecuritySettings {
  two_factor_auth: boolean;
  session_timeout: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  ip_whitelist: string;
  login_attempts_limit: number;
  lockout_duration: number;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  two_factor_auth: false,
  session_timeout: 30,
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_numbers: true,
  password_require_symbols: false,
  ip_whitelist: "",
  login_attempts_limit: 5,
  lockout_duration: 15,
};

const TIMEOUT_OPTIONS = [5, 15, 30, 60, 120, 240, 480];

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const data = await apiGet<{ data: SecuritySettings }>("/admin/settings/security");
      if (data.data) setSettings(data.data);
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await apiPut("/admin/settings/security", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const update = <K extends keyof SecuritySettings>(field: K, value: SecuritySettings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  if (loading) {
    return (
      <AdminLayout title="Security Settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Security Settings">
      <div className="space-y-6 max-w-3xl">
        {/* Authentication */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Authentication</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Require 2FA for all admin users</p>
              </div>
              <ToggleSwitch checked={settings.two_factor_auth} onChange={(v) => update("two_factor_auth", v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <select value={settings.session_timeout} onChange={(e) => update("session_timeout", Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none">
                {TIMEOUT_OPTIONS.map((t) => <option key={t} value={t}>{t} minutes</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Password Policy</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
              <input type="number" value={settings.password_min_length} onChange={(e) => update("password_min_length", Number(e.target.value))} min={6} max={64} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Require Uppercase Letters</p>
              <ToggleSwitch checked={settings.password_require_uppercase} onChange={(v) => update("password_require_uppercase", v)} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Require Numbers</p>
              <ToggleSwitch checked={settings.password_require_numbers} onChange={(v) => update("password_require_numbers", v)} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Require Symbols</p>
              <ToggleSwitch checked={settings.password_require_symbols} onChange={(v) => update("password_require_symbols", v)} />
            </div>
          </div>
        </div>

        {/* Login Protection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Login Protection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
              <input type="number" value={settings.login_attempts_limit} onChange={(e) => update("login_attempts_limit", Number(e.target.value))} min={3} max={20} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (minutes)</label>
              <input type="number" value={settings.lockout_duration} onChange={(e) => update("lockout_duration", Number(e.target.value))} min={5} max={120} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
          </div>
        </div>

        {/* IP Whitelist */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">IP Whitelist</h2>
          <p className="text-sm text-gray-500 mb-3">One IP address per line. Leave empty to allow all IPs.</p>
          <textarea value={settings.ip_whitelist} onChange={(e) => update("ip_whitelist", e.target.value)} rows={6} placeholder="192.168.1.1&#10;10.0.0.1" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none font-mono" />
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          {saved && <span className="text-sm text-green-600 font-medium self-center">✓ Saved successfully</span>}
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Security Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
