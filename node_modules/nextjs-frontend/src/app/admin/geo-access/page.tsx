"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, ApiError } from "@/lib/api";

interface GeoSettings {
  geo_blocking_enabled: boolean;
  mode: "blacklist" | "allowlist";
  blocked_countries: string[];
  allowed_countries: string[];
  vpn_detection_enabled: boolean;
  proxy_detection_enabled: boolean;
  tor_blocking_enabled: boolean;
  datacenter_blocking_enabled: boolean;
  custom_blocked_asns: number[];
  blocked_message: string;
  log_retention_days: number;
}

const DEFAULT_SETTINGS: GeoSettings = {
  geo_blocking_enabled: true,
  mode: "blacklist",
  blocked_countries: ["PK"],
  allowed_countries: [],
  vpn_detection_enabled: true,
  proxy_detection_enabled: true,
  tor_blocking_enabled: true,
  datacenter_blocking_enabled: true,
  custom_blocked_asns: [],
  blocked_message:
    "Domestic Real Estate is currently available only to users located in the United States and Canada. If you believe this is an error, please contact support.",
  log_retention_days: 90,
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

function CodeTagInput({
  values,
  onChange,
  placeholder,
  maxLength = 2,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  maxLength?: number;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const code = draft.trim().toUpperCase();
    if (code && code.length <= maxLength && !values.includes(code)) {
      onChange([...values, code]);
    }
    setDraft("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0A2647]/5 text-[#0A2647] rounded-full text-sm font-mono font-semibold">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-[#0A2647]/50 hover:text-red-600">
              ✕
            </button>
          </span>
        ))}
        {values.length === 0 && <span className="text-sm text-gray-400">None</span>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-[#C9A227] outline-none"
        />
        <button type="button" onClick={add} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
          Add
        </button>
      </div>
    </div>
  );
}

export default function GeoAccessSettingsPage() {
  const [settings, setSettings] = useState<GeoSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<{ data: GeoSettings }>("/admin/settings/geo-access");
      if (data.data) setSettings({ ...DEFAULT_SETTINGS, ...data.data });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load geo access settings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      await apiPut("/admin/settings/geo-access", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save geo access settings.");
    } finally {
      setSaving(false);
    }
  }

  const update = <K extends keyof GeoSettings>(field: K, value: GeoSettings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Geo Access Control">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Geo Access Control">
      <div className="space-y-6 max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Access Policy</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Geo Blocking Enabled</p>
                <p className="text-xs text-gray-500">Master switch — turn off to allow all traffic through regardless of country/VPN checks.</p>
              </div>
              <ToggleSwitch checked={settings.geo_blocking_enabled} onChange={(v) => update("geo_blocking_enabled", v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blocked Countries (ISO 3166-1 alpha-2)</label>
              <p className="text-xs text-gray-500 mb-2">Visitors from these countries are denied unless whitelisted. Defaults to Pakistan (PK).</p>
              <CodeTagInput values={settings.blocked_countries} onChange={(v) => update("blocked_countries", v)} placeholder="e.g. PK" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">VPN / Proxy / Tor Detection</h2>
          <p className="text-xs text-gray-500 mb-4">
            Free/self-hosted signals: Tor exit node list + known datacenter &amp; cloud-hosting ASNs. Applies globally, regardless of a visitor&apos;s apparent country.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Tor Exit Node Blocking</p>
              <ToggleSwitch checked={settings.tor_blocking_enabled} onChange={(v) => update("tor_blocking_enabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Datacenter / Hosting ASN Blocking</p>
              <ToggleSwitch checked={settings.datacenter_blocking_enabled} onChange={(v) => update("datacenter_blocking_enabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">VPN Detection</p>
              <ToggleSwitch checked={settings.vpn_detection_enabled} onChange={(v) => update("vpn_detection_enabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Proxy Detection</p>
              <ToggleSwitch checked={settings.proxy_detection_enabled} onChange={(v) => update("proxy_detection_enabled", v)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Blocked Page</h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message shown to blocked visitors</label>
          <textarea
            value={settings.blocked_message}
            onChange={(e) => update("blocked_message", e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Logging</h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">Log Retention (days)</label>
          <input
            type="number"
            value={settings.log_retention_days}
            onChange={(e) => update("log_retention_days", Number(e.target.value))}
            min={1}
            max={3650}
            className="w-40 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          {saved && <span className="text-sm text-green-600 font-medium self-center">✓ Saved successfully</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
