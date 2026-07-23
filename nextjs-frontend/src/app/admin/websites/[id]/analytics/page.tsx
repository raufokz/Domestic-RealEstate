"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface Totals {
  pages: number;
  published_pages: number;
  domains: number;
  verified_domains: number;
}

interface TopPage {
  title: string;
  slug: string;
  is_published: boolean;
}

interface AnalyticsData {
  website: { id: number; name: string; status: string; deployed_at: string | null };
  totals: Totals;
  traffic_available: boolean;
  top_pages: TopPage[];
  referrers: { source: string; visits: number; percentage: number }[];
}

export default function WebsiteAnalyticsPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<{ data: AnalyticsData }>(`/admin/websites/${id}/analytics`);
      setData(res.data);
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load analytics. Please check the API connection and try again."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Website Analytics">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/websites" className="hover:text-[#0A2647]">Websites</Link>
          <span>/</span>
          <Link href={`/admin/websites/${id}`} className="hover:text-[#0A2647]">Website {id}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Analytics</span>
        </div>

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-24" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchData} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Real structural stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Pages", value: data.totals.pages, icon: "📄", color: "bg-[#0A2647] text-white" },
                { label: "Published Pages", value: data.totals.published_pages, icon: "✅", color: "bg-white border border-gray-200" },
                { label: "Domains", value: data.totals.domains, icon: "🌐", color: "bg-white border border-gray-200" },
                { label: "Verified Domains", value: data.totals.verified_domains, icon: "🔒", color: "bg-[#C9A227]/10 border border-[#C9A227]/30" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-5 ${s.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-xl font-bold truncate ${s.color.includes("text-white") ? "text-white" : "text-[#0A2647]"}`}>{s.value}</p>
                      <p className={`text-xs ${s.color.includes("text-white") ? "text-white/80" : "text-gray-500"}`}>{s.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Honest traffic state — no fabricated numbers */}
            {!data.traffic_available && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Traffic analytics not connected</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
                  Visits, page views, and referrer data aren&apos;t being tracked for this website yet.
                  Add a Google Analytics ID to start collecting real traffic data.
                </p>
                <Link
                  href={`/admin/websites/${id}/settings`}
                  className="inline-block px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
                >
                  Configure Analytics
                </Link>
              </div>
            )}

            {/* Real pages list */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#0A2647]">Pages</h3>
              </div>
              {data.top_pages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Slug</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.top_pages.map((page) => (
                        <tr key={page.slug} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-800">{page.title}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">/{page.slug}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${page.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                              {page.is_published ? "Published" : "Draft"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">This website has no pages yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
