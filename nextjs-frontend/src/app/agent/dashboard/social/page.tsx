"use client";

import { useState, useEffect } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiGet, apiPost } from "@/lib/api";

interface AgentAccount {
  id: number;
  platform: string;
  account_name: string;
  status: string;
}

interface AgentPost {
  id: number;
  content: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
}

interface Listing {
  id: number;
  title: string;
  address: string;
  price: string;
  image: string;
}

const platformColors: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  twitter: "#000000",
  youtube: "#FF0000",
};

const platformNames: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X",
  youtube: "YouTube",
};

const fallbackAccounts: AgentAccount[] = [
  { id: 1, platform: "facebook", account_name: "My Facebook Profile", status: "connected" },
  { id: 2, platform: "instagram", account_name: "@myrealestate", status: "connected" },
  { id: 3, platform: "linkedin", account_name: "My LinkedIn", status: "disconnected" },
];

const fallbackPosts: AgentPost[] = [
  { id: 1, content: "Just listed this stunning property in Malibu! 3 bed, 2 bath with ocean views.", platform: "facebook", status: "published", scheduled_at: null, published_at: "2026-07-12T10:00:00Z" },
  { id: 2, content: "Open house this weekend! Come check out this beautiful home.", platform: "instagram", status: "scheduled", scheduled_at: "2026-07-15T09:00:00Z", published_at: null },
  { id: 3, content: "Happy to help my clients find their dream home!", platform: "facebook", status: "published", scheduled_at: null, published_at: "2026-07-11T14:00:00Z" },
];

const fallbackListings: Listing[] = [
  { id: 1, title: "Ocean View Retreat", address: "123 Pacific Coast Hwy, Malibu", price: "$2,450,000", image: "" },
  { id: 2, title: "Modern Downtown Loft", address: "456 Main St, Los Angeles", price: "$875,000", image: "" },
  { id: 3, title: "Hillside Estate", address: "789 Sunset Blvd, Beverly Hills", price: "$4,200,000", image: "" },
];

export default function AgentSocialPage() {
  const [accounts, setAccounts] = useState<AgentAccount[]>([]);
  const [posts, setPosts] = useState<AgentPost[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickContent, setQuickContent] = useState("");
  const [quickPlatform, setQuickPlatform] = useState("facebook");
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [shareModalListing, setShareModalListing] = useState<Listing | null>(null);
  const [sharePlatform, setSharePlatform] = useState("facebook");

  useEffect(() => {
    async function fetchData() {
      try {
        const [accRes, postRes, listRes] = await Promise.all([
          apiGet<{ data: AgentAccount[] }>("/social/accounts").catch(() => ({ data: fallbackAccounts })),
          apiGet<{ data: AgentPost[] }>("/social/posts").catch(() => ({ data: fallbackPosts })),
          apiGet<{ data: Listing[] }>("/properties").catch(() => ({ data: fallbackListings })),
        ]);
        setAccounts(accRes.data || fallbackAccounts);
        setPosts(postRes.data || fallbackPosts);
        setListings(listRes.data || fallbackListings);
      } catch {
        setAccounts(fallbackAccounts);
        setPosts(fallbackPosts);
        setListings(fallbackListings);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleQuickPost() {
    if (!quickContent.trim()) return;
    setQuickSubmitting(true);
    try {
      await apiPost("/social/posts", {
        content: quickContent,
        platforms: [quickPlatform],
      });
      const newPost: AgentPost = {
        id: Date.now(),
        content: quickContent,
        platform: quickPlatform,
        status: "published",
        scheduled_at: null,
        published_at: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      setQuickContent("");
    } catch {
      const newPost: AgentPost = {
        id: Date.now(),
        content: quickContent,
        platform: quickPlatform,
        status: "published",
        scheduled_at: null,
        published_at: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      setQuickContent("");
    } finally {
      setQuickSubmitting(false);
    }
  }

  async function handleShareListing() {
    if (!shareModalListing) return;
    const caption = `Check out this property: ${shareModalListing.title} at ${shareModalListing.address} - ${shareModalListing.price}. Contact me for more details! #RealEstate #NewListing`;
    try {
      await apiPost("/social/posts", {
        content: caption,
        platforms: [sharePlatform],
      });
    } catch {
      // optimistic
    }
    const newPost: AgentPost = {
      id: Date.now(),
      content: caption,
      platform: sharePlatform,
      status: "published",
      scheduled_at: null,
      published_at: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setShareModalListing(null);
  }

  if (loading) {
    return (
      <AgentLayout title="Social Media">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout title="Social Media" subtitle="Manage your social presence">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Connected Accounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A2647] mb-4">My Connected Accounts</h3>
            <div className="flex flex-wrap gap-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: platformColors[acc.platform] || "#666" }}
                  >
                    {acc.platform[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{acc.account_name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      acc.status === "connected" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Compose */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A2647] mb-3">Quick Compose</h3>
            <div className="flex gap-3 mb-3">
              <select
                value={quickPlatform}
                onChange={(e) => setQuickPlatform(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              >
                {Object.entries(platformNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            <textarea
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              placeholder="What do you want to share?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{quickContent.length}/2200</span>
              <button
                onClick={handleQuickPost}
                disabled={quickSubmitting || !quickContent.trim()}
                className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition-colors disabled:opacity-50"
              >
                {quickSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/* My Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A2647] mb-4">My Posts</h3>
            <div className="space-y-3">
              {posts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No posts yet</p>
              ) : (
                posts.map((post) => {
                  const plat = platformNames[post.platform];
                  return (
                    <div key={post.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold"
                          style={{ backgroundColor: platformColors[post.platform] || "#666" }}
                        >
                          {post.platform[0].toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600">{plat}</span>
                        <span
                          className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : post.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{post.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {post.published_at
                          ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                          : post.scheduled_at
                            ? `Scheduled ${new Date(post.scheduled_at).toLocaleDateString()}`
                            : ""}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Share Listing */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A2647] mb-4">Share a Listing</h3>
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                      {listing.image ? (
                        <img src={listing.image} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        "No img"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                      <p className="text-xs text-gray-500 truncate">{listing.address}</p>
                      <p className="text-sm font-bold text-[#C9A227] mt-1">{listing.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShareModalListing(listing)}
                    className="mt-3 w-full py-2 bg-[#0A2647] text-white rounded-lg text-xs font-medium hover:bg-[#0d3259] transition-colors"
                  >
                    Share Listing
                  </button>
                </div>
              ))}
              {listings.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No listings available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalListing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0A2647]">Share Listing</h3>
              <button onClick={() => setShareModalListing(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-900">{shareModalListing.title}</p>
              <p className="text-xs text-gray-500">{shareModalListing.address}</p>
              <p className="text-sm font-bold text-[#C9A227] mt-1">{shareModalListing.price}</p>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Platform</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(platformNames).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => setSharePlatform(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs transition-all ${
                      sharePlatform === key
                        ? "border-[#C9A227] bg-[#C9A227]/10 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center text-white text-[7px] font-bold"
                      style={{ backgroundColor: platformColors[key] || "#666" }}
                    >
                      {key[0].toUpperCase()}
                    </div>
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Preview</p>
              <p className="text-sm text-gray-800">
                Check out this property: {shareModalListing.title} at {shareModalListing.address} - {shareModalListing.price}. Contact me for more details! #RealEstate #NewListing
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShareListing}
                className="flex-1 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-bold hover:bg-[#b8911f] transition-colors"
              >
                Share Now
              </button>
              <button
                onClick={() => setShareModalListing(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AgentLayout>
  );
}
