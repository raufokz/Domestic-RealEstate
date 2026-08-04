"use client";

const COLORS: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-200 text-slate-700",
  scheduled: "bg-amber-100 text-amber-800",
  archived: "bg-slate-100 text-slate-500",
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${color}`}>
      {status}
    </span>
  );
}
