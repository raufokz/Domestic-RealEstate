"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface Integration {
  id: number;
  integration_key: string;
  name: string;
  description: string;
  category: string;
  status: "not_connected" | "connected" | "error";
  logo_url?: string;
  docs_url?: string;
  last_tested_at?: string;
}

const CATEGORIES = ["All", "Social", "Email", "AI", "Maps", "Calendar", "Storage", "Analytics", "E-Sign", "Automation"];

const statusConfig: Record<string, { label: string; color: string }> = {
  not_connected: { label: "Not Connected", color: "bg-gray-100 text-gray-700" },
  connected: { label: "Connected", color: "bg-green-100 text-green-800" },
  error: { label: "Error", color: "bg-red-100 text-red-800" },
};

const categoryColors: Record<string, string> = {
  Social: "bg-blue-100 text-blue-800",
  Email: "bg-purple-100 text-purple-800",
  AI: "bg-red-100 text-red-800",
  Maps: "bg-yellow-100 text-yellow-800",
  Calendar: "bg-teal-100 text-teal-800",
  Storage: "bg-orange-100 text-orange-800",
  Analytics: "bg-indigo-100 text-indigo-800",
  "E-Sign": "bg-pink-100 text-pink-800",
  Automation: "bg-cyan-100 text-cyan-800",
};

const categoryIcons: Record<string, string> = {
  Social: "🌐",
  Email: "✉️",
  AI: "🤖",
  Maps: "🗺️",
  Calendar: "📅",
  Storage: "📁",
  Analytics: "📊",
  "E-Sign": "📝",
  Automation: "⚡",
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  async function fetchIntegrations() {
    try {
      setLoading(true);
      setError("");
      // Backend returns a bare array (matches ai-settings & api-keys pages).
      const data = await apiGet<Integration[]>("/admin/integrations");
      setIntegrations(Array.isArray(data) ? data : []);
    } catch (e) {
      // No silent fallback to fake data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load integrations. Please check the API connection and try again."
      );
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    try {
      setSeeding(true);
      setError("");
      // Seed route is GET on the backend (same as the API Keys page).
      await apiGet("/admin/integrations/seed");
      await fetchIntegrations();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not seed integrations. Please try again."
      );
    } finally {
      setSeeding(false);
    }
  }

  const filtered = integrations.filter((i) => {
    const matchCategory = activeCategory === "All" || i.category === activeCategory;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categoryCounts = integrations.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <AdminLayout title="Integrations">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Total Integrations</p>
            <p className="text-2xl font-bold text-[#0A2647]">{integrations.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Connected</p>
            <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Errors</p>
            <p className="text-2xl font-bold text-red-600">{integrations.filter((i) => i.status === "error").length}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search integrations..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
              />
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2.5 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3366] transition disabled:opacity-50"
            >
              {seeding ? "Seeding..." : "Seed Integrations"}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-[#C9A227] text-[#0A2647]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {cat !== "All" && <span className="mr-1.5">{categoryIcons[cat]}</span>}
                {cat} {cat === "All" ? `(${integrations.length})` : `(${categoryCounts[cat] || 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading integrations...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchIntegrations} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
          </div>
        )}

        {/* Integration Grid */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-16 text-center">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No integrations found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {search ? "Try a different search term" : "No integrations in this category yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((integration) => (
                  <div key={integration.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#0A2647] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {integration.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[integration.category]}`}>
                              {integration.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`inline-block px-2.5 py-1 text-xs rounded-full ${statusConfig[integration.status].color}`}>
                        {statusConfig[integration.status].label}
                      </span>

                      <p className="text-sm text-gray-600 mt-3 mb-4 line-clamp-2">{integration.description}</p>

                      <div className="flex gap-2">
                        <Link
                          href={`/admin/integrations/${integration.integration_key}`}
                          className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            integration.status === "connected"
                              ? "border border-gray-300 hover:bg-gray-50"
                              : "bg-[#C9A227] text-[#0A2647] hover:bg-[#b8911f]"
                          }`}
                        >
                          {integration.status === "connected" ? "Configure" : "Setup"}
                        </Link>
                        {integration.docs_url && (
                          <a
                            href={integration.docs_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Docs
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
