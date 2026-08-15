"use client";

import React from "react";
import type { PublicAgent } from "@/lib/agents";
import MasterAgentDirectory from "./MasterAgentDirectory";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";
import Link from "next/link";

interface AgentPageClientProps {
  initialAgents: PublicAgent[];
}

export default function AgentPageClient({ initialAgents }: AgentPageClientProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-[#0A2647] font-body flex flex-col justify-between">
      <div>
        {/* Main Master Directory View */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <MasterAgentDirectory agents={initialAgents} />
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
