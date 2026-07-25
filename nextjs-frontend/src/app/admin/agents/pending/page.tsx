"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const initialAgents = [
  { id: 1, name: "Emily Brown", license: "DRE#03456789", brokerage: "Domestic RE Group", documents: ["License", "Insurance", "ID Proof"], applied: "2024-10-01", photo: "EB" },
  { id: 2, name: "Jessica Wilson", license: "DRE#05678901", brokerage: "Premier Properties", documents: ["License", "E&O Insurance"], applied: "2024-10-05", photo: "JW" },
  { id: 3, name: "Kevin Chang", license: "DRE#09012345", brokerage: "Elite Homes", documents: ["License", "Background Check"], applied: "2024-10-08", photo: "KC" },
  { id: 4, name: "Rachel Patel", license: "DRE#10123456", brokerage: "Sunset Realty", documents: ["License", "Insurance", "ID Proof", "References"], applied: "2024-10-10", photo: "RP" },
  { id: 5, name: "Marcus Thompson", license: "DRE#11234567", brokerage: "Domestic RE Group", documents: ["License"], applied: "2024-10-12", photo: "MT" },
];

export default function PendingAgentsPage() {
  const [agents, setAgents] = useState(initialAgents);
  const [modal, setModal] = useState<{ agentId: number; agentName: string; action: "approve" | "reject" } | null>(null);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!modal) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setAgents((prev) => prev.filter((a) => a.id !== modal.agentId));
    setProcessing(false);
    setModal(null);
    setNotes("");
  };

  const openModal = (agentId: number, agentName: string, action: "approve" | "reject") => {
    setModal({ agentId, agentName, action });
    setNotes("");
  };

  return (
    <AdminLayout title="Pending Agent Approvals">
      {/* Summary Bar */}
      <div className="bg-[#0A2647] rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A227] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-[#0A2647]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{agents.length} agent{agents.length !== 1 ? "s" : ""} pending review</p>
            <p className="text-white/60 text-xs">Review documents and credentials before approval</p>
          </div>
        </div>
      </div>

      {/* Pending Agents Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A2647] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Agent</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">License</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Brokerage</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Documents</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Applied</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-[#0A2647] font-bold text-sm">
                        {agent.photo}
                      </div>
                      <span className="font-medium text-gray-900">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-mono">{agent.license}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{agent.brokerage}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {agent.documents.map((doc) => (
                        <span key={doc} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{agent.applied}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(agent.id, agent.name, "approve")}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModal(agent.id, agent.name, "reject")}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 font-medium transition-colors"
                      >
                        Reject
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 font-medium transition-colors">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {agents.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-900 font-semibold">All caught up!</p>
              <p className="text-gray-500 text-sm mt-1">No pending agent approvals at this time.</p>
            </div>
          )}
        </div>
      </div>

      {/* Approve/Reject Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold ${modal.action === "approve" ? "text-green-700" : "text-red-700"}`}>
                  {modal.action === "approve" ? "Approve Agent" : "Reject Agent"}
                </h3>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                You are about to <span className={`font-semibold ${modal.action === "approve" ? "text-green-700" : "text-red-700"}`}>{modal.action}</span>{" "}
                the agent application for <span className="font-semibold">{modal.agentName}</span>.
              </p>

              {modal.action === "approve" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700">
                    Approving will grant this agent access to the platform, create their profile, and trigger a welcome email.
                  </p>
                </div>
              )}

              {modal.action === "reject" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700">
                    Rejecting will deny this application. The agent will be notified and may reapply in the future.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={modal.action === "approve" ? "Add any onboarding notes..." : "Provide a reason for rejection..."}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={processing}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={processing}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  modal.action === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : modal.action === "approve" ? (
                  "Confirm Approval"
                ) : (
                  "Confirm Rejection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
