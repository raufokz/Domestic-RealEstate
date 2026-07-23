"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, apiPost } from "@/lib/api";

interface EmailSettings {
  from_name: string;
  from_email: string;
  reply_to: string;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  sendgrid_api_key: string;
  mailgun_domain: string;
  mailgun_secret: string;
  daily_limit: string;
}

const defaultSettings: EmailSettings = {
  from_name: "",
  from_email: "",
  reply_to: "",
  smtp_host: "",
  smtp_port: "587",
  smtp_username: "",
  smtp_password: "",
  smtp_encryption: "tls",
  sendgrid_api_key: "",
  mailgun_domain: "",
  mailgun_secret: "",
  daily_limit: "500",
};

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ data: EmailSettings }>("/admin/email-settings");
      if (data.data) setSettings({ ...defaultSettings, ...data.data });
    } catch {
      /* use defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleGroupSave = async (group: string, fields: Partial<EmailSettings>) => {
    try {
      setSaving(group);
      setMessage(null);
      await apiPut("/admin/email-settings", fields);
      setMessage({ type: "success", text: `${group} settings saved successfully` });
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to save" });
    } finally {
      setSaving("");
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    try {
      setSendingTest(true);
      await apiPost("/admin/email-settings/test", { email: testEmail });
      setMessage({ type: "success", text: "Test email sent successfully" });
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to send test email" });
    } finally {
      setSendingTest(false);
    }
  };

  const updateField = (field: keyof EmailSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Email Settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Email Settings">
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-[#8B1E3F]"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">✕</button>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A2647]">General Settings</h3>
            <p className="text-sm text-gray-500">Configure your email sender identity</p>
          </div>
          <button onClick={() => handleGroupSave("General", { from_name: settings.from_name, from_email: settings.from_email, reply_to: settings.reply_to })} disabled={saving === "General"} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50 text-sm">
            {saving === "General" ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
            <input type="text" value={settings.from_name} onChange={(e) => updateField("from_name", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="Your Company Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
            <input type="email" value={settings.from_email} onChange={(e) => updateField("from_email", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="noreply@yourdomain.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To</label>
            <input type="email" value={settings.reply_to} onChange={(e) => updateField("reply_to", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="support@yourdomain.com" />
          </div>
        </div>
      </div>

      {/* SMTP Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A2647]">SMTP Settings</h3>
            <p className="text-sm text-gray-500">Configure your SMTP mail server</p>
          </div>
          <button onClick={() => handleGroupSave("SMTP", { smtp_host: settings.smtp_host, smtp_port: settings.smtp_port, smtp_username: settings.smtp_username, smtp_password: settings.smtp_password, smtp_encryption: settings.smtp_encryption })} disabled={saving === "SMTP"} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50 text-sm">
            {saving === "SMTP" ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
            <input type="text" value={settings.smtp_host} onChange={(e) => updateField("smtp_host", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="smtp.gmail.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
            <input type="text" value={settings.smtp_port} onChange={(e) => updateField("smtp_port", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="587" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
            <select value={settings.smtp_encryption} onChange={(e) => updateField("smtp_encryption", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={settings.smtp_username} onChange={(e) => updateField("smtp_username", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={settings.smtp_password} onChange={(e) => updateField("smtp_password", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
          </div>
        </div>
      </div>

      {/* SendGrid Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A2647]">SendGrid</h3>
            <p className="text-sm text-gray-500">Configure SendGrid API integration</p>
          </div>
          <button onClick={() => handleGroupSave("SendGrid", { sendgrid_api_key: settings.sendgrid_api_key })} disabled={saving === "SendGrid"} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50 text-sm">
            {saving === "SendGrid" ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="max-w-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input type="password" value={settings.sendgrid_api_key} onChange={(e) => updateField("sendgrid_api_key", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="SG.xxxxxxxxxxxx" />
        </div>
      </div>

      {/* Mailgun Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A2647]">Mailgun</h3>
            <p className="text-sm text-gray-500">Configure Mailgun integration</p>
          </div>
          <button onClick={() => handleGroupSave("Mailgun", { mailgun_domain: settings.mailgun_domain, mailgun_secret: settings.mailgun_secret })} disabled={saving === "Mailgun"} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50 text-sm">
            {saving === "Mailgun" ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <input type="text" value={settings.mailgun_domain} onChange={(e) => updateField("mailgun_domain", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="mg.yourdomain.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input type="password" value={settings.mailgun_secret} onChange={(e) => updateField("mailgun_secret", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
          </div>
        </div>
      </div>

      {/* Campaign Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A2647]">Campaign Settings</h3>
            <p className="text-sm text-gray-500">Configure email campaign limits</p>
          </div>
          <button onClick={() => handleGroupSave("Campaign", { daily_limit: settings.daily_limit })} disabled={saving === "Campaign"} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50 text-sm">
            {saving === "Campaign" ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily Send Limit</label>
          <input type="number" value={settings.daily_limit} onChange={(e) => updateField("daily_limit", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" min="0" />
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A2647]">Test Email</h3>
            <p className="text-sm text-gray-500">Send a test email to verify your configuration</p>
          </div>
        </div>
        <div className="flex gap-3 max-w-md">
          <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" placeholder="test@example.com" />
          <button onClick={handleTestEmail} disabled={sendingTest || !testEmail} className="px-5 py-2 bg-[#0A2647] text-white rounded-lg font-semibold hover:bg-[#0d3360] disabled:opacity-50 whitespace-nowrap">
            {sendingTest ? "Sending..." : "Send Test"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
