"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface IntegrationDetail {
  id: number;
  key: string;
  name: string;
  category: string;
  status: string;
  docs_url?: string | null;
  last_tested_at?: string | null;
  last_error_message?: string | null;
  credentials?: Record<string, string> | null;
}

type FieldDef = { key: string; label: string; type: string; placeholder: string };

const FIELDS_BY_CATEGORY: Record<string, FieldDef[]> = {
  email: [
    { key: "host", label: "SMTP Host", type: "text", placeholder: "mail.privateemail.com" },
    { key: "port", label: "SMTP Port", type: "number", placeholder: "587" },
    { key: "username", label: "Username", type: "text", placeholder: "info@domesticrealestate.us" },
    { key: "password", label: "Password", type: "password", placeholder: "Email password" },
    { key: "api_key", label: "SendGrid API Key (optional)", type: "password", placeholder: "SG...." },
  ],
  ai: [{ key: "api_key", label: "API Key", type: "password", placeholder: "Paste your API key" }],
  maps: [{ key: "api_key", label: "API Key", type: "password", placeholder: "AIzaSy..." }],
  calendar: [
    { key: "client_id", label: "Client ID", type: "text", placeholder: "Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Client Secret" },
  ],
  storage: [
    { key: "cloud_name", label: "Cloud Name", type: "text", placeholder: "your-cloud" },
    { key: "api_key", label: "API Key", type: "password", placeholder: "API Key" },
    { key: "api_secret", label: "API Secret", type: "password", placeholder: "API Secret" },
  ],
  analytics: [{ key: "tracking_id", label: "Tracking ID", type: "text", placeholder: "G-XXXXXXXX" }],
  esign: [{ key: "api_key", label: "API Key", type: "password", placeholder: "API Key" }],
  automation: [
    { key: "api_key", label: "API Key", type: "password", placeholder: "API Key" },
    { key: "webhook_url", label: "Webhook URL", type: "text", placeholder: "https://hooks.zapier.com/..." },
  ],
  payments: [
    { key: "email", label: "Payoneer Account Email", type: "email", placeholder: "billing@domesticrealestate.us" },
  ],
  social: [],
};

const statusConfig: Record<string, { label: string; color: string }> = {
  not_configured: { label: "Not Configured", color: "bg-gray-100 text-gray-700" },
  not_connected: { label: "Not Connected", color: "bg-gray-100 text-gray-700" },
  disconnected: { label: "Disconnected", color: "bg-gray-100 text-gray-700" },
  connected: { label: "Connected", color: "bg-green-100 text-green-800" },
  warning: { label: "Needs Retest", color: "bg-amber-100 text-amber-800" },
  error: { label: "Error", color: "bg-red-100 text-red-800" },
};

