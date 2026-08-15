import type { ReactNode } from "react";
import Link from "next/link";

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  /** Single emoji or short glyph shown above the message. */
  icon?: string;
  title: string;
  message?: string;
  action?: EmptyStateAction;
  className?: string;
  children?: ReactNode;
}

/**
 * Generic "nothing here" state for search results, lists, and dashboards.
 * Never used to paper over a failed request — that's ErrorState's job.
 */
export default function EmptyState({
  icon = "📭",
  title,
  message,
  action,
  className = "",
  children,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 ${className}`}
    >
      <span className="text-4xl mb-3" aria-hidden="true">
        {icon}
      </span>
      <h3 className="font-heading text-base font-bold text-[#0A2647] mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-500 max-w-sm mb-4">{message}</p>}
      {children}
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#0A2647] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d3366] transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#0A2647] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d3366] transition-colors"
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
