"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import SystemStatusBar from "@/components/admin/SystemStatusBar";
import NotificationBell from "@/components/admin/NotificationBell";

const navSections = [
  { label: "OVERVIEW", items: [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "System Health", href: "/admin/system-health", icon: "💓" },
  ]},
  { label: "USERS", items: [
    { name: "All Users", href: "/admin/users", icon: "👥" },
    { name: "Brokers", href: "/admin/brokers", icon: "🏢" },
    { name: "Buyers", href: "/admin/buyers", icon: "🛒" },
    { name: "Sellers", href: "/admin/sellers", icon: "🏷️" },
    { name: "Investors", href: "/admin/investors", icon: "💼" },
    { name: "Staff", href: "/admin/staff", icon: "👨‍💻" },
  ]},
  { label: "CRM", items: [
    { name: "Pipeline", href: "/admin/crm/pipeline", icon: "📋" },
    { name: "Leads", href: "/admin/leads", icon: "🎯" },
    { name: "Contacts", href: "/admin/contacts", icon: "📇" },
    { name: "Enquiries", href: "/admin/enquiries", icon: "✉️" },
    { name: "Service Requests", href: "/admin/service-requests", icon: "📋" },
  ]},
  { label: "PROPERTIES", items: [
    { name: "All Properties", href: "/admin/properties", icon: "🏠" },
    { name: "Types", href: "/admin/properties/types", icon: "📂" },
    { name: "Amenities", href: "/admin/properties/amenities", icon: "✨" },
    { name: "Categories", href: "/admin/properties/categories", icon: "🗂️" },
    { name: "Analytics", href: "/admin/properties/analytics", icon: "📈" },
  ]},
  { label: "AGENTS", items: [
    { name: "Agent Management", href: "/admin/agents", icon: "🧑‍💼" },
    { name: "Performance", href: "/admin/agents/performance", icon: "📈" },
  ]},
  { label: "EMAIL & CAMPAIGNS", items: [
    { name: "Campaigns", href: "/admin/campaigns", icon: "📧" },
    { name: "Email Automation", href: "/admin/email-automation", icon: "🤖" },
    { name: "Email Settings (SMTP)", href: "/admin/email-settings", icon: "⚙️" },
    { name: "Email Templates", href: "/admin/email-templates", icon: "📝" },
    { name: "Templates Editor", href: "/admin/email-templates/editor", icon: "🎨" },
    { name: "Sent Emails", href: "/admin/sent-emails", icon: "📬" },
    { name: "Newsletter", href: "/admin/newsletter", icon: "📮" },
  ]},
  { label: "SOCIAL MEDIA", items: [
    { name: "Social CRM", href: "/admin/social", icon: "📱" },
  ]},
  { label: "AI", items: [
    { name: "AI Agents", href: "/admin/ai-agents", icon: "🤖" },
    { name: "AI Chat", href: "/admin/ai-chat", icon: "💬" },
    { name: "AI Chat Logs", href: "/admin/ai-chat-logs", icon: "📋" },
    { name: "AI Prompts", href: "/admin/ai-prompts", icon: "✏️" },
    { name: "AI Blog Generator", href: "/admin/ai-blog", icon: "📰" },
    { name: "AI Settings", href: "/admin/ai-settings", icon: "⚙️" },
  ]},
  { label: "CONTENT", items: [
    { name: "Blog", href: "/admin/blog", icon: "📝" },
    { name: "Blog Categories", href: "/admin/blog/categories", icon: "📂" },
    { name: "Blog Tags", href: "/admin/blog/tags", icon: "🏷️" },
    { name: "Pages", href: "/admin/pages", icon: "📄" },
    { name: "Page Builder", href: "/admin/pages/builder", icon: "🔨" },
    { name: "Page Templates", href: "/admin/pages/templates", icon: "🎨" },
    { name: "Content Blocks", href: "/admin/content-blocks", icon: "🧩" },
    { name: "SEO Pages", href: "/admin/seo-pages", icon: "🔍" },
    { name: "Media Library", href: "/admin/media", icon: "🖼️" },
    { name: "Navigation", href: "/admin/navigation", icon: "🧭" },
  ]},
  { label: "WEBSITES", items: [
    { name: "All Websites", href: "/admin/websites", icon: "🌐" },
    { name: "Templates", href: "/admin/websites/templates", icon: "🎨" },
  ]},
  { label: "AUTOMATION", items: [
    { name: "Workflows", href: "/admin/automation", icon: "⚡" },
    { name: "Triggers", href: "/admin/automation/triggers", icon: "🔔" },
    { name: "Actions", href: "/admin/automation/actions", icon: "🎯" },
  ]},
  { label: "INTEGRATIONS", items: [
    { name: "All Integrations", href: "/admin/integrations", icon: "🔗" },
    { name: "API Keys", href: "/admin/integrations/api-keys", icon: "🔑" },
  ]},
  { label: "CONTRACTS & PAYMENTS", items: [
    { name: "Contracts", href: "/admin/contracts", icon: "📄" },
    { name: "Create Contract", href: "/admin/contracts/create", icon: "➕" },
    { name: "Signed Contracts", href: "/admin/contracts/signed", icon: "✅" },
    { name: "Invoices", href: "/admin/invoices", icon: "💰" },
    { name: "Payments", href: "/admin/payments", icon: "💳" },
  ]},
  { label: "ANALYTICS & REPORTS", items: [
    { name: "Analytics", href: "/admin/analytics", icon: "📈" },
    { name: "Reports", href: "/admin/reports", icon: "📊" },
    { name: "Exports", href: "/admin/exports", icon: "📤" },
    { name: "Import History", href: "/admin/import-history", icon: "📥" },
  ]},
  { label: "TESTING", items: [
    { name: "Email Testing", href: "/admin/testing/email", icon: "📧" },
    { name: "SMS Testing", href: "/admin/testing/sms", icon: "📱" },
    { name: "AI Testing", href: "/admin/testing/ai", icon: "🤖" },
    { name: "Form Testing", href: "/admin/testing/forms", icon: "📋" },
    { name: "Payment Testing", href: "/admin/testing/payments", icon: "💳" },
    { name: "Webhook Testing", href: "/admin/testing/webhooks", icon: "🔗" },
  ]},
  { label: "INFRASTRUCTURE", items: [
    { name: "Queue", href: "/admin/queue", icon: "📋" },
    { name: "Cache", href: "/admin/cache", icon: "🗑️" },
    { name: "Cron Jobs", href: "/admin/cron-jobs", icon: "⏰" },
  ]},
  { label: "SETTINGS", items: [
    { name: "General", href: "/admin/settings", icon: "⚙️" },
    { name: "Appearance", href: "/admin/settings/appearance", icon: "🎨" },
    { name: "SEO", href: "/admin/settings/seo", icon: "🔍" },
    { name: "Security", href: "/admin/settings/security", icon: "🔒" },
    { name: "Notifications", href: "/admin/settings/notifications", icon: "🔔" },
    { name: "Backup", href: "/admin/settings/backup", icon: "💾" },
    { name: "Logs", href: "/admin/settings/logs", icon: "📋" },
    { name: "Activity Logs", href: "/admin/activity-logs", icon: "📋" },
  ]},
];

export default function AdminLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0A2647] text-white transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo size="sm" dark />
            <span className="font-semibold text-sm text-white">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-3 overflow-y-auto h-[calc(100vh-4rem)] pb-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
                {section.label}
              </div>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" &&
                    pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-[#C9A227] text-[#0A2647] font-semibold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-[#0A2647]">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationBell />

            {/* Admin Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#C9A227] rounded-full flex items-center justify-center text-[#0A2647] font-bold text-sm">
                AD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@domesticre.com</p>
              </div>
            </div>
          </div>
        </header>

        <SystemStatusBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
