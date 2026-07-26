"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import AdminLayout from "@/components/admin/AdminLayout";

const AI_AGENTS = [
  { value: "chat", label: "Chat Assistant" },
  { value: "lead_qualification", label: "Lead Qualification" },
  { value: "property_recommendation", label: "Property Recommendation" },
  { value: "seller_agent", label: "Seller AI" },
  { value: "investor_agent", label: "Investor AI" },
  { value: "email_writer", label: "Email Writer" },
  { value: "listing_description", label: "Listing Description" },
  { value: "seo_agent", label: "SEO Agent" },
  { value: "social_media", label: "Social Media AI" },
];

const EDGE_CASES = [
  { name: "Empty Input", input: "" },
  { name: "Long Input (5000 chars)", input: "A".repeat(5000) },
  { name: "Special Characters", input: "!@#$%^&*()_+-={}[]|\\:;\"'<>?,./~`" },
  { name: "SQL Injection", input: "'; DROP TABLE users; --" },
  { name: "XSS Attempt", input: "<script>alert('xss')</script>" },
  { name: "Unicode Stress", input: "\u4E16\u754C\u4F60\u597D\uD83D\uDE00\uD83D\uDE80\uD83C\uDF0D" },
];

interface CompareResult {
  provider: string;
  response: string;
  response_time: number;
  tokens_used: number;
}

interface AgentTestResult {
  agent: string;
  response: string;
  confidence: number;
  cost: number;
  response_time: number;
}

interface LoadTestResult {
  total_requests: number;
  successful: number;
  failed: number;
  avg_response_time: number;
  max_response_time: number;
  min_response_time: number;
  success_rate: number;
}

interface EdgeCaseResult {
  name: string;
  passed: boolean;
  response: string;
  response_time: number;
  error?: string;
}

