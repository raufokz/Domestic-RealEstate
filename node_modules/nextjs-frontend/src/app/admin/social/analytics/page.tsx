"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/lib/api";

interface AccountAnalytics {
  id: number;
  platform: string;
  account_name: string;
  total_posts: number;
  successful_posts: number;
  failed_posts: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
  posts: PostPerformance[];
}

interface PostPerformance {
  id: number;
  content: string;
  published_at: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
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

const fallbackAnalytics: AccountAnalytics[] = [
  {
    id: 1, platform: "facebook", account_name: "Domestic RE Facebook",
    total_posts: 45, successful_posts: 42, failed_posts: 3,
    likes: 1250, comments: 320, shares: 180, engagement_rate: 4.8,
    posts: [
      { id: 101, content: "New luxury listing in Beverly Hills", published_at: "2026-07-12T10:00:00Z", likes: 156, comments: 42, shares: 28, impressions: 3200 },
      { id: 102, content: "Open house this Sunday", published_at: "2026-07-10T08:00:00Z", likes: 89, comments: 23, shares: 15, impressions: 2100 },
      { id: 103, content: "Client testimonial video", published_at: "2026-07-08T14:00:00Z", likes: 234, comments: 67, shares: 45, impressions: 5400 },
    ],
  },
  {
    id: 2, platform: "instagram", account_name: "@domesticre",
    total_posts: 38, successful_posts: 36, failed_posts: 2,
    likes: 2100, comments: 450, shares: 320, engagement_rate: 6.2,
    posts: [
      { id: 201, content: "Beautiful modern home showcase", published_at: "2026-07-12T12:00:00Z", likes: 342, comments: 78, shares: 56, impressions: 6800 },
      { id: 202, content: "Interior design tips", published_at: "2026-07-09T16:00:00Z", likes: 189, comments: 34, shares: 22, impressions: 4200 },
    ],
  },
  {
    id: 3, platform: "linkedin", account_name: "Domestic RE LinkedIn",
    total_posts: 22, successful_posts: 21, failed_posts: 1,
    likes: 560, comments: 120, shares: 90, engagement_rate: 3.5,
    posts: [
      { id: 301, content: "Market report Q2 2026", published_at: "2026-07-11T09:00:00Z", likes: 78, comments: 23, shares: 15, impressions: 2800 },
    ],
  },
  {
    id: 4, platform: "twitter", account_name: "@domesticre",
    total_posts: 52, successful_posts: 48, failed_posts: 4,
    likes: 890, comments: 210, shares: 450, engagement_rate: 2.9,
    posts: [
      { id: 401, content: "Just sold: 456 Oak Avenue", published_at: "2026-07-12T08:00:00Z", likes: 67, comments: 12, shares: 34, impressions: 1900 },
    ],
  },
];

export default function SocialAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AccountAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("2026-07-01");
  const [dateTo, setDateTo] = useState("2026-07-13");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await apiGet<{ data: AccountAnalytics[] }>("/social/analytics");
      setAnalytics(res.data || fallbackAnalytics);
    } catch {
      setAnalytics(fallbackAnalytics);
    } finally {
      setLoading(false);
    }
  }

  const totalPosts = analytics.reduce((s, a) => s + a.total_posts, 0);
  const totalSuccessful = analytics.reduce((s, a) => s + a.successful_posts, 0);
  const totalLikes = analytics.reduce((s, a) => s + a.likes, 0);
  const totalComments = analytics.reduce((s, a) => s + a.comments, 0);
  const totalShares = analytics.reduce((s, a) => s + a.shares, 0);

  const filtered = selectedPlatform
    ? analytics.filter((a) => a.platform === selectedPlatform)
    : analytics;

  const allPosts = filtered.flatMap((a) =>
    a.posts.map((p) => ({ ...p, platform: a.platform, account_name: a.account_name }))
  ).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  if (loading) {
    return (
      <AdminLayout title="Social Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Social Analytics">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Platform</label>
          <select
            value={selectedPlatform || "all"}
            onChange={(e) => setSelectedPlatform(e.target.value === "all" ? null : e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
          >
            <option value="all">All Platforms</option>
            {analytics.map((a) => (
              <option key={a.platform} value={a.platform}>{platformNames[a.platform]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Posts</p>
          <p className="text-2xl font-bold text-[#0A2647]">{totalPosts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Successful</p>
          <p className="text-2xl font-bold text-green-600">{totalSuccessful}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Likes</p>
          <p className="text-2xl font-bold text-[#8B1E3F]">{totalLikes.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Comments</p>
          <p className="text-2xl font-bold text-[#C9A227]">{totalComments.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Shares</p>
          <p className="text-2xl font-bold text-blue-600">{totalShares.toLocaleString()}</p>
        </div>
      </div>

      {/* Per-Account Cards */}
      <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Account Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {analytics.map((acc) => (
          <div
            key={acc.id}
            className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all ${
              selectedPlatform === acc.platform ? "border-[#C9A227]" : "border-gray-100 hover:border-gray-200"
            }`}
            onClick={() => setSelectedPlatform(selectedPlatform === acc.platform ? null : acc.platform)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: platformColors[acc.platform] || "#666" }}
              >
                {acc.platform[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{acc.account_name}</p>
                <p className="text-xs text-gray-500">{platformNames[acc.platform]}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-[#0A2647]">{acc.total_posts}</p>
                <p className="text-[10px] text-gray-500">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{acc.successful_posts}</p>
                <p className="text-[10px] text-gray-500">Successful</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#8B1E3F]">{acc.likes.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">Likes</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#C9A227]">{acc.engagement_rate}%</p>
                <p className="text-[10px] text-gray-500">Engagement</p>
              </div>
            </div>
            {/* Simple bar chart */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 h-3">
                {acc.total_posts > 0 && (
                  <>
                    <div
                      className="bg-green-400 rounded-l"
                      style={{ width: `${(acc.successful_posts / acc.total_posts) * 100}%` }}
                    />
                    <div
                      className="bg-red-400 rounded-r"
                      style={{ width: `${(acc.failed_posts / acc.total_posts) * 100}%` }}
                    />
                  </>
                )}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-green-600">Success</span>
                <span className="text-[10px] text-red-600">Failed</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Performance Table */}
      <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Post Performance</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Post</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Platform</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Published</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Likes</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Comments</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Shares</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Impressions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allPosts.map((post) => (
              <tr key={`${post.id}-${post.platform}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{post.content}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: platformColors[post.platform] || "#666" }}
                    >
                      {post.platform[0].toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600">{platformNames[post.platform]}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(post.published_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-700">{post.likes.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-700">{post.comments.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-700">{post.shares.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-700">{post.impressions.toLocaleString()}</td>
              </tr>
            ))}
            {allPosts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No posts found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
