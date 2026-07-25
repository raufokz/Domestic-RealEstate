"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";

interface QueuePost {
  id: number;
  content: string;
  platforms: string[];
  scheduled_at: string;
  status: string;
  error_message?: string;
}

const platformColors: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  twitter: "#000000",
  tiktok: "#1a1a1a",
  youtube: "#FF0000",
  pinterest: "#BD081C",
  google_business: "#4285F4",
};

const platformNames: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  google_business: "Google Business",
};

const fallbackPosts: QueuePost[] = [
  { id: 1, content: "New luxury listing in Beverly Hills - 5 bed, 4 bath stunning property with panoramic views", platforms: ["facebook", "instagram"], scheduled_at: "2026-07-14T09:00:00Z", status: "pending" },
  { id: 2, content: "Market report: Q2 2026 shows strong growth in luxury segment across Southern California", platforms: ["linkedin", "twitter"], scheduled_at: "2026-07-14T12:00:00Z", status: "pending" },
  { id: 3, content: "Open house this Sunday 2-5pm! Don't miss this stunning property at 123 Main St", platforms: ["facebook"], scheduled_at: "2026-07-15T08:00:00Z", status: "pending" },
  { id: 4, content: "Failed to connect to Twitter API - rate limit exceeded. Please retry later.", platforms: ["twitter"], scheduled_at: "2026-07-13T08:00:00Z", status: "failed", error_message: "API Error 429: Rate limit exceeded for account @domesticre. Retry after 15 minutes." },
  { id: 5, content: "Instagram authentication token expired. Please reconnect the account.", platforms: ["instagram"], scheduled_at: "2026-07-13T06:00:00Z", status: "failed", error_message: "OAuth token expired. Please reconnect Instagram account in Social Accounts settings." },
  { id: 6, content: "Check out this beautiful modern home with panoramic views - just sold!", platforms: ["facebook", "instagram", "linkedin"], scheduled_at: "2026-07-12T10:00:00Z", status: "published" },
  { id: 7, content: "Happy client testimonial: 'Domestic RE made our dream home a reality!'", platforms: ["facebook", "twitter"], scheduled_at: "2026-07-11T14:00:00Z", status: "published" },
  { id: 8, content: "Weekly market update: Interest rates remain steady at 6.2% for 30-year fixed", platforms: ["linkedin"], scheduled_at: "2026-07-10T09:00:00Z", status: "published" },
];

export default function SocialQueuePage() {
  const [posts, setPosts] = useState<QueuePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "failed" | "published">("pending");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await apiGet<{ data: QueuePost[] }>("/social/posts/queue");
      setPosts(res.data || fallbackPosts);
    } catch {
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(id: number) {
    try {
      await apiPost(`/social/posts/${id}/retry`);
    } catch {
      // optimistic update
    }
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "pending", error_message: undefined } : p))
    );
  }

  async function handleDelete(id: number) {
    try {
      await apiPost(`/social/posts/${id}`, { _method: "DELETE" });
    } catch {
      // optimistic update
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const pendingPosts = posts.filter((p) => p.status === "pending");
  const failedPosts = posts.filter((p) => p.status === "failed");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const currentPosts = activeTab === "pending" ? pendingPosts : activeTab === "failed" ? failedPosts : publishedPosts;

  const tabs = [
    { key: "pending" as const, label: "Pending", count: pendingPosts.length, color: "text-blue-600" },
    { key: "failed" as const, label: "Failed", count: failedPosts.length, color: "text-red-600" },
    { key: "published" as const, label: "Published", count: publishedPosts.length, color: "text-green-600" },
  ];

  if (loading) {
    return (
      <AdminLayout title="Post Queue">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Post Queue">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-6 max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#0A2647] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs ${tab.color}`}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Content</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Platforms</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Scheduled</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                {activeTab === "failed" && (
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Error</th>
                )}
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {post.platforms.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 text-[10px] rounded text-white font-medium"
                          style={{ backgroundColor: platformColors[p] || "#666" }}
                        >
                          {platformNames[p] || p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{new Date(post.scheduled_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(post.scheduled_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800"
                          : post.status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </td>
                  {activeTab === "failed" && (
                    <td className="px-6 py-4 max-w-xs">
                      {post.error_message && (
                        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                          {post.error_message}
                        </p>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {activeTab === "failed" && (
                        <button
                          onClick={() => handleRetry(post.id)}
                          className="px-3 py-1.5 text-xs bg-[#C9A227] text-[#0A2647] rounded-lg font-medium hover:bg-[#b8911f] transition-colors"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentPosts.length === 0 && (
                <tr>
                  <td colSpan={activeTab === "failed" ? 6 : 5} className="px-6 py-12 text-center text-gray-500 text-sm">
                    {activeTab === "pending" && "No pending posts in the queue."}
                    {activeTab === "failed" && "No failed posts. All clear!"}
                    {activeTab === "published" && "No published posts yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
