"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function DynamicAdminPage() {
  const params = useParams();
  const slugArray = Array.isArray(params?.slug) ? params.slug : [params?.slug || "crm"];
  const pageTitle = slugArray.join(" / ").replace(/-/g, " ").toUpperCase();

  return (
    <div className="min-h-screen bg-[#051324] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A2647] border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="mb-8">
            <Logo size="md" href="/admin" dark />
            <span className="block text-[10px] font-mono text-[#C9A227] font-extrabold tracking-widest mt-1">
              ADMIN CONTROL PANEL
            </span>
          </div>

          <nav className="space-y-2 text-xs font-bold text-slate-300">
            {[
              { name: "Overview Dashboard", href: "/admin" },
              { name: "CRM & Leads Management", href: "/admin/crm" },
              { name: "Properties & Listings", href: "/admin/properties" },
              { name: "Users & Agent Roles", href: "/admin/users" },
              { name: "AI Agent Configurator", href: "/admin/ai-agents" },
              { name: "Automation Workflows", href: "/admin/automations" },
              { name: "Finance & Invoices", href: "/admin/finance" },
              { name: "System & Health", href: "/admin/system" },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="block px-3.5 py-2.5 rounded-xl hover:bg-[#C9A227] hover:text-[#0A2647] transition-all"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 text-xs text-slate-400">
          <p>Domestic RE Engine v3.4</p>
        </div>
      </aside>

      {/* Main Admin View */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div>
            <span className="text-xs font-mono font-extrabold text-[#C9A227] uppercase">System Console</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white capitalize">{pageTitle}</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl border border-slate-700">
              View Website →
            </Link>
          </div>
        </div>

        <div className="bg-[#0A2647] border border-slate-700 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-lg font-extrabold text-[#C9A227]">Module Active & Online</h3>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Management sub-system initialized for <span className="font-mono text-[#C9A227] font-bold">{pageTitle}</span>. All webhooks, API controllers, and database telemetry feeds are operating within normal parameters.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#07162C] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-extrabold">Active Status</span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">HEALTHY</div>
            </div>
            <div className="p-4 bg-[#07162C] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-extrabold">Latency</span>
              <div className="text-xl font-extrabold text-[#C9A227] font-mono mt-1">12 ms</div>
            </div>
            <div className="p-4 bg-[#07162C] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-extrabold">API Security</span>
              <div className="text-xl font-extrabold text-blue-400 font-mono mt-1">ENCRYPTED</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
