import type { ReactNode } from "react";
import Link from "next/link";

export interface LegalSection {
  /** Stable anchor id, e.g. "information-we-collect". */
  id: string;
  heading: string;
  body: ReactNode;
}

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: ReactNode;
  sections: LegalSection[];
  /** Shows the "template — review with counsel" banner on binding legal docs. */
  templateNotice?: boolean;
}

/**
 * Accessible, consistent shell for legal / policy documents.
 *
 * - Breadcrumb navigation landmark (Home › Legal › <title>)
 * - Correct heading order: single <h1>, section <h2>s (no skipped levels)
 * - In-page table of contents with anchor links + scroll-margin targets
 * - Optional counsel-review notice for binding documents
 */
export default function LegalDocument({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
  templateNotice = false,
}: LegalDocumentProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 font-body">
            <li>
              <Link href="/" className="hover:text-[#0A2647] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded">
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-[#0A2647] font-semibold" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>

        <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-card font-body">
          <header>
            <span className="text-[#C9A227] text-xs font-heading font-extrabold uppercase tracking-widest block mb-1">
              {eyebrow}
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#0A2647]">{title}</h1>
            <p className="text-xs text-slate-500 mt-2">
              Last updated: <time>{lastUpdated}</time>
            </p>
          </header>

          {templateNotice && (
            <div
              role="note"
              className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <span aria-hidden="true" className="text-lg leading-none">⚠️</span>
              <p>
                <strong>Template document.</strong> This policy is a professionally structured starting point
                and is <strong>not legal advice</strong>. Have it reviewed and adapted by qualified counsel for
                your jurisdiction before publishing or relying on it.
              </p>
            </div>
          )}

          <div className="mt-6 text-sm sm:text-base text-slate-700 leading-relaxed">{intro}</div>

          {/* Table of contents */}
          <nav aria-label="On this page" className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <h2 className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-500 mb-3">
              On this page
            </h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-slate-600 hover:text-[#C9A227] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded inline-flex gap-2"
                  >
                    <span className="text-slate-400 tabular-nums">{i + 1}.</span>
                    <span>{s.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="mt-8 space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
                <h2
                  id={`${s.id}-h`}
                  className="text-lg sm:text-xl font-heading font-bold text-[#0A2647] mb-3"
                >
                  <span className="text-[#C9A227]">{i + 1}.</span> {s.heading}
                </h2>
                <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed [&_a]:text-[#C9A227] [&_a]:font-semibold [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-[#0A2647]">
                  {s.body}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-12 pt-6 border-t border-slate-200 text-sm text-slate-500">
            <p>
              Questions about this document? Contact{" "}
              <a
                href="mailto:admin@domesticrealestate.us"
                className="text-[#C9A227] font-semibold underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded"
              >
                admin@domesticrealestate.us
              </a>
              .
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
