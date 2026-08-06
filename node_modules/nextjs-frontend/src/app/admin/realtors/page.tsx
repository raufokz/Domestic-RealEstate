"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { apiGet, ApiError } from "@/lib/api";

interface RealtorApplicationRow {
  id: number;
  reference: string;
  full_name: string;
  email: string;
  phone: string | null;
  brokerage_name: string | null;
  license_number: string;
  license_state: string;
  status: "pending" | "under_review" | "more_info_requested" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  more_info_requested: "bg-purple-100 text-purple-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

export default function AdminRealtorApplicationsPage() {
  const [applications, setApplications] = useState<RealtorApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "20");
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await apiGet<PaginatedResponse<RealtorApplicationRow>>(`/admin/realtor-applications?${params.toString()}`);
      setApplications(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load realtor applications.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void (async () => {
      await fetchApplications();
    })();
  }, [fetchApplications]);

  const [prevFilters, setPrevFilters] = useState({ search, status });
  if (prevFilters.search !== search || prevFilters.status !== status) {
    setPrevFilters({ search, status });
    setPage(1);
  }

  const columns: ColumnDef<RealtorApplicationRow>[] = [
    {
      key: "full_name",
      label: "Applicant",
      render: (r) => (
        <div>
          <p className="font-bold text-[#0A2647]">{r.full_name}</p>
          <p className="text-[11px] text-slate-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: "brokerage_name",
      label: "Brokerage / License",
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-800">{r.brokerage_name || "—"}</p>
          <p className="text-[11px] text-slate-500">
            License: {r.license_number} ({r.license_state})
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusColors[r.status]}`}>
          {r.status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "submitted_at",
      label: "Submitted",
      render: (r) => <span className="text-slate-500 text-xs">{new Date(r.submitted_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <AdminLayout title="Realtor Applications &amp; Verification">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A2647]">Realtor Applications &amp; Verification</h1>
            <p className="text-slate-500 text-xs mt-1">Review license documentation, approve, reject, or request more information.</p>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
            {applications.filter((r) => r.status === "pending").length} pending on this page
          </span>
        </div>

        <AdminDataTable
          columns={columns}
          rows={applications}
          loading={loading}
          error={error}
          onRetry={fetchApplications}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, email, or license #…"
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "pending", label: "Pending" },
                { value: "under_review", label: "Under Review" },
                { value: "more_info_requested", label: "More Info Requested" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ],
            },
          ]}
          filterValues={{ status }}
          onFilterChange={(key, value) => key === "status" && setStatus(value)}
          page={page}
          lastPage={lastPage}
          total={total}
          onPageChange={setPage}
          emptyMessage="No realtor applications yet."
          rowActions={(r) => (
            <Link href={`/admin/realtors/${r.id}`} className="text-xs font-bold text-[#C9A227] hover:text-[#0A2647]">
              Review
            </Link>
          )}
        />
      </div>
    </AdminLayout>
  );
}
