"use client";

import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminRealtorDetailPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<"pending" | "verified" | "suspended" | "rejected">("verified");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    id: params.id,
    name: "Sarah Johnson",
    email: "sarah.johnson@domesticrealestate.us",
    phone: "(555) 987-6543",
    headline: "Luxury Real Estate Specialist | Top 1% Producer",
    bio: "Over 12 years of experience in luxury residential real estate and investment properties.",
    license_number: "RE-2847561",
    license_state: "FL",
    license_expiry_date: "2027-12-31",
    license_status: "active",
    brokerage_name: "Domestic Real Estate Group",
    brokerage_address: "1000 Brickell Ave, Miami, FL",
    mls_board: "MIAMI Association of REALTORS®",
    mls_number: "MLS-998822",
    rating: 4.9,
    review_count: 34,
    sales_count: 42,
    documents: [
      { id: 101, document_type: "Real Estate License", file_name: "FL_Real_Estate_License_2026.pdf", uploaded_at: "2026-01-15", status: "approved" },
      { id: 102, document_type: "Government ID", file_name: "Passport_Verification.pdf", uploaded_at: "2026-01-16", status: "approved" },
      { id: 103, document_type: "Brokerage Agreement", file_name: "Domestic_Brokerage_Agreement.pdf", uploaded_at: "2026-01-20", status: "approved" },
    ],
    audits: [
      { id: 1, action: "verification_status_change", user_name: "System Admin", previous_value: "pending", new_value: "verified", timestamp: "2026-01-15 14:22:10" },
      { id: 2, action: "realtor_profile_update", user_name: "Sarah Johnson", previous_value: "Bio Updated", new_value: "Bio Updated", timestamp: "2026-02-01 09:15:30" },
      { id: 3, action: "document_upload", user_name: "Sarah Johnson", previous_value: "null", new_value: "FL_Real_Estate_License_2026.pdf", timestamp: "2026-01-15 11:05:00" },
    ],
  });

  const updateProfile = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAction = (newStatus: "verified" | "suspended" | "rejected" | "pending") => {
    if (newStatus === "rejected") {
      setShowRejectModal(true);
      return;
    }
    setStatus(newStatus);
    setMessage(`Realtor status updated to ${newStatus.toUpperCase()}`);
    setTimeout(() => setMessage(null), 4000);
  };

  const confirmRejection = () => {
    setStatus("rejected");
    setShowRejectModal(false);
    setMessage(`Realtor profile REJECTED. Reason logged.`);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAdminSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setMessage("Admin changes saved & audit log entry created.");
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <AdminLayout title="Realtor Detail & Audit Log">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/realtors" className="p-2 bg-white rounded-lg border text-slate-500 hover:text-slate-900 transition">
              ←
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#0A2647]">{profile.name}</h1>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  status === "verified" ? "bg-emerald-100 text-emerald-800" : status === "suspended" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">Realtor ID: {profile.id} | Email: {profile.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {status !== "verified" && (
              <button onClick={() => handleAction("verified")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition">
                ✓ Verify Realtor
              </button>
            )}
            {status !== "suspended" && (
              <button onClick={() => handleAction("suspended")} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition">
                Suspend Account
              </button>
            )}
            <button onClick={() => handleAction("rejected")} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition">
              Reject Profile
            </button>
            <button onClick={handleAdminSave} disabled={saving} className="bg-[#0A2647] hover:bg-[#0d3366] text-white px-5 py-2 rounded-lg text-xs font-bold shadow transition">
              {saving ? "Saving..." : "Save Edits"}
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-[#0A2647] border-b pb-2 text-sm">Professional Profile & License Controls</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input type="text" value={profile.name} onChange={(e) => updateProfile("name", e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">License Number</label>
                  <input type="text" value={profile.license_number} onChange={(e) => updateProfile("license_number", e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">License State</label>
                  <input type="text" value={profile.license_state} onChange={(e) => updateProfile("license_state", e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brokerage Name</label>
                  <input type="text" value={profile.brokerage_name} onChange={(e) => updateProfile("brokerage_name", e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MLS Board / Number</label>
                  <input type="text" value={profile.mls_number} onChange={(e) => updateProfile("mls_number", e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
              </div>
            </div>

            {/* Document Review Vault */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-[#0A2647] border-b pb-2 text-sm">Uploaded Verification Documents</h3>
              <div className="divide-y divide-slate-100">
                {profile.documents.map((doc: any) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{doc.file_name}</p>
                      <p className="text-[11px] text-slate-500">{doc.document_type} | Uploaded: {doc.uploaded_at}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0A2647] rounded-lg">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit History Log Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-[#0A2647] border-b pb-2 text-sm">Audit History Log</h3>
            <div className="space-y-4">
              {profile.audits.map((audit: any) => (
                <div key={audit.id} className="border-l-2 border-[#0A2647] pl-3 py-1 space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 capitalize">{audit.action.replace(/_/g, " ")}</p>
                  <p className="text-[11px] text-slate-500">By: {audit.user_name}</p>
                  <p className="text-[10px] text-slate-400">{audit.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="font-bold text-rose-800 text-lg">Reject Realtor Profile</h3>
              <p className="text-xs text-slate-600">Specify the reason for rejecting this Realtor profile. An automated email will inform the user.</p>
              <textarea rows={4} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. License number unverified on state registry..." className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button onClick={confirmRejection} className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg">
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
