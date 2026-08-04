"use client";

export interface BulkAction {
  label: string;
  onRun: (ids: (number | string)[]) => void | Promise<void>;
  variant?: "default" | "danger";
  confirm?: string;
}

interface BulkActionBarProps {
  selectedIds: (number | string)[];
  actions: BulkAction[];
  onClear: () => void;
}

export default function BulkActionBar({ selectedIds, actions, onClear }: BulkActionBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#0A2647] text-white rounded-xl px-4 py-2.5 mb-3 shadow-md">
      <span className="text-sm font-semibold">{selectedIds.length} selected</span>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              if (action.confirm && !window.confirm(action.confirm)) return;
              void action.onRun(selectedIds);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              action.variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#C9A227] text-[#0A2647] hover:bg-[#b8911f]"
            }`}
          >
            {action.label}
          </button>
        ))}
        <button type="button" onClick={onClear} className="text-xs font-semibold text-slate-300 hover:text-white px-2">
          Clear
        </button>
      </div>
    </div>
  );
}
