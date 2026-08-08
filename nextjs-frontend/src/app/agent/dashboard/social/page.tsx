"use client";

import { useState, useEffect } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiGet, apiPost } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Account { id: number; platform: string; account_name: string; status: string }
interface Post { id: number; content: string; platform: string; status: string; scheduled_at: string | null; published_at: string | null }
interface Listing { id: number; title: string; address: string; price: string; image: string }

const PLATFORM_COLORS: Record<string, { bg: string; name: string; icon: string }> = {
  facebook: { bg: "#1877F2", name: "Facebook", icon: "f" },
  instagram: { bg: "#E4405F", name: "Instagram", icon: "📷" },
  linkedin: { bg: "#0A66C2", name: "LinkedIn", icon: "in" },
  twitter: { bg: "#000000", name: "X / Twitter", icon: "𝕏" },
  youtube: { bg: "#FF0000", name: "YouTube", icon: "▶" },
  tiktok: { bg: "#010101", name: "TikTok", icon: "♪" },
  pinterest: { bg: "#E60023", name: "Pinterest", icon: "P" },
  google_business: { bg: "#4285F4", name: "Google Business", icon: "G" },
};

const POST_TEMPLATES = [
  { id: 1, category: "listing", title: "New Listing Announcement", content: "🏠 Just listed! Beautiful [bedrooms]bd/[bathrooms]ba home at [address]. Asking [price]. Contact me for a private showing! #JustListed #RealEstate #NewListing" },
  { id: 2, category: "listing", title: "Open House Invitation", content: "🔑 OPEN HOUSE this weekend! Come visit [address] on Saturday from 1-4 PM. [bedrooms] bedrooms, [bathrooms] baths, priced at [price]. See you there! #OpenHouse" },
  { id: 3, category: "market_report", title: "Market Update", content: "📊 Market Update: The [city] real estate market is showing strong activity this quarter. Average home prices are up [X]% YoY. Contact me if you're thinking of buying or selling! #MarketUpdate" },
  { id: 4, category: "tip", title: "Home Buying Tip", content: "💡 Home Buying Tip: Always get a pre-approval before house hunting. It shows sellers you're a serious buyer and strengthens your offer. DM me for recommended lenders! #HomeBuyingTips" },
  { id: 5, category: "testimonial", title: "Client Testimonial", content: "⭐ \"[Agent Name] made our home buying experience seamless. From the first showing to closing, they were professional and attentive.\" - Happy Client #ClientReview #RealEstate" },
  { id: 6, category: "general", title: "Community Spotlight", content: "🌟 Neighborhood Spotlight: [Area Name] is one of the most sought-after areas with great schools, parks, and restaurants. Let me show you what's available! #CommunitySpotlight" },
];

const BRAND_HASHTAGS = ["#RealEstate", "#HomeForSale", "#DreamHome", "#LuxuryRealEstate", "#Realtor", "#JustListed", "#HouseHunting", "#PropertyForSale"];

const FALLBACK_ACCOUNTS: Account[] = [
  { id: 1, platform: "facebook", account_name: "My Facebook Profile", status: "connected" },
  { id: 2, platform: "instagram", account_name: "@myrealestate", status: "connected" },
  { id: 3, platform: "linkedin", account_name: "My LinkedIn", status: "disconnected" },
  { id: 4, platform: "youtube", account_name: "My RE Channel", status: "connected" },
];

const FALLBACK_POSTS: Post[] = [
  { id: 1, content: "🏠 Just listed! Stunning 3bd/2ba in Malibu with ocean views. $2.4M. DM for details!", platform: "facebook", status: "published", scheduled_at: null, published_at: "2026-08-06T10:00:00Z" },
  { id: 2, content: "Open house this Saturday at 789 Sunset Blvd! Come see this beauty.", platform: "instagram", status: "scheduled", scheduled_at: "2026-08-10T09:00:00Z", published_at: null },
  { id: 3, content: "Market update: Beverly Hills Q3 prices up 8% YoY. Great time to invest!", platform: "linkedin", status: "published", scheduled_at: null, published_at: "2026-08-05T14:00:00Z" },
  { id: 4, content: "Happy to help the Johnson family close on their dream home today! 🎉🔑", platform: "facebook", status: "published", scheduled_at: null, published_at: "2026-08-04T16:00:00Z" },
  { id: 5, content: "💡 Tip: Stage your home before listing — staged homes sell 73% faster!", platform: "instagram", status: "draft", scheduled_at: null, published_at: null },
];

