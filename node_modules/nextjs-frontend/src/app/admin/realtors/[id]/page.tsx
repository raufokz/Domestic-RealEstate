"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface RealtorApplicationDetail {
  id: number;
  reference: string;
  full_name: string;
  email: string;
  phone: string | null;
  license_number: string;
  license_state: string;
  brokerage_name: string | null;
  brokerage_license_number: string | null;
  id_document_path: string | null;
  license_document_path: string | null;
  status: "pending" | "under_review" | "more_info_requested" | "approved" | "rejected";
  review_notes: string | null;
  reviewer: { id: number; name: string } | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  more_info_requested: "bg-purple-100 text-purple-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export default function AdminRealtorApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { success, notifyError } = useToast();

  const [application, setApplication] = useState<RealtorApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<"reject" | "more_info" | null>(null);
  const [notes, setNotes] = useState("");

  async function fetchApplication() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ data: RealtorApplicationDetail }>(`/admin/realtor-applications/${id}`);
      setApplication(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load this application.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await fetchApplication();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleApprove() {
    if (!confirm("Approve this application? This creates a real login-enabled user account and published agent profile.")) return;
    setBusy(true);
    try {
      await apiPost(`/admin/realtor-applications/${id}/approve`);
      success("Application approved — account created and notified by email.");
      fetchApplication();
    } catch (e) {
      notifyError(e, "Could not approve this application.");
    } finally {
      setBusy(false);
    }
  }

  async function submitModal() {
    if (!modal || notes.trim().length < 5) return;
    setBusy(true);
    try {
      const endpoint = modal === "reject" ? "reject" : "request-more-info";
      await apiPost(`/admin/realtor-applications/${id}/${endpoint}`, { notes });
      success(modal === "reject" ? "Application rejected." : "Requested more information from applicant.");
      setModal(null);
      setNotes("");
      fetchApplication();
    } catch (e) {
      notifyError(e, "Could not update this application.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadDocument(type: "id" | "license") {
    try {
      const token = readAuthToken();
      const res = await fetch(`${API_BASE}/admin/realtor-applications/${id}/documents/${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Document not found.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      notifyError(e, "Could not download this document.");
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Realtor Application">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !application) {
    return (
      <AdminLayout title="Realtor Application">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error || "Application not found."}</p>
          <button onClick={fetchApplication} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const isFinal = application.status === "approved" || application.status === "rejected";

  return (
    <AdminLayout title="Realtor Application">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/realtors" className="p-2 bg-white rounded-lg border text-slate-500 hover:text-slate-900 transition">
              ←
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#0A2647]">{application.full_name}</h1>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[application.status]}`}>
                  {application.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Ref: {application.reference} · {application.email}
              </p>
            </div>
          </div>

          {!isFinal && (
            <div className="flex gap-2">
              <button onClick={handleApprove} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition disabled:opacity-50">
                ✓ Approve
              </button>
              <button onClick={() => setModal("more_info")} disabled={busy} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition disabled:opacity-50">
                Request More Info
              </button>
              <button onClick={() => setModal("reject")} disabled={busy} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition disabled:opacity-50">
                Reject
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-[#0A2647] border-b pb-2 text-sm">Application Details</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-slate-500 mb-1">Phone</p>
                  <p className="text-slate-800">{application.phone || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 mb-1">License Number</p>
                  <p className="text-slate-800">
                    {application.license_number} ({application.license_state})
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 mb-1">Brokerage</p>
                  <p className="text-slate-800">{application.brokerage_name || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 mb-1">Brokerage License #</p>
                  <p className="text-slate-800">{application.brokerage_license_number || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 mb-1">Submitted</p>
                  <p className="text-slate-800">{new Date(application.submitted_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 mb-1">Reviewed</p>
                  <p className="text-slate-800">
                    {application.reviewed_at ? new Date(application.reviewed_at).toLocaleString() : "—"}
                    {application.reviewer ? ` by ${application.reviewer.name}` : ""}
                  </p>
                </div>
              </div>
              {application.review_notes && (
                <div>
                  <p className="font-semibold text-slate-500 mb-1 text-xs">Reviewer Notes</p>
                  <p className="text-xs text-slate-700 bg-slate-50 rounded-lg p-3">{application.review_notes}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-[#0A2647] border-b pb-2 text-sm">Verification Documents</h3>
              <div className="divide-y divide-slate-100">
                <div className="py-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">Government ID</p>
                  {application.id_document_path ? (
                    <button onClick={() => downloadDocument("id")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0A2647] rounded-lg">
                      Download
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Not provided</span>
                  )}
                </div>
                <div className="py-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">Real Estate License</p>
                  {application.license_document_path ? (
                    <button onClick={() => downloadDocument("license")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0A2647] rounded-lg">
                      Download
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-[#0A2647] border-b pb-2 text-sm mb-3">What Happens Next</h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li><strong>Approve</strong> creates a real user account + published agent profile, and emails a set-password link.</li>
              <li><strong>Reject</strong> ends the application and emails the applicant your reason. No account is created.</li>
              <li><strong>Request More Info</strong> lets the applicant resubmit documents using their reference number.</li>
            </ul>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className={`font-bold text-lg ${modal === "reject" ? "text-rose-800" : "text-purple-800"}`}>
                {modal === "reject" ? "Reject Application" : "Request More Information"}
              </h3>
              <p className="text-xs text-slate-600">
                {modal === "reject"
                  ? "Explain why this application is being rejected. This is emailed to the applicant."
                  : "Explain what additional information or documents are needed. This is emailed to the applicant with a link to resubmit."}
              </p>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. License number could not be verified on the state registry..."
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setModal(null); setNotes(""); }} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={submitModal}
                  disabled={busy || notes.trim().length < 5}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg disabled:opacity-50 ${modal === "reject" ? "bg-rose-600 hover:bg-rose-700" : "bg-purple-600 hover:bg-purple-700"}`}
                >
                  {busy ? "Submitting..." : modal === "reject" ? "Confirm Rejection" : "Send Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
