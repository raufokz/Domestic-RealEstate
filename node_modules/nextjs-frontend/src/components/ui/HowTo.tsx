"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

export interface HowToStep {
  /** Short imperative instruction, e.g. "Upload a CSV or XLSX file." */
  text: string;
  /** Optional clarifying detail shown under the step in smaller type. */
  detail?: string;
}

export interface HowToProps {
  /** e.g. "How to Import Leads" — rendered as the panel heading. */
  title: string;
  /** One-line statement of what the user will accomplish. */
  summary?: string;
  steps: (HowToStep | string)[];
  /** Things that will block the user if not done first. */
  requirements?: string[];
  /** Optional deep link to a settings page the task depends on. */
  actionUrl?: string;
  actionLabel?: string;
  /** Collapsed by default keeps dense admin screens calm; open for first-run pages. */
  defaultOpen?: boolean;
  /** Extra content (tips, format examples) rendered below the steps. */
  children?: ReactNode;
  className?: string;
}

/**
 * Inline "how do I use this screen?" guidance.
 *
 * Rendered directly on the page rather than hidden in docs, per the platform
 * requirement that complex screens explain themselves to non-technical users.
 * Uses a native <details>-style disclosure built from a button + region so the
 * open state is controllable and announced to assistive technology.
 */
export default function HowTo({
  title,
  summary,
  steps,
  requirements,
  actionUrl,
  actionLabel = "Open settings",
  defaultOpen = false,
  children,
  className = "",
}: HowToProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `howto-${title.replace(/\W+/g, "-").toLowerCase()}`;

  const normalized: HowToStep[] = steps.map((s) =>
    typeof s === "string" ? { text: s } : s
  );

  return (
    <section
      className={`rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/5 ${className}`}
      aria-labelledby={`${panelId}-heading`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-5 py-4 text-left transition-colors hover:bg-[#C9A227]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A227]/20 text-base"
            aria-hidden="true"
          >
            💡
          </span>
          <span className="min-w-0">
            <span
              id={`${panelId}-heading`}
              className="block font-heading text-sm font-bold text-[#0A2647]"
            >
              {title}
            </span>
            {summary && (
              <span className="block text-xs text-slate-600 mt-0.5">{summary}</span>
            )}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-[#0A2647]">
          {open ? "Hide" : "Show me how"}
        </span>
      </button>

      {open && (
        <div id={panelId} className="border-t border-[#C9A227]/25 px-5 py-4">
          {requirements && requirements.length > 0 && (
            <div className="mb-4 rounded-lg bg-white/70 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#0A2647] mb-2">
                Before you start
              </p>
              <ul className="space-y-1">
                {requirements.map((r) => (
                  <li key={r} className="flex gap-2 text-xs text-slate-700">
                    <span className="text-[#C9A227]" aria-hidden="true">
                      •
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ol className="space-y-3">
            {normalized.map((step, i) => (
              <li key={step.text} className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A2647] text-[11px] font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-sm text-slate-800 leading-snug">
                    {step.text}
                  </span>
                  {step.detail && (
                    <span className="mt-0.5 block text-xs text-slate-500 leading-snug">
                      {step.detail}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>

          {children && <div className="mt-4">{children}</div>}

          {actionUrl && (
            <Link
              href={actionUrl}
              className="mt-4 inline-flex items-center gap-1 rounded-lg bg-[#0A2647] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d3366] transition-colors"
            >
              {actionLabel} →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