const DEMO_ANALYTICS = [
  { platform: "facebook", posts: 24, reach: 12500, engagement: 890, followers: 2340 },
  { platform: "instagram", posts: 18, reach: 8900, engagement: 1230, followers: 1850 },
  { platform: "linkedin", posts: 12, reach: 4200, engagement: 340, followers: 890 },
  { platform: "youtube", posts: 6, reach: 15000, engagement: 2100, followers: 560 },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  return grid;
}

export default function AgentSocialPage() {
  const [activeTab, setActiveTab] = useState<"compose" | "posts" | "calendar" | "templates" | "analytics" | "brand">("compose");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose
  const [quickContent, setQuickContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  // Calendar
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Templates
  const [templateFilter, setTemplateFilter] = useState("all");

  // Share Listing Modal
  const [shareModalListing, setShareModalListing] = useState<Listing | null>(null);
  const [sharePlatform, setSharePlatform] = useState("facebook");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [accR, postR, listR] = await Promise.all([
          apiGet<{ data: Account[] }>("/social/accounts").catch(() => ({ data: FALLBACK_ACCOUNTS })),
          apiGet<{ data: Post[] }>("/social/posts").catch(() => ({ data: FALLBACK_POSTS })),
          apiGet<{ data: Listing[] }>("/properties").catch(() => ({ data: [] as Listing[] })),
        ]);
        setAccounts(accR.data || FALLBACK_ACCOUNTS);
        setPosts(postR.data || FALLBACK_POSTS);
        setListings(listR.data || []);
      } catch {
        setAccounts(FALLBACK_ACCOUNTS);
        setPosts(FALLBACK_POSTS);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const togglePlatform = (p: string) => setSelectedPlatforms((prev) =>
    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
  );

  async function handlePost() {
    if (!quickContent.trim() || selectedPlatforms.length === 0) return;
    setQuickSubmitting(true);
    try {
      await apiPost("/social/posts", {
        content: quickContent,
        target_accounts: selectedPlatforms,
        scheduled_at: scheduleDate || null,
      });
    } catch { /* optimistic */ }
    const newPost: Post = {
      id: Date.now(),
      content: quickContent,
      platform: selectedPlatforms[0],
      status: scheduleDate ? "scheduled" : "published",
      scheduled_at: scheduleDate || null,
      published_at: scheduleDate ? null : new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setQuickContent("");
    setScheduleDate("");
    setQuickSubmitting(false);
  }

  function useTemplate(tmpl: typeof POST_TEMPLATES[0]) {
    setQuickContent(tmpl.content);
    setActiveTab("compose");
  }

  async function handleShareListing() {
    if (!shareModalListing) return;
    const caption = `🏠 Check out this property: ${shareModalListing.title} at ${shareModalListing.address} — ${shareModalListing.price}. Contact me for details! #RealEstate #NewListing`;
    try { await apiPost("/social/posts", { content: caption, target_accounts: [sharePlatform] }); } catch { /* optimistic */ }
    setPosts((prev) => [{ id: Date.now(), content: caption, platform: sharePlatform, status: "published", scheduled_at: null, published_at: new Date().toISOString() }, ...prev]);
    setShareModalListing(null);
  }

  const calDays = generateCalendarDays(calYear, calMonth);
  const scheduledByDay: Record<number, Post[]> = {};
  posts.filter((p) => p.scheduled_at).forEach((p) => {
    const d = new Date(p.scheduled_at!);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const day = d.getDate();
      if (!scheduledByDay[day]) scheduledByDay[day] = [];
      scheduledByDay[day].push(p);
    }
  });

  const filteredTemplates = templateFilter === "all" ? POST_TEMPLATES : POST_TEMPLATES.filter((t) => t.category === templateFilter);

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
    <AgentLayout title="Social Media" subtitle="Create, schedule, and analyze your social content">
      <div className="space-y-6">
        {/* Connected Accounts Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#0A2647]">Connected Accounts</h3>
            <button className="text-xs text-[#C9A227] font-bold hover:underline">+ Connect New</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {accounts.map((acc) => {
              const p = PLATFORM_COLORS[acc.platform] || { bg: "#666", name: acc.platform, icon: "?" };
              return (
                <div key={acc.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: p.bg }}>{p.icon}</div>
                  <span className="text-xs text-slate-700 font-medium">{acc.account_name}</span>
                  <span className={`w-2 h-2 rounded-full ${acc.status === "connected" ? "bg-emerald-500" : "bg-slate-300"}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1 overflow-x-auto">
          {([
            { id: "compose", label: "✍️ Compose" },
            { id: "posts", label: "📝 My Posts" },
            { id: "calendar", label: "📅 Calendar" },
            { id: "templates", label: "📋 Templates" },
            { id: "analytics", label: "📊 Analytics" },
            { id: "brand", label: "🎨 Brand Kit" },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${activeTab === tab.id ? "bg-[#0A2647] text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">

          {/* ── COMPOSE ── */}
          {activeTab === "compose" && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-[#0A2647]">Create New Post</h3>

              {/* Platform Selection */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">Post to:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PLATFORM_COLORS).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => togglePlatform(key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                        selectedPlatforms.includes(key) ? "border-[#C9A227] bg-[#C9A227]/10" : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: val.bg }}>{val.icon}</div>
                      {val.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <textarea
                  value={quickContent}
                  onChange={(e) => setQuickContent(e.target.value)}
                  rows={5}
                  placeholder="What do you want to share? Use templates for quick drafts..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">{quickContent.length}/2200</span>
                  <button onClick={() => setActiveTab("templates")} className="text-xs text-[#C9A227] font-bold hover:underline">📋 Use Template</button>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Schedule (Optional)</label>
                  <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                </div>
                <button
                  onClick={handlePost}
                  disabled={quickSubmitting || !quickContent.trim() || selectedPlatforms.length === 0}
                  className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-xl text-sm font-bold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  {quickSubmitting ? "Posting..." : scheduleDate ? "Schedule Post" : "Post Now"}
                </button>
              </div>

              {/* Share Listing Section */}
              {listings.length > 0 && (
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-sm font-bold text-[#0A2647] mb-3">📣 Share a Listing</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {listings.slice(0, 5).map((l) => (
                      <button key={l.id} onClick={() => setShareModalListing(l)} className="min-w-[180px] bg-slate-50 rounded-lg border border-slate-100 p-3 text-left hover:shadow-md transition">
                        <p className="text-xs font-bold text-[#0A2647] truncate">{l.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{l.address}</p>
                        <p className="text-xs font-bold text-[#C9A227] mt-1">{l.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MY POSTS ── */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0A2647]">My Posts</h3>
              <div className="space-y-3">
                {posts.map((post) => {
                  const p = PLATFORM_COLORS[post.platform] || { bg: "#666", name: post.platform, icon: "?" };
                  return (
                    <div key={post.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: p.bg }}>{p.icon}</div>
                        <span className="text-xs text-slate-600 font-medium">{p.name}</span>
                        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          post.status === "published" ? "bg-emerald-100 text-emerald-700" :
                          post.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{post.status}</span>
                      </div>
                      <p className="text-sm text-slate-800">{post.content}</p>
                      <p className="text-[10px] text-slate-400 mt-2">
                        {post.published_at ? `Published ${new Date(post.published_at).toLocaleDateString()}` :
                         post.scheduled_at ? `Scheduled ${new Date(post.scheduled_at).toLocaleDateString()}` : "Draft"}
                      </p>
                    </div>
                  );
                })}
                {posts.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No posts yet</p>}
              </div>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {activeTab === "calendar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0A2647]">Content Calendar</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); } else setCalMonth(calMonth - 1); }} className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold hover:bg-slate-200">←</button>
                  <span className="text-sm font-bold text-[#0A2647] min-w-[120px] text-center">
                    {new Date(calYear, calMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button onClick={() => { if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); } else setCalMonth(calMonth + 1); }} className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold hover:bg-slate-200">→</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-2">{d}</div>
                ))}
                {calDays.map((day, i) => (
                  <div
                    key={i}
                    className={`min-h-[72px] rounded-lg p-1.5 text-xs border ${
                      day ? "bg-white border-slate-100 hover:border-[#C9A227] transition cursor-pointer" : "border-transparent"
                    } ${day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear() ? "ring-2 ring-[#C9A227]" : ""}`}
                  >
                    {day && (
                      <>
                        <span className="text-[10px] font-bold text-slate-600">{day}</span>
                        {scheduledByDay[day]?.map((p, idx) => (
                          <div key={idx} className="mt-0.5 px-1 py-0.5 rounded text-[8px] font-bold text-white truncate" style={{ backgroundColor: PLATFORM_COLORS[p.platform]?.bg || "#666" }}>
                            {p.content.slice(0, 20)}...
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TEMPLATES ── */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0A2647]">Content Templates</h3>
                <div className="flex gap-1">
                  {["all", "listing", "market_report", "tip", "testimonial", "general"].map((f) => (
                    <button key={f} onClick={() => setTemplateFilter(f)} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${templateFilter === f ? "bg-[#0A2647] text-white" : "bg-slate-100 text-slate-600"}`}>
                      {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTemplates.map((tmpl) => (
                  <div key={tmpl.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-[#0A2647]">{tmpl.title}</h4>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-500 capitalize">{tmpl.category.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{tmpl.content}</p>
                    <button onClick={() => useTemplate(tmpl)} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-bold hover:bg-[#b8911f] transition">
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#0A2647]">Social Media Analytics</h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-600 font-medium">Total Posts</p>
                  <p className="text-2xl font-black text-[#0A2647]">{DEMO_ANALYTICS.reduce((s, a) => s + a.posts, 0)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-emerald-600 font-medium">Total Reach</p>
                  <p className="text-2xl font-black text-[#0A2647]">{(DEMO_ANALYTICS.reduce((s, a) => s + a.reach, 0) / 1000).toFixed(1)}K</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-purple-600 font-medium">Engagement</p>
                  <p className="text-2xl font-black text-[#0A2647]">{DEMO_ANALYTICS.reduce((s, a) => s + a.engagement, 0).toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-amber-600 font-medium">Followers</p>
                  <p className="text-2xl font-black text-[#0A2647]">{DEMO_ANALYTICS.reduce((s, a) => s + a.followers, 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DEMO_ANALYTICS.map((stat) => {
                  const p = PLATFORM_COLORS[stat.platform] || { bg: "#666", name: stat.platform, icon: "?" };
                  return (
                    <div key={stat.platform} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: p.bg }}>{p.icon}</div>
                        <div>
                          <p className="text-sm font-bold text-[#0A2647]">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{stat.followers.toLocaleString()} followers</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400">Posts</p>
                          <p className="text-sm font-bold text-[#0A2647]">{stat.posts}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400">Reach</p>
                          <p className="text-sm font-bold text-[#0A2647]">{(stat.reach / 1000).toFixed(1)}K</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400">Engaged</p>
                          <p className="text-sm font-bold text-[#0A2647]">{stat.engagement}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── BRAND KIT ── */}
          {activeTab === "brand" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#0A2647]">Brand Kit</h3>
              <p className="text-xs text-slate-500">Maintain consistent branding across all your social content.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-xl p-5">
                  <p className="text-sm font-bold text-[#0A2647] mb-3">Brand Hashtags</p>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_HASHTAGS.map((tag) => (
                      <span key={tag} className="px-3 py-1.5 bg-[#0A2647]/5 text-[#0A2647] rounded-full text-xs font-bold">{tag}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3">Click a hashtag to copy, or add your own custom tags.</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-5">
                  <p className="text-sm font-bold text-[#0A2647] mb-3">Brand Colors</p>
                  <div className="flex gap-3">
                    {[
                      { label: "Primary", color: "#0A2647" },
                      { label: "Accent", color: "#C9A227" },
                      { label: "Background", color: "#F8FAFC" },
                    ].map((c) => (
                      <div key={c.label} className="text-center">
                        <div className="w-12 h-12 rounded-xl border-2 border-slate-200" style={{ backgroundColor: c.color }} />
                        <p className="text-[10px] text-slate-500 mt-1">{c.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{c.color}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 border border-slate-200 rounded-xl p-5">
                  <p className="text-sm font-bold text-[#0A2647] mb-3">Content Guidelines</p>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2"><span className="text-[#C9A227] font-bold">•</span>Always include a clear call-to-action (CTA)</li>
                    <li className="flex items-start gap-2"><span className="text-[#C9A227] font-bold">•</span>Use high-quality property images (minimum 1080x1080px)</li>
                    <li className="flex items-start gap-2"><span className="text-[#C9A227] font-bold">•</span>Include 3-5 relevant hashtags per post</li>
                    <li className="flex items-start gap-2"><span className="text-[#C9A227] font-bold">•</span>Post consistently: aim for 3-5 times per week</li>
                    <li className="flex items-start gap-2"><span className="text-[#C9A227] font-bold">•</span>Respond to comments within 2 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Listing Modal */}
      {shareModalListing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0A2647]">Share Listing</h3>
              <button onClick={() => setShareModalListing(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold text-[#0A2647]">{shareModalListing.title}</p>
              <p className="text-xs text-slate-500">{shareModalListing.address}</p>
              <p className="text-sm font-bold text-[#C9A227] mt-1">{shareModalListing.price}</p>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-2">Platform</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PLATFORM_COLORS).map(([key, val]) => (
                  <button key={key} onClick={() => setSharePlatform(key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs transition ${sharePlatform === key ? "border-[#C9A227] bg-[#C9A227]/10 font-medium" : "border-slate-200 text-slate-600"}`}>
                    <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[7px] font-bold" style={{ backgroundColor: val.bg }}>{val.icon}</div>
                    {val.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleShareListing} className="flex-1 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-bold hover:bg-[#b8911f] transition">
                Share Now
              </button>
              <button onClick={() => setShareModalListing(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AgentLayout>
  );
}
