"use client";

import React, { useState, useEffect } from "react";
import type { PublicAgent } from "@/lib/agents";
import { DEMO_AGENTS } from "./agentDemoData";
import AgentLayoutSelector, { AgentLayoutVariant } from "./AgentLayoutSelector";
import EliteGridLayout from "./layouts/EliteGridLayout";
import InteractiveSplitLayout from "./layouts/InteractiveSplitLayout";
import ExecutiveLuxuryLayout from "./layouts/ExecutiveLuxuryLayout";
import CompactMatrixLayout from "./layouts/CompactMatrixLayout";
import MinimalStudioLayout from "./layouts/MinimalStudioLayout";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";
import Link from "next/link";
import { CheckIcon } from "./AgentIcons";

interface AgentPageClientProps {
  initialAgents: PublicAgent[];
}

const STORAGE_KEY = "agent_page_integrated_layout";

export default function AgentPageClient({ initialAgents }: AgentPageClientProps) {
  const displayAgents =
    initialAgents.length >= 3
      ? initialAgents
      : [...initialAgents, ...DEMO_AGENTS.slice(0, 6 - initialAgents.length)];

  const [currentLayout, setCurrentLayout] = useState<AgentLayoutVariant>("grid");
  const [defaultLayout, setDefaultLayout] = useState<AgentLayoutVariant>("grid");
  const [integrationNotification, setIntegrationNotification] = useState<string | null>(null);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLayout = urlParams.get("layout") as AgentLayoutVariant | null;

      const savedLayout = localStorage.getItem(STORAGE_KEY) as AgentLayoutVariant | null;

      if (savedLayout && ["grid", "split", "luxury", "matrix", "studio"].includes(savedLayout)) {
        setDefaultLayout(savedLayout);
        if (!urlLayout) setCurrentLayout(savedLayout);
      }

      if (urlLayout && ["grid", "split", "luxury", "matrix", "studio"].includes(urlLayout)) {
        setCurrentLayout(urlLayout);
      }
    } catch {
      // ignore SSR window errors
    }
  }, []);

  const handleSelectLayout = (layout: AgentLayoutVariant) => {
    setCurrentLayout(layout);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("layout", layout);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleSetDefault = (layout: AgentLayoutVariant) => {
    try {
      localStorage.setItem(STORAGE_KEY, layout);
      setDefaultLayout(layout);
      setIntegrationNotification(
        `Successfully integrated "${layout.toUpperCase()}" as your default agent directory layout!`
      );
      setTimeout(() => setIntegrationNotification(null), 4000);
    } catch (err) {
      console.error("Failed to save layout preference", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A2647] font-body flex flex-col justify-between">
      <div>
        {/* Top Interactive Layout Switcher Toolbar */}
        <AgentLayoutSelector
          currentLayout={currentLayout}
          onSelectLayout={handleSelectLayout}
          onSetDefault={handleSetDefault}
          defaultLayout={defaultLayout}
        />

        {/* Integration Toast Banner */}
        {integrationNotification && (
          <div className="bg-emerald-500 text-slate-950 py-2.5 px-4 font-heading font-extrabold text-xs text-center flex items-center justify-center gap-2 shadow-md animate-fade-in">
            <CheckIcon className="w-4 h-4 text-slate-950" />
            <span>{integrationNotification}</span>
          </div>
        )}

        {/* Main Content Rendered according to selected layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {currentLayout === "grid" && <EliteGridLayout agents={displayAgents} />}
          {currentLayout === "split" && <InteractiveSplitLayout agents={displayAgents} />}
          {currentLayout === "luxury" && <ExecutiveLuxuryLayout agents={displayAgents} />}
          {currentLayout === "matrix" && <CompactMatrixLayout agents={displayAgents} />}
          {currentLayout === "studio" && <MinimalStudioLayout agents={displayAgents} />}
        </main>

        {/* Bottom Call-To-Action Banner */}
        <section className="mt-16 py-16 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              Are You a Licensed Real Estate Agent?
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base font-body max-w-2xl mx-auto">
              Join our exclusive realtor partner network and receive verified seller leads in your target zip codes.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/register?role=agent"
                className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-xs sm:text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
              >
                Join Preferred Network Now →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ChatWidgetWrapper context="agent" leadType="agent" />
    </div>
  );
}