export default function AiTestingPage() {
  const { notifyError } = useToast();
  const [comparePrompt, setComparePrompt] = useState("");
  const [compareResults, setCompareResults] = useState<CompareResult[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);

  const [agentForm, setAgentForm] = useState({ agent: "chat", input: "" });
  const [agentResult, setAgentResult] = useState<AgentTestResult | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  const [loadTestCount, setLoadTestCount] = useState(10);
  const [loadResult, setLoadResult] = useState<LoadTestResult | null>(null);
  const [loadLoading, setLoadLoading] = useState(false);

  const [edgeResults, setEdgeResults] = useState<EdgeCaseResult[]>([]);
  const [edgeLoading, setEdgeLoading] = useState(false);

  async function runCompare() {
    setCompareLoading(true);
    setCompareResults([]);
    const start = Date.now();
    try {
      const data = await apiPost<{ response: string; timestamp: string }>("/ai/chat", { message: comparePrompt });
      setCompareResults([{
        provider: "Gemini (via /ai/chat)",
        response: data.response,
        response_time: Date.now() - start,
        tokens_used: 0,
      }]);
    } catch (e) {
      // A testing tool must never hide a failure — that is the result being tested for.
      setCompareResults([]);
      notifyError(e, "The AI comparison request failed. Check the provider keys in Admin → Integrations.");
    } finally {
      setCompareLoading(false);
    }
  }

  async function runAgentTest() {
    setAgentLoading(true);
    setAgentResult(null);
    const start = Date.now();
    try {
      const agent = agentForm.agent;
      const input = agentForm.input;
      let endpoint = "/ai/chat";
      let body: Record<string, string | number> = { message: input };

      if (agent === "lead_qualification") {
        endpoint = "/ai/lead-qualify";
        body = { name: "Test Lead", email: "test@example.com", motivation: input };
      } else if (agent === "listing_description") {
        endpoint = "/ai/property-description";
        body = { title: "Test Property Listing", details: input };
      } else if (agent === "email_writer") {
        endpoint = "/ai/email-writer";
        body = { type: "general", details: input };
      } else if (agent === "seller_agent") {
        endpoint = "/ai/seller-agent";
        body = { address: input || "123 Main St, Miami, FL" };
      } else if (agent === "property_recommendation") {
        endpoint = "/ai/recommend-property";
        body = { budget: 500000, location: input || "Miami, FL", bedrooms: 3 };
      } else if (agent === "investor_agent" || agent === "market_analysis") {
        endpoint = "/ai/investor-agent";
        body = { budget: 500000, strategy: "buy_and_hold", location: input || "Miami, FL" };
      } else if (agent === "seo_agent") {
        endpoint = "/ai/seo-agent";
        body = { url: "https://domesticrealestate.us", content: input || "Real estate listings and neighborhoods" };
      } else if (agent === "social_media") {
        endpoint = "/ai/social-agent";
        body = { platform: "linkedin", topic: input || "Home buying tips" };
      }

      const data = await apiPost<Record<string, unknown>>(endpoint, body);
      const response = (data.response as string) || (data.description as string) || (data.analysis as string) || (data.email as string) || JSON.stringify(data);
      const cost = (data as Record<string, unknown>).cost as number ?? 0;
      const confidence = (data as Record<string, unknown>).score as number ?? 85;
      setAgentResult({
        agent,
        response,
        confidence: typeof confidence === "number" && confidence <= 1 ? confidence : Math.min(confidence / 100, 1),
        cost,
        response_time: Date.now() - start,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setAgentResult({
        agent: agentForm.agent,
        response: `Error: ${msg}`,
        confidence: 0,
        cost: 0,
        response_time: Date.now() - start,
      });
    }
    setAgentLoading(false);
  }

  async function runLoadTest() {
    setLoadLoading(true);
    setLoadResult(null);
    const start = Date.now();
    let successful = 0;
    let failed = 0;
    let maxTime = 0;
    let minTime = Infinity;
    const times: number[] = [];

    const requests = Array.from({ length: loadTestCount }, async () => {
      const reqStart = Date.now();
      try {
        await apiPost<{ response: string }>("/ai/chat", { message: "Load test ping" });
        const elapsed = Date.now() - reqStart;
        times.push(elapsed);
        successful++;
        maxTime = Math.max(maxTime, elapsed);
        minTime = Math.min(minTime, elapsed);
      } catch {
        failed++;
      }
    });

    await Promise.all(requests);
    const totalTime = Date.now() - start;
    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    setLoadResult({
      total_requests: loadTestCount,
      successful,
      failed,
      avg_response_time: avgTime,
      max_response_time: maxTime === Infinity ? 0 : maxTime,
      min_response_time: minTime === Infinity ? 0 : minTime,
      success_rate: loadTestCount > 0 ? Math.round((successful / loadTestCount) * 100) : 0,
    });
    setLoadLoading(false);
  }

  async function runEdgeCases() {
    setEdgeLoading(true);
    setEdgeResults([]);
    const results: EdgeCaseResult[] = [];

    for (const ec of EDGE_CASES) {
      const start = Date.now();
      try {
        const data = await apiPost<{ response: string }>("/ai/chat", { message: ec.input || " " });
        results.push({
          name: ec.name,
          passed: true,
          response: data.response?.substring(0, 100) || "",
          response_time: Date.now() - start,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Request failed";
        results.push({
          name: ec.name,
          passed: false,
          response: "",
          response_time: Date.now() - start,
          error: msg,
        });
      }
      setEdgeResults([...results]);
    }
    setEdgeLoading(false);
  }

  return (
    <AdminLayout title="AI Testing Center">
      <div className="space-y-6">
        {/* Provider Comparison */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-2">Provider Comparison</h3>
          <p className="text-sm text-slate-500 mb-4">Compare responses from Gemini and OpenAI side by side.</p>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Enter a prompt to compare across AI providers..."
              value={comparePrompt}
              onChange={(e) => setComparePrompt(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <button
              onClick={runCompare}
              disabled={compareLoading || !comparePrompt}
              className="px-5 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
            >
              {compareLoading ? "Comparing..." : "Compare"}
            </button>
          </div>
          {compareResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareResults.map((r) => (
                <div key={r.provider} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-[#0A2647]">{r.provider}</h4>
                    <span className="text-xs text-slate-500">{r.response_time}ms</span>
                  </div>
                  <div className="bg-slate-50 rounded p-3 text-sm text-slate-700 max-h-48 overflow-y-auto mb-3">{r.response}</div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{r.tokens_used} tokens</span>
                    <span>{r.response_time}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per-Agent Test */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-2">Per-Agent Test</h3>
          <p className="text-sm text-slate-500 mb-4">Test individual AI agents with custom input.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <select
              value={agentForm.agent}
              onChange={(e) => setAgentForm({ ...agentForm, agent: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            >
              {AI_AGENTS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Test input..."
              value={agentForm.input}
              onChange={(e) => setAgentForm({ ...agentForm, input: e.target.value })}
              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            />
            <button
              onClick={runAgentTest}
              disabled={agentLoading || !agentForm.input}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#8B1E3F] rounded-lg hover:bg-[#6d1832] transition-colors disabled:opacity-50"
            >
              {agentLoading ? "Testing..." : "Run Test"}
            </button>
          </div>
          {agentResult && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Response:</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{agentResult.response}</p>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="text-lg font-bold text-[#0A2647]">{(agentResult.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Cost</p>
                  <p className="text-lg font-bold text-[#C9A227]">${agentResult.cost.toFixed(4)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Response Time</p>
                  <p className="text-lg font-bold text-[#0A2647]">{agentResult.response_time}ms</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Load Test + Edge Cases Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Load Test */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-[#0A2647] mb-2">Load Test</h3>
            <p className="text-sm text-slate-500 mb-4">Test system performance under concurrent requests.</p>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-slate-600">Concurrent Requests:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={loadTestCount}
                onChange={(e) => setLoadTestCount(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
              />
              <button
                onClick={runLoadTest}
                disabled={loadLoading}
                className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
              >
                {loadLoading ? "Running..." : "Run Load Test"}
              </button>
            </div>
            {loadResult && (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xl font-bold text-[#0A2647]">{loadResult.avg_response_time}ms</p>
                  <p className="text-xs text-slate-500">Avg Response</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">{loadResult.success_rate}%</p>
                  <p className="text-xs text-slate-500">Success Rate</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xl font-bold text-[#0A2647]">{loadResult.max_response_time}ms</p>
                  <p className="text-xs text-slate-500">Max Response</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xl font-bold text-[#0A2647]">{loadResult.total_requests}</p>
                  <p className="text-xs text-slate-500">Total Requests</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">{loadResult.successful}</p>
                  <p className="text-xs text-slate-500">Successful</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xl font-bold text-red-600">{loadResult.failed}</p>
                  <p className="text-xs text-slate-500">Failed</p>
                </div>
              </div>
            )}
          </div>

          {/* Edge Case Tests */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-[#0A2647] mb-2">Edge Case Tests</h3>
            <p className="text-sm text-slate-500 mb-4">Test AI with problematic inputs to verify robustness.</p>
            <button
              onClick={runEdgeCases}
              disabled={edgeLoading}
              className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#8B1E3F] text-white rounded-lg hover:bg-[#6d1832] transition-colors disabled:opacity-50 mb-4"
            >
              {edgeLoading ? "Running..." : "Run All Edge Cases"}
            </button>
            <div className="space-y-2">
              {edgeResults.length > 0 ? (
                edgeResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <span className={`w-2 h-2 rounded-full ${r.passed ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-sm font-medium text-[#0A2647] flex-1">{r.name}</span>
                    <span className="text-xs text-slate-500">{r.response_time}ms</span>
                    <span className={`text-xs font-medium ${r.passed ? "text-green-600" : "text-red-600"}`}>
                      {r.passed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                ))
              ) : (
                EDGE_CASES.map((ec, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-sm font-medium text-[#0A2647] flex-1">{ec.name}</span>
                    <span className="text-xs text-slate-400">Not run</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
