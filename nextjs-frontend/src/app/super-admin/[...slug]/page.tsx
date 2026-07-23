"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function DynamicSuperAdminPage() {
  const params = useParams();
  const slugArray = Array.isArray(params?.slug) ? params.slug : [params?.slug || "dashboard"];
  const pageTitle = slugArray.join(" / ").replace(/-/g, " ").toUpperCase();

  return (
    <div className="min-h-screen bg-[#051324] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#07162C] border-r-2 border-[#C9A227]/60 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="mb-8">
            <Logo size="md" href="/super-admin/dashboard" dark />
            <span className="block text-[10px] font-mono text-[#C9A227] font-extrabold tracking-widest mt-1">
              SUPER ADMIN SAAS SUITE
            </span>
          </div>

          <nav className="space-y-2 text-xs font-bold text-slate-300">
            {[
              { name: "Global SaaS Overview", href: "/super-admin/dashboard" },
              { name: "Tenant Management", href: "/super-admin/tenants" },
              { name: "Global Subscriptions", href: "/super-admin/subscriptions" },
              { name: "SaaS Membership Plans", href: "/super-admin/plans" },
              { name: "White-Label Settings", href: "/super-admin/white-label" },
              { name: "Custom Domain Routing", href: "/super-admin/domains" },
              { name: "Global Revenue Analytics", href: "/super-admin/revenue" },
              { name: "Global System Health", href: "/super-admin/system-health" },
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
          <p>Multi-Tenant SaaS Kernel v5.0</p>
        </div>
      </aside>

      {/* Main Super Admin View */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div>
            <span className="text-xs font-mono font-extrabold text-[#C9A227] uppercase">Super Admin SaaS Controller</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white capitalize">{pageTitle}</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="bg-[#C9A227] text-[#0A2647] text-xs font-extrabold px-4 py-2 rounded-xl shadow hover:bg-amber-400">
              Live Main Site →
            </Link>
          </div>
        </div>

        <div className="bg-[#0A2647] border-2 border-[#C9A227]/60 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#C9A227] animate-ping" />
            <h3 className="text-lg font-extrabold text-[#C9A227]">Global SaaS Tenant Engine Active</h3>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Multi-tenant control instance initialized for <span className="font-mono text-[#C9A227] font-bold">{pageTitle}</span>. Global subscription billing, domain SSL gateways, and feature flag rules are synchronized across all platform nodes.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#07162C] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-extrabold">Active Tenants</span>
              <div className="text-2xl font-extrabold text-[#C9A227] font-mono mt-1">142</div>
            </div>
            <div className="p-4 bg-[#07162C] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-extrabold">Global MRR</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">$148,500</div>
            </div>
            <div className="p-4 bg-[#07162C] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-extrabold">Custom Domains</span>
              <div className="text-2xl font-extrabold text-blue-400 font-mono mt-1">89</div>
            </div>
            <div className="p-4 bg-[#07162C] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-extrabold">SaaS Uptime</span>
              <div className="text-2xl font-extrabold text-purple-400 font-mono mt-1">99.99%</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
