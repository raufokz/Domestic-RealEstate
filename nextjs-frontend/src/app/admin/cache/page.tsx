"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface CacheKey {
  key: string;
  type: string;
  size: string;
  ttl: number;
  last_accessed?: string;
}

interface CacheStats {
  total_keys: number;
  memory_usage: string;
  hit_rate: string;
}

export default function CacheManagementPage() {
  const { success, notifyError } = useToast();
  const [keys, setKeys] = useState<CacheKey[]>([]);
  const [stats, setStats] = useState<CacheStats>({ total_keys: 0, memory_usage: "0 MB", hit_rate: "0%" });
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [selectedKey, setSelectedKey] = useState<CacheKey | null>(null);
  const [keyValue, setKeyValue] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await apiGet<{ keys: CacheKey[]; stats: CacheStats }>("/admin/cache");
      setKeys(data.keys || []);
      setStats(data.stats || { total_keys: 0, memory_usage: "0 MB", hit_rate: "0%" });
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }

  async function clearAll() {
    if (!confirm("Clear all cache? This may affect performance.")) return;
    setClearing(true);
    try {
      await apiPost("/admin/cache/clear", { type: "all" });
      setKeys([]);
      setStats({ total_keys: 0, memory_usage: "0 MB", hit_rate: "0%" });
      success("All cache cleared.");
    } catch (e) {
      // Do not empty the list locally when the server did not clear the cache.
      notifyError(e, "Could not clear the cache. Please try again.");
    } finally {
      setClearing(false);
    }
  }

  async function clearExpired() {
    setClearing(true);
    try {
      await apiPost("/admin/cache/clear", { type: "expired" });
      setKeys((prev) => prev.filter((k) => k.ttl > 0 || k.ttl === -1));
      success("Expired cache entries cleared.");
    } catch (e) {
      // Do not prune the list locally when the server did not clear anything.
      notifyError(e, "Could not clear the cache. Please try again.");
    }
    finally { setClearing(false); }
  }

  async function warmCache() {
    setClearing(true);
    try {
      await apiPost("/admin/cache/warm");
      await fetchData();
      success("Cache warmed.");
    } catch (e) {
      notifyError(e, "Could not warm the cache. Please try again.");
    }
    finally { setClearing(false); }
  }

  async function viewKey(key: CacheKey) {
    setSelectedKey(key);
    setViewLoading(true);
    try {
      const data = await apiGet<{ value: string }>(`/admin/cache/${encodeURIComponent(key.key)}`);
      setKeyValue(data.value || "{}");
    } catch (e) {
      // Show the real reason instead of a fabricated preview of the value.
      setKeyValue("");
      notifyError(e, "Could not read this cache key.");
    } finally {
      setViewLoading(false);
    }
  }

  async function deleteKey(keyName: string) {
    try {
      await apiDelete(`/admin/cache/${encodeURIComponent(keyName)}`);
      setKeys((prev) => prev.filter((k) => k.key !== keyName));
      setStats((prev) => ({ ...prev, total_keys: prev.total_keys - 1 }));
      success("Cache key deleted.");
    } catch (e) {
      // Keep the key listed when the server refused the delete.
      notifyError(e, "Could not delete this cache key. Please try again.");
    }
  }

  const filtered = searchQuery
    ? keys.filter((k) => k.key.toLowerCase().includes(searchQuery.toLowerCase()))
    : keys;

  return (
    <AdminLayout title="Cache Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Keys", value: stats.total_keys, icon: "🔑", bg: "bg-[#0A2647] text-white" },
            { label: "Memory Usage", value: stats.memory_usage, icon: "💾", bg: "bg-white border border-gray-200" },
            { label: "Hit Rate", value: stats.hit_rate, icon: "🎯", bg: "bg-white border border-gray-200" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-5 ${stat.bg}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className={`text-2xl font-bold ${stat.bg.includes("text-white") ? "text-white" : "text-[#0A2647]"}`}>{stat.value}</p>
                  <p className={`text-sm ${stat.bg.includes("text-white") ? "text-white/80" : "text-gray-500"}`}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={clearAll} disabled={clearing} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
            🗑️ Clear All Cache
          </button>
          <button onClick={clearExpired} disabled={clearing} className="px-4 py-2 bg-[#8B1E3F] text-white rounded-lg text-sm font-semibold hover:bg-[#a0244a] transition disabled:opacity-50">
            🧹 Clear Expired
          </button>
          <button onClick={warmCache} disabled={clearing} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            🔥 Warm Cache
          </button>
          <div className="ml-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keys..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none w-64"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading cache...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No cache keys</h3>
            <p className="text-gray-500 text-sm">Cache is empty or no keys match your search.</p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Key</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">TTL</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Accessed</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((ck) => (
                    <tr key={ck.key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-800 max-w-xs truncate">{ck.key}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{ck.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ck.size}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ck.ttl === -1 ? (
                          <span className="text-[#C9A227] font-medium">No expiry</span>
                        ) : (
                          `${ck.ttl}s`
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {ck.last_accessed ? new Date(ck.last_accessed).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => viewKey(ck)} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">View</button>
                          <button onClick={() => deleteKey(ck.key)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Modal */}
        {selectedKey && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Cache Value</h3>
                  <button onClick={() => { setSelectedKey(null); setKeyValue(""); }} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <p className="text-sm font-mono text-gray-500 mt-1">{selectedKey.key}</p>
              </div>
              <div className="p-6">
                {viewLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A227]" />
                  </div>
                ) : (
                  <pre className="bg-slate-50 rounded-lg p-4 text-sm font-mono text-gray-700 overflow-x-auto max-h-80">
                    {keyValue}
                  </pre>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button onClick={() => { setSelectedKey(null); setKeyValue(""); }} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