export default function IntegrationDetailPage() {
  const { success, notifyError, warning } = useToast();
  const params = useParams();
  const key = params.key as string;

  const [integration, setIntegration] = useState<IntegrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchIntegration = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<IntegrationDetail>(`/admin/integrations/${key}`);
      setIntegration(data);
      setFormData((data.credentials as Record<string, string>) || {});
    } catch (err) {
      notifyError(err, "Integrations is not working because this integration could not be loaded.");
      setIntegration(null);
    } finally {
      setLoading(false);
    }
  }, [key, notifyError]);

  useEffect(() => {
    void fetchIntegration();
  }, [fetchIntegration]);

  async function handleTest() {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await apiPost<{ success?: boolean; message?: string }>(
        `/admin/integrations/${key}/test`,
        {}
      );
      setTestResult({ success: true, message: res.message || "Connection test passed" });
      success(res.message || "Connection test passed", "Integrations");
      await fetchIntegration();
    } catch (err) {
      notifyError(err, `${integration?.name || "Integration"} is not working because the connection test failed.`);
      const message =
        err instanceof Error ? err.message : "Test failed";
      setTestResult({ success: false, message });
      setIntegration((prev) =>
        prev ? { ...prev, status: "error", last_error_message: message } : prev
      );
    } finally {
      setTesting(false);
    }
  }

  async function handleConnect() {
    try {
      setConnecting(true);
      const cleaned = Object.fromEntries(
        Object.entries(formData).filter(([, v]) => String(v || "").trim() !== "")
      );
      if (Object.keys(cleaned).length === 0 && integration?.category !== "social") {
        warning("Add your credentials first, then click Connect.", {
          title: "Missing credentials",
        });
        return;
      }
      const payload =
        Object.keys(cleaned).length > 0 ? cleaned : { connected: "true" };
      const res = await apiPost<{ message?: string }>(`/admin/integrations/${key}/connect`, {
        credentials: payload,
      });
      success(res.message || "Connected successfully. Run Test next.", "Integrations");
      await fetchIntegration();
    } catch (err) {
      notifyError(err, "Integrations is not working because credentials could not be saved.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect and clear saved credentials?")) return;
    try {
      setDisconnecting(true);
      const res = await apiPost<{ message?: string }>(`/admin/integrations/${key}/disconnect`);
      success(res.message || "Disconnected.", "Integrations");
      setFormData({});
      await fetchIntegration();
    } catch (err) {
      notifyError(err, "Integrations is not working because disconnect failed.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Integration Setup">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading integration...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!integration) {
    return (
      <AdminLayout title="Integration Not Found">
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Integration not found</h3>
          <p className="text-sm text-gray-500 mb-4">
            Seed integrations from the hub first if the list is empty.
          </p>
          <Link
            href="/admin/integrations"
            className="mt-4 inline-block px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
          >
            Back to Integrations
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const category = (integration.category || "").toLowerCase();
  const isSocial = category === "social";
  const fields = FIELDS_BY_CATEGORY[category] || [{ key: "api_key", label: "API Key", type: "password", placeholder: "API Key" }];
  const statusMeta = statusConfig[integration.status] || statusConfig.not_configured;

  return (
    <AdminLayout title={`${integration.name} Setup`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/integrations" className="hover:text-[#0A2647]">
            Integrations
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{integration.name}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-navy/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#0A2647] rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {integration.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0A2647] font-heading">{integration.name}</h2>
                <p className="text-gray-500 text-sm capitalize">{integration.category}</p>
              </div>
            </div>
            <span className={`px-3 py-1.5 text-sm rounded-full font-medium ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>
          {integration.docs_url && (
            <a
              href={integration.docs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-[#C9A227] hover:underline"
            >
              View Documentation →
            </a>
          )}
        </div>

        {(integration.last_tested_at || integration.last_error_message) && (
          <div
            className={`rounded-xl p-6 ${
              integration.status === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <h3 className="font-semibold text-sm mb-2 text-navy">Connection Status</h3>
            {integration.last_tested_at && (
              <p className="text-sm text-gray-600">
                Last tested: {new Date(integration.last_tested_at).toLocaleString()}
              </p>
            )}
            {integration.last_error_message && (
              <p className="text-sm text-red-700 mt-1">
                {integration.name} is not working because {integration.last_error_message}
              </p>
            )}
          </div>
        )}

        {testResult && (
          <div
            className={`rounded-xl p-6 ${
              testResult.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <h3 className="font-semibold text-sm text-navy">
              {testResult.success ? "Test Passed" : "Test Failed"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{testResult.message}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-navy/5">
          <h3 className="text-lg font-bold text-[#0A2647] mb-4 font-heading">Setup</h3>

          {isSocial ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Save a placeholder token or OAuth credentials, then use Test. Full OAuth popup can be
                completed when platform apps are approved.
              </p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="px-8 py-3 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-600 transition disabled:opacity-50"
              >
                {connecting ? "Connecting..." : `Mark ${integration.name} Connected`}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={formData[field.key] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none text-navy"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 text-navy"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
            {integration.status !== "connected" ? (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
              >
                {connecting ? "Connecting..." : "Connect"}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-5 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between border border-navy/5">
          <span className="text-sm text-gray-600">View connection and test history</span>
          <Link
            href={`/admin/integrations/${key}/logs`}
            className="text-sm font-medium text-[#C9A227] hover:text-[#0A2647]"
          >
            Test Logs →
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
