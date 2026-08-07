"use client";

import BrokerLayout from "@/components/broker/BrokerLayout";
import Link from "next/link";

export default function TeamPage() {
  return (
    <BrokerLayout title="Team Management" subtitle="Manage your brokerage team members and their performance.">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">🏢</div>
          <h3 className="text-lg font-bold text-[#0A2647] mb-2">Team Roster Isn&apos;t Linked Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Agent profiles currently only store a free-text brokerage name, not a real link to a broker
            account, so agents can&apos;t yet be assigned to a broker&apos;s team here. Use Admin &gt; Agents
            to manage individual agent accounts in the meantime.
          </p>
          <Link href="/admin/agents" className="inline-block mt-6 px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            View All Agents
          </Link>
        </div>
      </div>
    </BrokerLayout>
  );
}
