"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

interface SocialAccountLite {
  id: number;
  platform: string;
  account_name: string;
}

interface QueuePost {
  id: number;
  content: string;
  platforms: string[];
  scheduled_at: string | null;
  status: string;
}

const platformColors: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  x: "#000000",
  tiktok: "#1a1a1a",
  youtube: "#FF0000",
  pinterest: "#BD081C",
  google_business: "#4285F4",
};

const platformNames: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  google_business: "Google Business",
};

const QUEUE_STATUSES = ["draft", "scheduled", "publishing"];
const FAILED_STATUSES = ["failed", "partially_failed"];

export default function SocialQueuePage() {
  const [posts, setPosts] = useState<QueuePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "failed" | "published">("pending");

  useEffect(() => {
    void fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const [postRes, accountRes] = await Promise.all([
        apiGet<{ data: QueuePost[] }>("/social/posts"),
        apiGet<SocialAccountLite[]>("/social/accounts"),
      ]);
      const accounts = Array.isArray(accountRes) ? accountRes : [];
      const map = new Map(accounts.map((a) => [a.id, a.platform]));
      const list = (postRes.data || []).map((p: QueuePost & { target_accounts?: number[] }) => ({
        ...p,
        platforms: (p.target_accounts || []).map((id) => map.get(id)).filter(Boolean) as string[],
      }));
      setPosts(list);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(id: number) {
    try {
      await apiPost(`/social/posts/${id}/retry`);
      await fetchPosts();
    } catch {
      // no-op
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiDelete(`/social/posts/${id}`);
      await fetchPosts();
    } catch {
      // no-op
    }
  }

  const pendingPosts = posts.filter((p) => QUEUE_STATUSES.includes(p.status));
  const failedPosts = posts.filter((p) => FAILED_STATUSES.includes(p.status));
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
                      {post.platforms.length === 0 && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.scheduled_at ? (
                      <>
                        <div>{new Date(post.scheduled_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(post.scheduled_at).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">As soon as possible</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800"
                          : FAILED_STATUSES.includes(post.status)
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {post.status.replace("_", " ").charAt(0).toUpperCase() + post.status.replace("_", " ").slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {FAILED_STATUSES.includes(post.status) && (
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
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
