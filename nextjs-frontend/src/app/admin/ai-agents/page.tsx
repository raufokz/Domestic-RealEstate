"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface AgentConfig {
  id: number;
  config_key: string;
  name: string;
  description: string | null;
  model: string;
  endpoint: string | null;
  is_active: boolean;
  custom_prompt: string | null;
  temperature: number;
  max_tokens: number;
  total_calls: number;
  total_tokens: number;
  avg_response_ms: number;
  last_tested_at: string | null;
  last_test_result: string | null;
}

interface AgentStats {
  total_agents: number;
  active_agents: number;
  total_calls: number;
  total_tokens: number;
  avg_response_ms: number;
  agents: { key: string; name: string; is_active: boolean; total_calls: number; avg_response_ms: number }[];
}

interface TestLog {
  id: number;
  agent_key: string;
  test_message: string;
  response: string;
  provider: string;
  elapsed_ms: number;
  tokens: number;
  status: string;
  created_at: string;
}

const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gpt-4o",
  "gpt-4o-mini",
];

export default function AIAgentsPage() {
  const { success, notifyError } = useToast();
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<{ key: string; result: Record<string, unknown> } | null>(null);
  const [logsKey, setLogsKey] = useState<string | null>(null);
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [localAgents, setLocalAgents] = useState<Record<string, Partial<AgentConfig>>>({});

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<AgentConfig[]>("/admin/ai-agents");
      setAgents(data);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiGet<AgentStats>("/admin/ai-agents/stats");
      setStats(data);
    } catch (e) {
      // Show no stats rather than stale or zeroed numbers presented as real.
      setStats(null);
      console.error("Could not load AI agent stats:", e);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, [fetchAgents, fetchStats]);

  function getLocal(agent: AgentConfig) {
    return localAgents[agent.config_key] || {};
  }

  function setLocal(agent: AgentConfig, patch: Partial<AgentConfig>) {
    setLocalAgents((prev) => ({
      ...prev,
      [agent.config_key]: { ...(prev[agent.config_key] || {}), ...patch },
    }));
  }

  async function handleToggle(agent: AgentConfig) {
    const newActive = !agent.is_active;
    try {
      await apiPut(`/admin/ai-agents/${agent.config_key}`, { is_active: newActive });
      setAgents((prev) => prev.map((a) => a.config_key === agent.config_key ? { ...a, is_active: newActive } : a));
      success(`${agent.name || agent.config_key} ${newActive ? "enabled" : "disabled"}.`);
      fetchStats();
    } catch (e) {
      // Do not flip the toggle locally when the server rejected the change.
      notifyError(e, "Could not change this agent's status. Please try again.");
    }
  }

  async function handleUpdate(agent: AgentConfig) {
    const patch = getLocal(agent);
    if (!patch.model && !patch.temperature && patch.custom_prompt === undefined) return;
    try {
      await apiPut(`/admin/ai-agents/${agent.config_key}`, patch);
      setAgents((prev) => prev.map((a) => a.config_key === agent.config_key ? { ...a, ...patch } : a));
      setLocalAgents((prev) => {
        const rest = { ...prev };
        delete rest[agent.config_key];
        return rest;
      });
      success("Agent settings saved.");
    } catch (e) {
      // Keep the unsaved edits in place so they are not lost.
      notifyError(e, "Could not save agent settings. Your changes are still here — please try again.");
    }
  }

  async function handleTest(agent: AgentConfig) {
    setTestingKey(agent.config_key);
    setTestResult(null);
    try {
      const result = await apiPost<Record<string, unknown>>(`/admin/ai-agents/${agent.config_key}/test`, {
        message: testInput || "What can you help me with?",
      });
      setTestResult({ key: agent.config_key, result });
      fetchAgents();
      fetchStats();
    } catch (e) {
      notifyError(e, "The agent test could not be completed. Check the AI provider configuration and try again.");
    } finally {
      setTestingKey(null);
    }
  }

  async function openLogs(agent: AgentConfig) {
    setLogsKey(agent.config_key);
    setLogsLoading(true);
    setLogs([]);
    setLogsError("");
    try {
      const data = await apiGet<{ data: TestLog[] }>(`/admin/ai-agents/${agent.config_key}/logs`);
      setLogs(data.data || []);
    } catch (e) {
      setLogsError(e instanceof Error ? e.message : "Could not load logs for this agent.");
    } finally {
      setLogsLoading(false);
    }
  }

  return (
    <AdminLayout title="AI Agents">
      <div className="space-y-6">
        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#C9A227]">
              <p className="text-sm text-gray-500">Total Agents</p>
              <p className="text-2xl font-bold text-[#0A2647]">{stats.total_agents}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Active Agents</p>
              <p className="text-2xl font-bold text-green-600">{stats.active_agents}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Total API Calls</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_calls.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Avg Response</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avg_response_ms} ms</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading agents...</span>
          </div>
        )}

        {!loading && agents.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI agents found</h3>
            <p className="text-gray-500 text-sm">Refresh the page to seed default agents.</p>
          </div>
        )}

        {/* Agent Cards */}
        {!loading && agents.length > 0 && (
          <div className="grid gap-6">
            {agents.map((agent) => {
              const local = getLocal(agent);
              return (
                <div key={agent.config_key} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${agent.is_active ? "bg-[#C9A227]/10 text-[#C9A227]" : "bg-gray-100 text-gray-400"}`}>
                        🤖
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0A2647]">{agent.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{agent.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">{agent.config_key}</span>
                      <button
                        onClick={() => handleToggle(agent)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${agent.is_active ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${agent.is_active ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Model */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
                        <select
                          value={local.model ?? agent.model}
                          onChange={(e) => setLocal(agent, { model: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                        >
                          {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>

                      {/* Temperature */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Temperature: {local.temperature ?? agent.temperature}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={local.temperature ?? agent.temperature}
                          onChange={(e) => setLocal(agent, { temperature: parseFloat(e.target.value) })}
                          className="w-full accent-[#C9A227]"
                        />
                      </div>

                      {/* Max Tokens */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Max Tokens</label>
                        <input
                          type="number"
                          value={local.max_tokens ?? agent.max_tokens}
                          onChange={(e) => setLocal(agent, { max_tokens: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                        />
                      </div>

                      {/* Stats */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Stats</label>
                        <div className="flex gap-3 text-xs">
                          <span className="text-blue-600">{agent.total_calls} calls</span>
                          <span className="text-purple-600">{agent.avg_response_ms}ms avg</span>
                          <span className="text-green-600">{agent.total_tokens} tokens</span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Custom Prompt</label>
                      <textarea
                        value={local.custom_prompt ?? agent.custom_prompt ?? ""}
                        onChange={(e) => setLocal(agent, { custom_prompt: e.target.value || null })}
                        placeholder="Override default agent prompt..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none"
                      />
                    </div>

                    {/* Save / Test / Logs */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        {(local.model || local.temperature !== undefined || local.custom_prompt !== undefined || local.max_tokens) && (
                          <button
                            onClick={() => handleUpdate(agent)}
                            className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
                          >
                            Save
                          </button>
                        )}
                        <button
                          onClick={() => openLogs(agent)}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Logs
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {testResult?.key === agent.config_key && (
                          <span className="text-xs text-green-600">Test completed</span>
                        )}
                        <button
                          onClick={() => handleTest(agent)}
                          disabled={testingKey === agent.config_key}
                          className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0d3555] transition disabled:opacity-50"
                        >
                          {testingKey === agent.config_key ? "Testing..." : "Test"}
                        </button>
                      </div>
                    </div>

                    {/* Test Input and Result */}
                    {testResult?.key === agent.config_key && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Test Message</label>
                          <input
                            type="text"
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            placeholder="Enter test message..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                          />
                        </div>
                        {testResult.result && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <pre className="text-xs whitespace-pre-wrap text-gray-700 max-h-40 overflow-y-auto">
                              {JSON.stringify(testResult.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Last Test */}
                    {agent.last_test_result && testResult?.key !== agent.config_key && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Last tested: {agent.last_tested_at ? new Date(agent.last_tested_at).toLocaleString() : "Never"}
                        </p>
                        <pre className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                          {JSON.stringify(JSON.parse(agent.last_test_result), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Logs Modal */}
        {logsKey && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0A2647]">Test Logs: {logsKey}</h3>
                <button onClick={() => setLogsKey(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-5 overflow-y-auto flex-1">
                {logsLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A227]" />
                    <span className="ml-2 text-sm text-gray-500">Loading logs...</span>
                  </div>
                )}
                {!logsLoading && logsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700 text-sm">{logsError}</p>
                    <button
                      onClick={() => logsKey && openLogs({ config_key: logsKey } as AgentConfig)}
                      className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!logsLoading && !logsError && logs.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-10">No test logs yet.</p>
                )}
                {!logsLoading && !logsError && logs.length > 0 && (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${log.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {log.status}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          Provider: {log.provider} | {log.elapsed_ms}ms | {log.tokens} tokens
                        </p>
                        <p className="text-sm text-gray-700 font-medium mb-1">Message:</p>
                        <p className="text-xs text-gray-600 mb-2 bg-gray-50 rounded p-2">{log.test_message}</p>
                        <p className="text-sm text-gray-700 font-medium mb-1">Response:</p>
                        <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">{log.response}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
