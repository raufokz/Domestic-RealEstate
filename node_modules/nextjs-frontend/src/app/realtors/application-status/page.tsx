"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet, ApiError } from "@/lib/api";

interface StatusResult {
  reference: string;
  status: "pending" | "under_review" | "more_info_requested" | "approved" | "rejected";
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const statusCopy: Record<string, { label: string; color: string; message: string }> = {
  pending: { label: "Pending Review", color: "text-amber-700 bg-amber-50 border-amber-200", message: "Your application is in the queue and hasn't been reviewed yet." },
  under_review: { label: "Under Review", color: "text-blue-700 bg-blue-50 border-blue-200", message: "Our team is actively reviewing your application." },
  more_info_requested: { label: "More Information Needed", color: "text-purple-700 bg-purple-50 border-purple-200", message: "We need a bit more information before we can proceed — see below." },
  approved: { label: "Approved", color: "text-emerald-700 bg-emerald-50 border-emerald-200", message: "Congratulations — your application has been approved! Check your email for account setup instructions." },
  rejected: { label: "Not Approved", color: "text-rose-700 bg-rose-50 border-rose-200", message: "We were unable to approve your application at this time." },
};

function ApplicationStatusInner() {
  const params = useSearchParams();
  const [reference, setReference] = useState(params.get("ref") || "");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkStatus(e?: React.FormEvent) {
    e?.preventDefault();
    if (!reference.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await apiGet<{ data: StatusResult }>(`/realtor-applications/${encodeURIComponent(reference.trim())}/status`);
      setResult(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not look up that application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-[#0A2647] min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <p className="text-[#C9A227] font-heading text-xs tracking-widest uppercase mb-2">Realtor Application</p>
        <h1 className="text-2xl font-bold text-[#0A2647] mb-6">Check Your Application Status</h1>

        <form onSubmit={checkStatus} className="flex gap-2 mb-6">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. RA-AB12CD34"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
          />
          <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-50">
            {loading ? "Checking..." : "Check"}
          </button>
        </form>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {result && (
          <div className={`rounded-xl border p-5 ${statusCopy[result.status].color}`}>
            <p className="font-bold text-sm mb-1">{statusCopy[result.status].label}</p>
            <p className="text-sm mb-3">{statusCopy[result.status].message}</p>
            {result.review_notes && (result.status === "more_info_requested" || result.status === "rejected") && (
              <div className="bg-white/60 rounded-lg p-3 text-sm mb-3">
                <strong>Reviewer note:</strong> {result.review_notes}
              </div>
            )}
            {result.status === "more_info_requested" && (
              <p className="text-xs">Check your email for a link to resubmit your documents.</p>
            )}
            <p className="text-xs mt-3 opacity-70">Submitted {new Date(result.submitted_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ApplicationStatusPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationStatusInner />
    </Suspense>
  );
}
