"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";

interface BlogTag {
  name: string;
  slug: string;
  posts_count: number;
}

export default function BlogTagsPage() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{ data: BlogTag[] }>("/admin/blog-tags");
      setTags(data.data || []);
    } catch (e) {
      // No silent fallback to fake data.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load blog tags. Please check the API connection and try again."
      );
      setTags([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = tags.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Blog Tags">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            Tags are assigned to individual{" "}
            <Link href="/admin/blog" className="font-semibold underline hover:text-blue-900">
              blog posts
            </Link>
            . This page shows every tag currently in use across your posts, with real post counts.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="flex-1 w-full sm:max-w-md px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
          />
          <button onClick={fetchData} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading tags...</span>
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

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? "No matching tags" : "No tags in use yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {search ? "Try a different search term." : "Add tags to your blog posts and they will appear here."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tag Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Posts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((tag) => (
                    <tr key={tag.slug} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-[#C9A227]/10 text-[#0A2647] text-sm rounded-full font-medium">🏷️ {tag.name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{tag.slug}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#0A2647]">{tag.posts_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
