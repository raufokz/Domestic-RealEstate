"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  status: string;
}

const FALLBACK_DATA: Document[] = [
  { id: 1, name: "Tax Return 2025 — Schedule E", type: "Tax Document", date: "Apr 15, 2026", size: "1.2 MB", status: "Ready" },
  { id: 2, name: "Rental Agreement — Riverside Complex", type: "Rental Agreement", date: "Jan 1, 2026", size: "450 KB", status: "Active" },
  { id: 3, name: "Insurance Policy — Beach Rental", type: "Insurance", date: "Mar 1, 2026", size: "890 KB", status: "Active" },
  { id: 4, name: "Q2 2026 Financial Report", type: "Financial Report", date: "Jul 1, 2026", size: "2.3 MB", status: "Ready" },
  { id: 5, name: "Property Tax Assessment — Dallas", type: "Tax Document", date: "Feb 15, 2026", size: "320 KB", status: "Paid" },
  { id: 6, name: "Lease Agreement — Downtown Office", type: "Rental Agreement", date: "Jun 1, 2026", size: "580 KB", status: "Active" },
  { id: 7, name: "Depreciation Schedule 2026", type: "Financial Report", date: "Jan 1, 2026", size: "1.1 MB", status: "Ready" },
];

const TYPE_COLORS: Record<string, string> = {
  "Tax Document": "bg-blue-100 text-blue-700",
  "Rental Agreement": "bg-emerald-100 text-emerald-700",
  "Insurance": "bg-purple-100 text-purple-700",
  "Financial Report": "bg-amber-100 text-amber-700",
};

export default function InvestorDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<Document[]>("/investor/documents");
        setDocuments(result);
      } catch {
        setDocuments(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <InvestorLayout title="Documents" subtitle="Manage your investment documents and records.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{documents.length} documents</span>
              <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                + Upload Document
              </button>
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
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[doc.type] || "bg-slate-100 text-slate-600"}`}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{doc.date}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{doc.size}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            doc.status === "Ready" || doc.status === "Active" || doc.status === "Paid" ? "bg-green-100 text-green-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-[#0A2647] hover:text-[#C9A227] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">View</button>
                            <button className="text-slate-400 hover:text-[#0A2647] text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition">Download</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </InvestorLayout>
  );
}
