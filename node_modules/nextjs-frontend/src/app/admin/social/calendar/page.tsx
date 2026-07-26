"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/lib/api";

interface CalendarPost {
  id: number;
  content: string;
  platform: string;
  status: string;
  scheduled_at: string;
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

const fallbackPosts: CalendarPost[] = [
  { id: 1, content: "New luxury listing - Beverly Hills", platform: "facebook", status: "scheduled", scheduled_at: "2026-07-14T09:00:00Z" },
  { id: 2, content: "Beautiful modern home showcase", platform: "instagram", status: "scheduled", scheduled_at: "2026-07-14T12:00:00Z" },
  { id: 3, content: "Market report Q2 2026", platform: "linkedin", status: "published", scheduled_at: "2026-07-10T08:00:00Z" },
  { id: 4, content: "Open house Sunday 2-5pm", platform: "facebook", status: "scheduled", scheduled_at: "2026-07-16T08:00:00Z" },
  { id: 5, content: "Property tour video", platform: "youtube", status: "scheduled", scheduled_at: "2026-07-18T14:00:00Z" },
  { id: 6, content: "Luxury interior design tips", platform: "pinterest", status: "scheduled", scheduled_at: "2026-07-20T10:00:00Z" },
  { id: 7, content: "Client testimonial video", platform: "tiktok", status: "scheduled", scheduled_at: "2026-07-22T16:00:00Z" },
  { id: 8, content: "Google Business listing update", platform: "google_business", status: "scheduled", scheduled_at: "2026-07-15T09:00:00Z" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SocialCalendarPage() {
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekView, setWeekView] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await apiGet<{ data: CalendarPost[] }>("/social/posts");
        setPosts(res.data || fallbackPosts);
      } catch {
        setPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function getPostsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return posts.filter((p) => p.scheduled_at.startsWith(dateStr));
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  function goToToday() {
    setCurrentDate(new Date(2026, 6, 1));
    setSelectedDate(null);
  }

  const selectedDayPosts = selectedDate
    ? posts.filter((p) => p.scheduled_at.startsWith(selectedDate))
    : [];

  if (loading) {
    return (
      <AdminLayout title="Content Calendar">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Content Calendar">
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700">
        <h3 className="font-semibold text-sm text-[#0A2647] flex items-center gap-2 mb-2">
          <span>💡</span> Social Content Calendar Tips
        </h3>
        <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
          <li><strong>Date Selection:</strong> Click any day in the month or week view to inspect scheduled posts.</li>
          <li><strong>Platform Color Codes:</strong> Posts are color-coded by social network (Facebook, Instagram, LinkedIn, X, TikTok, YouTube).</li>
          <li><strong>Scheduling:</strong> Auto-publish listing tours, open house announcements, and property market updates.</li>
        </ul>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-[#0A2647] min-w-[200px] text-center">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={goToToday} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Today
          </button>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setWeekView(false)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              !weekView ? "bg-white text-[#0A2647] shadow-sm" : "text-gray-600"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setWeekView(true)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              weekView ? "bg-white text-[#0A2647] shadow-sm" : "text-gray-600"
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {DAYS.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-gray-100 bg-gray-50/50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayPosts = getPostsForDay(day);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === "2026-07-13";
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-[#C9A227]/5 ring-2 ring-inset ring-[#C9A227]" : ""
                  }`}
                >
                  <span
                    className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full ${
                      isToday ? "bg-[#0A2647] text-white" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="text-[10px] px-1.5 py-0.5 rounded text-white truncate"
                        style={{ backgroundColor: platformColors[post.platform] || "#666" }}
                        title={post.content}
                      >
                        {platformNames[post.platform]?.slice(0, 3) || "?"}
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="text-[10px] text-gray-500">+{dayPosts.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Selected Day */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#0A2647] mb-4">
            {selectedDate
              ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : "Select a date"}
          </h3>
          {!selectedDate ? (
            <p className="text-sm text-gray-500">Click on a date to view scheduled posts</p>
          ) : selectedDayPosts.length === 0 ? (
            <p className="text-sm text-gray-500">No posts scheduled for this date</p>
          ) : (
            <div className="space-y-3">
              {selectedDayPosts.map((post) => (
                <div key={post.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: platformColors[post.platform] || "#666" }}
                    >
                      {post.platform[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {platformNames[post.platform] || post.platform}
                    </span>
                    <span
                      className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
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
                  <p className="text-xs text-gray-600 line-clamp-2">{post.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(post.scheduled_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Platforms</p>
            <div className="space-y-1.5">
              {Object.entries(platformColors).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-600">{platformNames[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
