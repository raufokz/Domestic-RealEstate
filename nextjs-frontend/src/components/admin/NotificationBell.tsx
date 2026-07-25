"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import Link from "next/link";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  read_at: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await apiGet<{ data: NotificationItem[] }>("/admin/notifications");
      // Check if data is array or wrapped (paginated)
      const list = Array.isArray(res) 
        ? res 
        : (res && Array.isArray((res as any).data) ? (res as any).data : []);
      
      setNotifications(list.slice(0, 10)); // limit to top 10 in bell
      setUnreadCount(list.filter((n: any) => !n.read_at).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }

  async function markAsRead(id: number) {
    try {
      await apiPost(`/admin/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  }

  async function markAllRead() {
    try {
      await apiPost("/admin/notifications/mark-all-read", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  }

  async function deleteNotification(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await apiDelete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Re-calculate unread count
      setUnreadCount((c) => {
        const wasUnread = !notifications.find((n) => n.id === id)?.read_at;
        return wasUnread ? Math.max(0, c - 1) : c;
      });
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-[#0A2647] hover:bg-slate-100 rounded-lg transition-all focus:outline-none"
        title="Alerts"
      >
        <svg
          className="w-6 h-6 transform hover:rotate-12 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <span className="font-bold text-sm text-[#0A2647]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#C9A227] hover:text-[#b8911f] font-semibold transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                <p className="text-xl mb-1">🔔</p>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`flex flex-col gap-1 p-4 cursor-pointer hover:bg-slate-50 transition relative group ${
                    !n.read_at ? "bg-slate-50/50 border-l-4 border-[#C9A227]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`font-semibold text-xs text-slate-800 ${
                        !n.read_at ? "text-[#0A2647] font-bold" : ""
                      }`}
                    >
                      {n.title}
                    </span>
                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition absolute right-3 top-3"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pr-6">{n.message}</p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    {n.data?.lead_id && (
                      <Link
                        href={`/admin/leads`}
                        className="text-[#C9A227] hover:underline font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Lead →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* View All Footer */}
          <div className="bg-slate-50 text-center border-t border-slate-200">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-xs text-[#0A2647] hover:text-[#C9A227] font-semibold transition"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
