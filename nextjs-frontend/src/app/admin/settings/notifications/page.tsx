"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut } from "@/lib/api";

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  new_lead: boolean;
  new_enquiry: boolean;
  property_inquiry: boolean;
  offer_received: boolean;
  payment_received: boolean;
  contract_signed: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  email_enabled: true,
  sms_enabled: false,
  push_enabled: true,
  new_lead: true,
  new_enquiry: true,
  property_inquiry: true,
  offer_received: true,
  payment_received: true,
  contract_signed: true,
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const data = await apiGet<{ data: NotificationSettings }>("/admin/settings/notifications");
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
      await apiPut("/admin/settings/notifications", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const update = (field: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Notification Settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  const eventToggles = [
    { key: "new_lead" as const, label: "New Lead", icon: "👤", description: "When a new lead is created" },
    { key: "new_enquiry" as const, label: "New Enquiry", icon: "📩", description: "When a new enquiry is received" },
    { key: "property_inquiry" as const, label: "Property Inquiry", icon: "🏠", description: "When someone inquires about a property" },
    { key: "offer_received" as const, label: "Offer Received", icon: "💰", description: "When a new offer is placed" },
    { key: "payment_received" as const, label: "Payment Received", icon: "✅", description: "When a payment is processed" },
    { key: "contract_signed" as const, label: "Contract Signed", icon: "📝", description: "When a contract is digitally signed" },
  ];

  return (
    <AdminLayout title="Notification Settings">
      <div className="space-y-6 max-w-3xl">
        {/* Notification Channels */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Notification Channels</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <ToggleSwitch checked={settings.email_enabled} onChange={(v) => update("email_enabled", v)} />
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                </div>
              </div>
              <ToggleSwitch checked={settings.sms_enabled} onChange={(v) => update("sms_enabled", v)} />
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                  <p className="text-xs text-gray-500">Receive browser push notifications</p>
                </div>
              </div>
              <ToggleSwitch checked={settings.push_enabled} onChange={(v) => update("push_enabled", v)} />
            </div>
          </div>
        </div>

        {/* Event Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Event Notifications</h2>
          <p className="text-sm text-gray-500 mb-4">Choose which events trigger notifications.</p>
          <div className="space-y-1">
            {eventToggles.map((event, i) => (
              <div key={event.key}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{event.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.label}</p>
                      <p className="text-xs text-gray-500">{event.description}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={settings[event.key]} onChange={(v) => update(event.key, v)} />
                </div>
                {i < eventToggles.length - 1 && <div className="border-t border-gray-100" />}
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          {saved && <span className="text-sm text-green-600 font-medium self-center">✓ Saved successfully</span>}
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Notification Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
