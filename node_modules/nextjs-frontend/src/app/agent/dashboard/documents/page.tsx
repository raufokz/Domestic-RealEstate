"use client";

import { useState, useEffect, useRef } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiGet, apiDelete, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface AgentDocument {
  id: number;
  document_type: string;
  original_name: string | null;
  file_url: string;
  status: "pending" | "approved" | "rejected";
  uploaded_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

const DOC_TYPES = [
  { value: "license", label: "License" },
  { value: "certification", label: "Certification" },
  { value: "insurance", label: "Insurance" },
  { value: "bio_photo", label: "Bio Photo" },
  { value: "other", label: "Other" },
];

function authToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
}

export default function AgentDocumentsPage() {
  const { success, notifyError } = useToast();
  const [docs, setDocs] = useState<AgentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("license");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  async function fetchDocs() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<{ data: AgentDocument[] }>("/agent/documents");
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load your documents. Please check the connection and try again."
      );
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      notifyError(null, "File is too large. Maximum size is 10MB.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("document", file);
      fd.append("document_type", docType);
      const token = authToken();
      const res = await fetch(`${API_BASE}/agent/documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
        body: fd,
      });
      if (!res.ok) {
        let msg = "Upload failed. Please try again.";
        try {
          const body = await res.json();
          if (body?.message) msg = body.message;
        } catch {
          /* keep default */
        }
        throw new ApiError(msg, res.status);
      }
      success("Document uploaded.");
      await fetchDocs();
    } catch (e) {
      notifyError(e, "Could not upload document. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function downloadDoc(doc: AgentDocument) {
    setActionLoading(doc.id);
    try {
      const token = authToken();
      const res = await fetch(`${API_BASE}/agent/documents/${doc.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new ApiError("Could not download this document.", res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_name || `document-${doc.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e, "Could not download this document.");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteDoc(id: number) {
    if (!confirm("Delete this document?")) return;
    setActionLoading(id);
    try {
      await apiDelete(`/agent/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      success("Document deleted.");
    } catch (e) {
      notifyError(e, "Could not delete this document. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AgentLayout title="Documents" subtitle="Manage your licenses and certifications">
      <div className="space-y-6">
        {/* Upload zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition ${dragOver ? "border-[#C9A227] bg-[#C9A227]/5" : "border-slate-300 hover:border-slate-400"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) uploadFile(f);
          }}
        >
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-slate-700">Drag &amp; drop a file here, or click to browse</p>
          <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="text-sm text-slate-600">
              Type:
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="ml-2 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3366] transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-slate-500">Loading documents...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchDocs}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && docs.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No documents yet</h3>
            <p className="text-slate-500 text-sm">Upload your license, certifications, or insurance to get started.</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && docs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Document</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Uploaded</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{doc.original_name || `Document #${doc.id}`}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 capitalize">{doc.document_type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[doc.status]}`}>{doc.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadDoc(doc)}
                            disabled={actionLoading === doc.id}
                            className="text-sm text-[#C9A227] hover:text-[#0A2647] font-medium disabled:opacity-50"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => deleteDoc(doc.id)}
                            disabled={actionLoading === doc.id}
                            className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AgentLayout>
  );
}
