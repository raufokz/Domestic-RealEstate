"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet, apiPost, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Logo from "@/components/Logo";

type Severity = "critical" | "warning" | "info" | "success";

interface NotificationItem {
  id: number;
  type: string;
  severity: Severity;
  module: string | null;
  title: string;
  message: string;
  fix: string | null;
  action_url: string | null;
  action_label: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  resolved_at: string | null;
  occurrences: number;
  created_at: string;
}

interface NotificationCounts {
  unread: number;
  open_critical: number;
  open_warning: number;
}

const SEVERITY_STYLES: Record<Severity, { chip: string; bar: string; icon: string; label: string }> = {
  critical: { chip: "bg-red-100 text-red-800 border-red-200", bar: "border-l-red-600", icon: "⛔", label: "Critical" },
  warning: { chip: "bg-amber-100 text-amber-800 border-amber-200", bar: "border-l-amber-500", icon: "⚠", label: "Warning" },
  info: { chip: "bg-slate-100 text-slate-700 border-slate-200", bar: "border-l-[#C9A227]", icon: "ℹ", label: "Info" },
  success: { chip: "bg-emerald-100 text-emerald-800 border-emerald-200", bar: "border-l-emerald-500", icon: "✓", label: "Success" },
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Users", href: "/admin/users", icon: "M12 4.354a4 4 0 110 7.292 4 4 0 010-7.292zM15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { label: "Leads", href: "/admin/leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Properties", href: "/admin/properties", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "Agents", href: "/admin/agents", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { label: "Blog", href: "/admin/blog", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
  { label: "SEO Pages", href: "/admin/seo", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
  { label: "Enquiries", href: "/admin/enquiries", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Settings", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { label: "Integrations", href: "/admin/integrations", icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1H3a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" },
  { label: "AI Blog", href: "/admin/ai-blog", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { label: "Activity Logs", href: "/admin/logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

export default function NotificationsPage() {
  const { success, notifyError } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ unread: 0, open_critical: 0, open_warning: 0 });
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "critical">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet<{ data: NotificationItem[]; counts: NotificationCounts }>(
        "/admin/notifications"
      );
      setNotifications(Array.isArray(res?.data) ? res.data : []);
      if (res?.counts) setCounts(res.counts);
    } catch (err) {
      // Surface the real reason instead of console.error-ing it into the void.
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load notifications. Check the API connection and try again."
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: number) {
    try {
      await apiPost(`/admin/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setCounts((c) => ({ ...c, unread: Math.max(0, c.unread - 1) }));
    } catch (err) {
      notifyError(err, "Could not mark this alert as read.", () => markAsRead(id));
    }
  }

  async function markAllRead() {
    try {
      await apiPost("/admin/notifications/mark-all-read", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setCounts((c) => ({ ...c, unread: 0 }));
      success("All alerts marked as read.");
    } catch (err) {
      notifyError(err, "Could not mark all alerts as read.", markAllRead);
    }
  }

  /** Resolving records that the underlying problem was actually dealt with. */
  async function resolveNotification(id: number) {
    try {
      await apiPost(`/admin/notifications/${id}/resolve`, {});
      success("Alert marked as resolved.");
      await fetchNotifications();
    } catch (err) {
      notifyError(err, "Could not resolve this alert.", () => resolveNotification(id));
    }
  }

  async function deleteNotification(id: number) {
    try {
      await apiDelete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      success("Alert deleted.");
    } catch (err) {
      // Do not remove the row locally when the server delete failed.
      notifyError(err, "Could not delete this alert.", () => deleteNotification(id));
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read_at;
    if (filter === "read") return !!n.read_at;
    if (filter === "critical") return n.severity === "critical" && !n.resolved_at;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2647] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Logo size="md" />
          <div>
            <span className="text-white font-bold text-sm block">Admin Panel</span>
            <span className="text-slate-400 text-xs">Domestic RE</span>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition text-slate-300 hover:bg-white/5 hover:text-white">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0A2647]">System Notifications</h1>
              <p className="text-slate-500 text-sm">Monitor system leads, workflows, and qualification alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchNotifications} className="p-2 text-slate-400 hover:text-slate-600" title="Refresh">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="w-9 h-9 bg-[#0A2647] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AD</span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Standing banner so unresolved critical issues cannot be scrolled past. */}
          {!loading && counts.open_critical > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
              <p className="font-heading text-sm font-bold text-red-800">
                ⛔ {counts.open_critical} critical issue
                {counts.open_critical !== 1 ? "s" : ""} need
                {counts.open_critical === 1 ? "s" : ""} attention
              </p>
              <p className="mt-1 text-xs text-red-700">
                These are stopping part of the platform from working. Open each alert below and
                follow the &ldquo;How to fix&rdquo; steps, then mark it resolved.
              </p>
              <button
                onClick={() => setFilter("critical")}
                className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Show critical only
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Filters */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shadow-sm">
              {(["all", "unread", "read", "critical"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition ${
                    filter === t
                      ? "bg-white text-[#0A2647] shadow-sm font-bold"
                      : "text-slate-500 hover:text-[#0A2647]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Bulk actions */}
            {notifications.some((n) => !n.read_at) && (
              <button
                onClick={markAllRead}
                className="px-4 py-2 border border-[#C9A227] hover:bg-[#C9A227]/5 text-[#C9A227] rounded-lg text-xs font-bold transition shadow-sm"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A227]" />
              <span className="ml-3 text-slate-500 font-medium">Loading alerts...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={fetchNotifications} className="mt-2 px-4 py-2 bg-[#C9A227] text-white rounded-lg text-xs font-bold hover:bg-[#b8911f]">
                Retry
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm text-slate-400">
              <p className="text-3xl mb-2">🎉</p>
              <h3 className="text-slate-800 font-semibold mb-1 text-sm">No notifications found</h3>
              <p className="text-xs">You're all caught up with lead generations and alerts!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => {
                const sev = SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.info;
                return (
                <div
                  key={n.id}
                  onClick={() => !n.read_at && markAsRead(n.id)}
                  className={`bg-white border border-slate-200 rounded-xl p-4 transition-all duration-200 shadow-sm relative group flex items-start gap-4 border-l-4 ${sev.bar} ${
                    n.resolved_at ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-sm font-bold leading-none ${!n.read_at ? "text-[#0A2647]" : "text-slate-700"}`}>
                        {n.title}
                      </span>
                      <span className={`text-[10px] rounded-full px-2 py-0.5 font-bold uppercase tracking-wider border ${sev.chip}`}>
                        <span aria-hidden="true">{sev.icon}</span> {sev.label}
                      </span>
                      {n.module && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider">
                          {n.module}
                        </span>
                      )}
                      {n.occurrences > 1 && (
                        <span className="text-[10px] bg-slate-800 text-white rounded-full px-2 py-0.5 font-bold" title={`Happened ${n.occurrences} times`}>
                          ×{n.occurrences}
                        </span>
                      )}
                      {n.resolved_at && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">
                          Resolved
                        </span>
                      )}
                      {!n.read_at && <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pr-8">{n.message}</p>

                    {/* The whole point of an alert: tell the operator how to fix it. */}
                    {n.fix && (
                      <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#0A2647] mb-1">
                          How to fix
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">{n.fix}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {n.action_url && (
                        <Link
                          href={n.action_url}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0A2647] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#0d3366] transition"
                        >
                          {n.action_label || "Open settings"} →
                        </Link>
                      )}
                      {!n.resolved_at && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveNotification(n.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          Mark resolved
                        </button>
                      )}
                      {typeof n.data?.lead_id === "number" && (
                        <Link
                          href="/admin/leads"
                          className="text-[11px] text-[#C9A227] hover:underline font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Manage lead in CRM
                        </Link>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!n.read_at && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        className="text-slate-400 hover:text-[#C9A227] p-1 transition"
                        title="Mark read"
                        aria-label="Mark read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                      title="Delete"
                      aria-label="Delete alert"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
