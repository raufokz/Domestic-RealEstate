"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  property?: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  replied: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const statusMap: Record<string, string> = {
  new: "New",
  replied: "Replied",
  closed: "Closed",
};

export default function EnquiriesPage() {
  const { success, notifyError } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function loadEnquiries() {
    setLoading(true);
    try {
      const data = await apiGet<{ data: Enquiry[] }>("/admin/enquiries");
      setEnquiries(data?.data || []);
    } catch (err) {
      notifyError(err, "Enquiries could not be loaded.");
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(enquiryId: number) {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await apiPut(`/admin/enquiries/${enquiryId}`, { status: "replied", reply: replyText });
      success("Reply sent successfully.", "Enquiries");
      setReplyText("");
      setExpandedId(null);
      loadEnquiries();
    } catch (err) {
      notifyError(err, "Reply could not be sent.");
    } finally {
      setSendingReply(false);
    }
  }

  async function handleStatusChange(enquiryId: number, newStatus: string) {
    try {
      await apiPut(`/admin/enquiries/${enquiryId}`, { status: newStatus });
      success("Enquiry status updated.", "Enquiries");
      loadEnquiries();
    } catch (err) {
      notifyError(err, "Status could not be updated.");
    }
  }

  const filtered = statusFilter === "All" ? enquiries : enquiries.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase());

  return (
    <AdminLayout title="Enquiries Inbox">
      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        {["All", "New", "Replied", "Closed"].map((status) => {
          const count = status === "All" ? enquiries.length : enquiries.filter((e) => e.status.toLowerCase() === status.toLowerCase()).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#0A2647] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading enquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No enquiries found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((enquiry) => {
            const displayStatus = statusMap[enquiry.status.toLowerCase()] || enquiry.status;
            return (
              <div key={enquiry.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === enquiry.id ? null : enquiry.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full capitalize ${statusColors[enquiry.status.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
                      {displayStatus}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{enquiry.subject}</p>
                      <p className="text-sm text-gray-500">From: {enquiry.name} ({enquiry.email}) — {new Date(enquiry.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === enquiry.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedId === enquiry.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      {enquiry.property && <p className="text-sm text-gray-600 mb-2"><strong>Property:</strong> {enquiry.property}</p>}
                      <p className="text-sm text-gray-700">{enquiry.message}</p>
                    </div>
                    <div className="mt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent text-sm"
                      />
                      <div className="flex justify-between items-center gap-2 mt-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusChange(enquiry.id, "closed")}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Mark Closed
                      </button>
                      <button 
                        onClick={() => setExpandedId(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Close
                      </button>
                    </div>
                    <button 
                      onClick={() => handleReply(enquiry.id)}
                      disabled={sendingReply || !replyText.trim()}
                      className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-50"
                    >
                      {sendingReply ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>
      )}
    </AdminLayout>
  );
}
