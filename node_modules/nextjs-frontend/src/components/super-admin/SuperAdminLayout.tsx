"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const navItems = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: "📊" },
  { name: "System Health", href: "/admin/system-health", icon: "💓" },
  { name: "All Users", href: "/admin/users", icon: "👥" },
  { name: "All Properties", href: "/admin/properties", icon: "🏠" },
  { name: "Revenue", href: "/admin/analytics", icon: "💰" },
  { name: "Admin Panel", href: "/admin", icon: "⚙️" },
  { name: "Integrations", href: "/admin/integrations", icon: "🔗" },
  { name: "Automation", href: "/admin/automation", icon: "⚡" },
  { name: "Settings", href: "/admin/settings", icon: "🔧" },
  { name: "Logs", href: "/admin/settings/logs", icon: "📋" },
];

export default function SuperAdminLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0A2647] text-white transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Logo size="md" />
          <div className="flex-1 min-w-0">
            <span className="text-white font-bold text-sm block truncate">Super Admin</span>
            <span className="text-[#C9A227] text-xs">System Control</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white">✕</button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/super-admin/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? "bg-[#C9A227]/15 text-[#C9A227]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-[#8B1E3F] rounded-full flex items-center justify-center text-white font-bold text-xs">SA</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Super Admin</p>
              <p className="text-slate-400 text-xs truncate">Full System Access</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0A2647]">{title}</h1>
              {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#8B1E3F] text-white px-2 py-1 rounded-full font-medium">Super Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
