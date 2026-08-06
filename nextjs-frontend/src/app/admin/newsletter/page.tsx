"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  status: string;
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

interface PaginatedResponse {
  data: Subscriber[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  unsubscribed: "bg-gray-100 text-gray-800",
  bounced: "bg-red-100 text-red-800",
};

const statusCounts: Record<string, number> = {};

export default function NewsletterPage() {
  const { success, notifyError } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase());
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));

      const res = await apiGet<PaginatedResponse>(
        `/admin/newsletter-subscribers?${params.toString()}`
      );
      setSubscribers(res.data);
      setTotalPages(res.last_page);
      setTotal(res.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load subscribers";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  useEffect(() => {
    void (async () => {
      await fetchSubscribers();
    })();
  }, [fetchSubscribers]);

  const [prevFilters, setPrevFilters] = useState({ statusFilter, debouncedSearch });
  if (prevFilters.statusFilter !== statusFilter || prevFilters.debouncedSearch !== debouncedSearch) {
    setPrevFilters({ statusFilter, debouncedSearch });
    setPage(1);
  }

  const handleRemove = async (id: number) => {
    setRemoving(id);
    try {
      await apiDelete(`/admin/newsletter-subscribers/${id}`);
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "unsubscribed", unsubscribed_at: new Date().toISOString() } : s
        )
      );
      success("Subscriber removed.", "Email");
    } catch (err) {
      notifyError(err, "Newsletter is not working because the subscriber could not be removed.");
    } finally {
      setRemoving(null);
    }
  };

  const statusButtons = ["All", "Active", "Unsubscribed", "Bounced"];

  return (
    <AdminLayout title="Newsletter Subscribers">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {statusButtons.map((s) => {
            const key = s.toLowerCase();
            const count = s === "All" ? total : subscribers.filter((sub) => sub.status === key).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-[var(--color-primary,#0A2647)] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, name, source..."
              className="w-64 px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C9A227)]/50 focus:border-[var(--color-accent,#C9A227)]"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-[var(--color-accent,#C9A227)] text-[var(--color-primary,#0A2647)] rounded-lg text-sm font-semibold hover:opacity-90">
            Send Campaign
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/6" />
                <div className="h-4 bg-gray-200 rounded w-1/6" />
                <div className="h-4 bg-gray-200 rounded w-1/6" />
                <div className="h-4 bg-gray-200 rounded w-1/6" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button onClick={fetchSubscribers} className="px-4 py-2 bg-[var(--color-primary,#0A2647)] text-white rounded-lg text-sm hover:opacity-90">
              Retry
            </button>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No subscribers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-primary,#0A2647)] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Subscribed Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">{sub.email}</td>
                    <td className="px-4 py-3 text-gray-600">{sub.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full ${statusColors[sub.status] || "bg-gray-100 text-gray-800"}`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{sub.source || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {sub.status !== "unsubscribed" && (
                        <button
                          onClick={() => handleRemove(sub.id)}
                          disabled={removing === sub.id}
                          className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          {removing === sub.id ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
