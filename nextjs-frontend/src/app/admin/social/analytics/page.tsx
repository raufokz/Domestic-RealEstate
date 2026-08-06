"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/lib/api";

interface EngagementStats {
  total_likes: string | number | null;
  total_comments: string | number | null;
  total_shares: string | number | null;
}

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

interface RawAccountAnalytics {
  account: {
    id: number;
    platform: string;
    account_name: string;
  };
  total_posts: number;
  successful_posts: number;
  engagement?: EngagementStats;
}

export default function SocialAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AccountAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    void fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await apiGet<RawAccountAnalytics[]>("/social/analytics");
      const list = (Array.isArray(res) ? res : []).map((raw) => ({
        id: raw.account.id,
        platform: raw.account.platform,
        account_name: raw.account.account_name,
        total_posts: raw.total_posts || 0,
        successful_posts: raw.successful_posts || 0,
        failed_posts: Math.max((raw.total_posts || 0) - (raw.successful_posts || 0), 0),
        likes: Number(raw.engagement?.total_likes || 0),
        comments: Number(raw.engagement?.total_comments || 0),
        shares: Number(raw.engagement?.total_shares || 0),
      }));
      setAnalytics(list);
    } catch {
      setAnalytics([]);
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
        <div>
          <label className="block text-xs text-gray-500 mb-1">Platform</label>
          <select
            value={selectedPlatform || "all"}
            onChange={(e) => setSelectedPlatform(e.target.value === "all" ? null : e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
          >
            <option value="all">All Platforms</option>
            {analytics.map((a) => (
              <option key={a.platform} value={a.platform}>{platformNames[a.platform] || a.platform}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { void fetchAnalytics(); }}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
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
        {filtered.map((acc) => (
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
                <p className="text-xs text-gray-500">{platformNames[acc.platform] || acc.platform}</p>
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
                <p className="text-lg font-bold text-[#C9A227]">{acc.shares.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">Shares</p>
              </div>
            </div>
            {acc.total_posts > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 h-3">
                  <div
                    className="bg-green-400 rounded-l"
                    style={{ width: `${(acc.successful_posts / acc.total_posts) * 100}%` }}
                  />
                  <div
                    className="bg-red-400 rounded-r"
                    style={{ width: `${(acc.failed_posts / acc.total_posts) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-green-600">Success ({acc.successful_posts})</span>
                  <span className="text-[10px] text-red-600">Failed ({acc.failed_posts})</span>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 col-span-full">No connected accounts with analytics yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}
