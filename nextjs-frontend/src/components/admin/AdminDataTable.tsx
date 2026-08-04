"use client";

import { useEffect, useState } from "react";
import BulkActionBar, { BulkAction } from "@/components/admin/BulkActionBar";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface AdminDataTableProps<T extends { id: number | string }> {
  columns: ColumnDef<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  filters?: FilterDef[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;

  sort?: string;
  direction?: "asc" | "desc";
  onSortChange?: (key: string) => void;

  page: number;
  lastPage: number;
  total?: number;
  onPageChange: (page: number) => void;

  selectable?: boolean;
  selectedIds?: (number | string)[];
  onSelectionChange?: (ids: (number | string)[]) => void;
  bulkActions?: BulkAction[];

  emptyMessage?: string;
  rowActions?: (row: T) => React.ReactNode;
}

/** Generic admin list: server-driven search/filter/sort/pagination + optional bulk-select. */
export default function AdminDataTable<T extends { id: number | string }>({
  columns,
  rows,
  loading,
  error,
  onRetry,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  filterValues,
  onFilterChange,
  sort,
  direction,
  onSortChange,
  page,
  lastPage,
  total,
  onPageChange,
  selectable,
  selectedIds = [],
  onSelectionChange,
  bulkActions,
  emptyMessage = "No results found.",
  rowActions,
}: AdminDataTableProps<T>) {
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => setSearchDraft(search), [search]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchDraft !== search) onSearchChange(searchDraft);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : rows.map((r) => r.id));
  };

  const toggleOne = (id: number | string) => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full sm:w-72 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0A2647]"
        />
        {filters && filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <select
                key={f.key}
                value={filterValues?.[f.key] ?? ""}
                onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700"
              >
                <option value="">{f.label}: All</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      {selectable && bulkActions && (
        <BulkActionBar selectedIds={selectedIds} actions={bulkActions} onClear={() => onSelectionChange?.([])} />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6">
            <p className="text-red-600 text-sm font-medium mb-3">{error}</p>
            {onRetry && (
              <button onClick={onRetry} className="text-xs font-bold text-[#0A2647] underline">
                Retry
              </button>
            )}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-400">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0A2647] text-white text-xs uppercase tracking-wider">
                <tr>
                  {selectable && (
                    <th className="w-10 px-3 py-3">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th key={col.key} className={`text-left px-4 py-3 font-bold ${col.className ?? ""}`}>
                      {col.sortable && onSortChange ? (
                        <button
                          type="button"
                          onClick={() => onSortChange(col.key)}
                          className="flex items-center gap-1 hover:text-[#C9A227]"
                        >
                          {col.label}
                          {sort === col.key && <span>{direction === "asc" ? "▲" : "▼"}</span>}
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                  {rowActions && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {selectable && (
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleOne(row.id)} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                        {col.render(row)}
                      </td>
                    ))}
                    {rowActions && <td className="px-4 py-3 text-right whitespace-nowrap">{rowActions(row)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && lastPage > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-500">
            Page {page} of {lastPage}
            {total !== undefined ? ` · ${total} total` : ""}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
