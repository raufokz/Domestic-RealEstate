"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/lib/api";

interface SocialAccount {
  id: number;
  platform: string;
  account_name: string;
  status: string;
}

interface SocialPost {
  id: number;
  content: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  target_accounts?: number[];
}

const platforms = [
  { key: "facebook", name: "Facebook", icon: "f", color: "#1877F2" },
  { key: "instagram", name: "Instagram", icon: "Ig", color: "#E4405F" },
  { key: "linkedin", name: "LinkedIn", icon: "in", color: "#0A66C2" },
  { key: "x", name: "X", icon: "X", color: "#000000" },
  { key: "tiktok", name: "TikTok", icon: "Tk", color: "#000000" },
  { key: "youtube", name: "YouTube", icon: "Yt", color: "#FF0000" },
  { key: "pinterest", name: "Pinterest", icon: "P", color: "#BD081C" },
  { key: "google_business", name: "Google Business", icon: "G", color: "#4285F4" },
];

const subPages = [
  { name: "Accounts", href: "/admin/social/accounts", icon: "🔗" },
  { name: "Composer", href: "/admin/social/composer", icon: "✏️" },
  { name: "Calendar", href: "/admin/social/calendar", icon: "📅" },
  { name: "Templates", href: "/admin/social/templates", icon: "📋" },
  { name: "Queue", href: "/admin/social/queue", icon: "📬" },
  { name: "Analytics", href: "/admin/social/analytics", icon: "📊" },
];

export default function SocialOverviewPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [accRes, postRes] = await Promise.all([
          apiGet<SocialAccount[]>("/social/accounts").catch(() => []),
          apiGet<{ data: SocialPost[] }>("/social/posts").catch(() => ({ data: [] })),
        ]);
        setAccounts(Array.isArray(accRes) ? accRes : []);
        setPosts(postRes.data || []);
      } catch {
        setAccounts([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const connectedCount = accounts.filter((a) => a.status === "connected").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const failedCount = posts.filter((p) => p.status === "failed").length;

  const getPlatformStatus = (key: string) => {
    const acc = accounts.find((a) => a.platform === key);
    return acc?.status || "disconnected";
  };

  const statusBadge = (status: string) => {
    if (status === "connected") return "bg-green-100 text-green-800";
    if (status === "error") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-600";
  };

  const getPostPlatform = (post: SocialPost) => {
    const firstAccountId = post.target_accounts?.[0];
    const platform = accounts.find((a) => a.id === firstAccountId)?.platform;
    return platform || null;
  };

  const postStatusBadge = (status: string) => {
    if (status === "published") return "bg-green-100 text-green-800";
    if (status === "scheduled") return "bg-blue-100 text-blue-800";
    if (status === "failed") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <AdminLayout title="Social CRM">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Social CRM">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Connected Accounts</p>
          <p className="text-3xl font-bold text-[#0A2647]">{connectedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Scheduled Posts</p>
          <p className="text-3xl font-bold text-blue-600">{scheduledCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Published Posts</p>
          <p className="text-3xl font-bold text-green-600">{publishedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Failed Posts</p>
          <p className="text-3xl font-bold text-red-600">{failedCount}</p>
        </div>
      </div>

      {/* Sub-page Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {subPages.map((page) => (
          <Link
            key={page.name}
            href={page.href}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-[#C9A227] hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl block mb-2">{page.icon}</span>
            <span className="text-sm font-medium text-[#0A2647]">{page.name}</span>
          </Link>
        ))}
      </div>

      {/* Platform Cards */}
      <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Platforms</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {platforms.map((p) => {
          const status = getPlatformStatus(p.key);
          return (
            <div key={p.key} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: p.color }}
                >
                  {p.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-0.5 ${statusBadge(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Posts */}
      <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Recent Posts</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {posts.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No posts yet</p>
          ) : (
            posts.map((post) => {
              const plat = platforms.find((p) => p.key === getPostPlatform(post));
              return (
                <div key={post.id} className="p-4 flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: plat?.color || "#666" }}
                  >
                    {plat?.icon || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {plat?.name}
                      {post.published_at
                        ? ` · Published ${new Date(post.published_at).toLocaleDateString()}`
                        : post.scheduled_at
                          ? ` · Scheduled ${new Date(post.scheduled_at).toLocaleDateString()}`
                          : ""}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full flex-shrink-0 ${postStatusBadge(post.status)}`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
