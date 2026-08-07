"use client";

import SellerLayout from "@/components/seller/SellerLayout";
import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet, apiDelete, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  status: string;
}

const TYPE_COLORS: Record<string, string> = {
  Agreement: "bg-blue-100 text-blue-700",
  Disclosure: "bg-amber-100 text-amber-700",
  Inspection: "bg-emerald-100 text-emerald-700",
  Closing: "bg-purple-100 text-purple-700",
  Warranty: "bg-cyan-100 text-cyan-700",
  Other: "bg-slate-100 text-slate-600",
};

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export default function SellerDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, notifyError } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<Document[]>("/seller/documents");
      setDocuments(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = readAuthToken();
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_BASE}/seller/documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      if (!res.ok) throw new Error("Upload failed");
      success("Document uploaded.");
      fetchData();
    } catch (e) {
      notifyError(e, "Could not upload this document.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDownload(doc: Document) {
    const token = readAuthToken();
    const res = await fetch(`${API_BASE}/seller/documents/${doc.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      notifyError(null, "Could not download this document.");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this document?")) return;
    try {
      await apiDelete(`/seller/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      notifyError(e, "Could not delete this document.");
    }
  }

  return (
    <SellerLayout title="Documents" subtitle="Manage your listing and transaction documents.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
            <button onClick={fetchData} className="ml-3 underline font-semibold">Retry</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{documents.length} documents</span>
              <label className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition cursor-pointer">
                {uploading ? "Uploading..." : "+ Upload Document"}
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" disabled={uploading} onChange={handleUpload} />
              </label>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Document</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Size</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <span className="text-slate-500 text-lg">📄</span>
                            </div>
                            <span className="font-semibold text-[#0A2647] text-sm">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[doc.type] || TYPE_COLORS.Other}`}>{doc.type}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{doc.date}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{doc.size}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            doc.status === "Signed" ? "bg-green-100 text-green-700" :
                            doc.status === "Received" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleDownload(doc)} className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Download</button>
                            <button onClick={() => handleDelete(doc.id)} className="text-slate-400 hover:text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {documents.length === 0 && (
                <div className="p-8 text-center text-slate-400">No documents uploaded yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </SellerLayout>
  );
}
