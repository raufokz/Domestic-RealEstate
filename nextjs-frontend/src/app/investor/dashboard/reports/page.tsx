"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import Link from "next/link";

export default function InvestorReportsPage() {
  return (
    <InvestorLayout title="Investment Reports" subtitle="Downloadable performance and market reports.">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-bold text-[#0A2647] mb-2">Report Generation Isn&apos;t Available Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Portfolio, cash-flow, and tax reports require transaction and rental-income tracking, which this
            platform does not currently record. For real activity you&apos;ve had on the platform so far, see
            Investment Activity.
          </p>
          <Link href="/investor/dashboard/analytics" className="inline-block mt-6 px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            View Investment Activity
          </Link>
        </div>
      </div>
    </InvestorLayout>
  );
}
