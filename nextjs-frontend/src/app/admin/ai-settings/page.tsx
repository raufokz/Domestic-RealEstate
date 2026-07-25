"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, apiPost } from "@/lib/api";

interface Integration {
  id: number;
  key: string;
  name: string;
  category: string;
  status: string;
  credentials: Record<string, unknown> | null;
  is_free_tier: boolean;
  docs_url: string | null;
  last_tested_at: string | null;
  last_test_result: string | null;
  last_error_message: string | null;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const statusLabels: Record<string, { label: string; color: string }> = {
  connected: { label: "Connected", color: "bg-green-100 text-green-800" },
  not_configured: { label: "Not configured", color: "bg-gray-100 text-gray-600" },
  error: { label: "Error", color: "bg-red-100 text-red-800" },
  disconnected: { label: "Disconnected", color: "bg-yellow-100 text-yellow-800" },
};

const defaultAiKeys = ["google_gemini", "openai", "anthropic"];

export default function AiSettingsPage() {
  const [providers, setProviders] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await apiGet<Integration[]>("/admin/integrations");
      const aiProviders = all.filter(
        (i) => i.category === "ai" || defaultAiKeys.includes(i.key)
      );
      setProviders(aiProviders);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load AI providers";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeyInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveKey = async (integration: Integration) => {
    const apiKey = apiKeyInputs[integration.key];
    if (!apiKey) return;
    try {
      await apiPost(`/admin/integrations/${integration.key}/connect`, {
        credentials: { api_key: apiKey },
      });
      setProviders((prev) =>
        prev.map((p) =>
          p.key === integration.key
            ? { ...p, status: "connected", credentials: { api_key: "***" } }
            : p
        )
      );
      setApiKeyInputs((prev) => ({ ...prev, [integration.key]: "" }));
      setToast({ message: `${integration.name} connected successfully`, type: "success" });
    } catch {
      setToast({ message: `Failed to save ${integration.name} key`, type: "error" });
    }
  };

  const testConnection = async (integration: Integration) => {
    setTesting((prev) => ({ ...prev, [integration.key]: true }));
    try {
      const res = await apiPost<{ status: string; message: string }>(
        `/admin/integrations/${integration.key}/test`
      );
      if (res.status === "success") {
        setProviders((prev) =>
          prev.map((p) =>
            p.key === integration.key
              ? { ...p, status: "connected", last_test_result: "success", last_tested_at: new Date().toISOString() }
              : p
          )
        );
        setToast({ message: `${integration.name}: ${res.message}`, type: "success" });
      } else {
        setToast({ message: `${integration.name} test failed`, type: "error" });
      }
    } catch {
      setProviders((prev) =>
        prev.map((p) =>
          p.key === integration.key
            ? { ...p, status: "error", last_test_result: "failure" }
            : p
        )
      );
      setToast({ message: `${integration.name} connection test failed`, type: "error" });
    } finally {
      setTesting((prev) => ({ ...prev, [integration.key]: false }));
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    try {
      await apiPost(`/admin/integrations/${integration.key}/disconnect`);
      setProviders((prev) =>
        prev.map((p) =>
          p.key === integration.key
            ? { ...p, status: "disconnected", credentials: null, last_test_result: null, last_error_message: null }
            : p
        )
      );
      setToast({ message: `${integration.name} disconnected`, type: "success" });
    } catch {
      setToast({ message: `Failed to disconnect ${integration.name}`, type: "error" });
    }
  };

  return (
    <AdminLayout title="AI Settings">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-opacity ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* AI Providers Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-primary,#0A2647)] mb-4">AI Provider Configuration</h2>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button onClick={fetchProviders} className="px-4 py-2 bg-[var(--color-primary,#0A2647)] text-white rounded-lg text-sm hover:opacity-90">
              Retry
            </button>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            No AI providers configured. Run the integrations seeder first.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {providers.map((provider) => {
              const st = statusLabels[provider.status] || statusLabels.not_configured;
              return (
                <div key={provider.key} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-primary,#0A2647)] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {provider.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${st.color}`}>{st.label}</span>
                          {provider.is_free_tier && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">Free Tier</span>
                          )}
                          {provider.last_tested_at && (
                            <span className="text-xs text-gray-400">
                              Last tested {new Date(provider.last_tested_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Key Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <div className="flex gap-2">
                      <input
                        type={showKeys[provider.key] ? "text" : "password"}
                        value={apiKeyInputs[provider.key] || ""}
                        onChange={(e) => handleApiKeyChange(provider.key, e.target.value)}
                        placeholder={
                          provider.credentials
                            ? "Key saved (enter new to replace)"
                            : "Enter API key..."
                        }
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C9A227)]/50 focus:border-[var(--color-accent,#C9A227)]"
                      />
                      <button
                        onClick={() => toggleKeyVisibility(provider.key)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                      >
                        {showKeys[provider.key] ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Error message */}
                  {provider.last_error_message && (
                    <p className="text-xs text-red-500 mb-3">{provider.last_error_message}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {apiKeyInputs[provider.key] && (
                      <button
                        onClick={() => handleSaveKey(provider)}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-primary,#0A2647)] text-white hover:opacity-90 transition-colors"
                      >
                        Save Key
                      </button>
                    )}
                    <button
                      onClick={() => testConnection(provider)}
                      disabled={!provider.credentials || testing[provider.key]}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        testing[provider.key]
                          ? "bg-gray-200 text-gray-500 cursor-wait"
                          : provider.credentials
                          ? "bg-[var(--color-primary,#0A2647)] text-white hover:opacity-90"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {testing[provider.key] ? "Testing..." : "Test Connection"}
                    </button>
                    {provider.credentials && (
                      <button
                        onClick={() => handleDisconnect(provider)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>

                  {/* Docs link */}
                  {provider.docs_url && (
                    <a
                      href={provider.docs_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-3 text-xs text-[var(--color-accent,#C9A227)] hover:underline"
                    >
                      View {provider.name} docs →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Agents Section - placeholder for future agent toggles */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-primary,#0A2647)] mb-4">AI Agents Management</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 text-center text-gray-500">
            <p>Agent management will be available once AI provider integrations are configured and connected.</p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchProviders}
          className="px-6 py-2.5 bg-[var(--color-accent,#C9A227)] text-[var(--color-primary,#0A2647)] rounded-lg text-sm font-semibold hover:opacity-90"
        >
          Refresh Settings
        </button>
      </div>
    </AdminLayout>
  );
}
