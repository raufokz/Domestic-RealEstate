"use client";

import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/Toast";
import { apiPost } from "@/lib/api";

interface AgentRow {
  name: string;
  email: string;
  phone?: string;
  brokerage_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface ImportResponse {
  success: boolean;
  message: string;
  batch_id?: number;
  count: number;
  updated: number;
  failed: number;
}

/** Columns the parser understands, in the order it expects them. */
const COLUMNS = ["name", "email", "phone", "brokerage_name", "address", "city", "state", "zip"] as const;

const STATE_ABBR: Record<string, string> = {
  california: "CA", "new york": "NY", texas: "TX", florida: "FL", virginia: "VA",
  maryland: "MD", pennsylvania: "PA", "new jersey": "NJ", arizona: "AZ", nevada: "NV",
  georgia: "GA", illinois: "IL", "north carolina": "NC", colorado: "CO", washington: "WA",
};

/**
 * Email may be plain, or embedded in a directory contact-form URL.
 *
 * The embedded form is checked FIRST. A bare address regex run over a URL such
 * as `...contactme.aspx?formid=3&AgentEmailAddress=jane@x.com` matches from the
 * start of the path, because a URL contains no spaces or commas to stop it —
 * so the "plain" pattern also excludes /?=& to keep it inside one address.
 */
function extractEmail(cell: string): string {
  const embedded = cell.match(/EmailAddress=([^&'"\s]+)/i);
  if (embedded) {
    const decoded = decodeURIComponent(embedded[1]).trim().toLowerCase();
    if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(decoded)) return decoded;
  }
  const direct = cell.match(/[^\s,;<>"'/?=&]+@[^\s,;<>"'/?=&]+\.[a-z]{2,}/i);
  return direct ? direct[0].toLowerCase() : "";
}

/** "Pasadena, California 91106" -> city / state / zip. */
function splitLocation(cell: string) {
  const m = cell.match(/^(.*),\s*([A-Za-z .]+?)\s+(\d{5})(?:-\d{4})?$/);
  if (!m) return null;
  const raw = m[2].trim();
  return {
    city: m[1].trim(),
    state: raw.length === 2 ? raw.toUpperCase() : STATE_ABBR[raw.toLowerCase()] || raw,
    zip: m[3],
  };
}

/**
 * Parse pasted spreadsheet rows.
 *
 * Fields are located by shape rather than by column position, because exports
 * from agent directories are ragged — a missing phone shifts every later column
 * left, and a strict positional parser silently files the brokerage as the zip.
 */
function parseRows(text: string): { rows: AgentRow[]; skipped: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const rows: AgentRow[] = [];
  let skipped = 0;

  /*
   * Pick one delimiter for the whole paste. Splitting on tab AND comma tore
   * "Santa Ana, California 92705" into two cells, so the location parser never
   * saw a complete value and every city/state came through empty.
   */
  const isTabbed = lines.some((l) => l.includes("\t"));

  for (const line of lines) {
    const cells = (isTabbed ? line.split("\t") : line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)).map((c) =>
      c.trim().replace(/^"|"$/g, "")
    );

    // Skip a header row if the user pasted one.
    if (/^name$/i.test(cells[0] || "") && cells.some((c) => /^email$/i.test(c))) continue;

    const email = extractEmail(line);
    const name = (cells[0] || "").trim();
    if (!name || !email) {
      skipped++;
      continue;
    }

    const locCell = cells.find((c) => splitLocation(c));
    const loc = locCell ? splitLocation(locCell) : null;
    const phoneCell = cells.find((c) => {
      const d = c.replace(/\D/g, "");
      return d.length === 10 && !/^0+$/.test(d);
    });

    rows.push({
      name,
      email,
      phone: phoneCell || "",
      // The brokerage is the longest cell that is not the name, a URL, or a location.
      brokerage_name:
        cells
          .slice(1)
          .filter((c) => c && !/^https?:|@|^\d/.test(c) && c !== locCell && c.length > 3)
          .sort((a, b) => b.length - a.length)[0] || "",
      address: cells.find((c) => /^\d+\s+\w/.test(c) && c !== locCell) || "",
      city: loc?.city || "",
      state: loc?.state || "",
      zip: loc?.zip || "",
    });
  }

  return { rows, skipped };
}

export default function RealtorImportPage() {
  const { success, notifyError } = useToast();
  const [raw, setRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);

  const { rows, skipped } = useMemo(() => parseRows(raw), [raw]);

  const handleImport = async () => {
    if (rows.length === 0) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await apiPost<ImportResponse>("/admin/realtors/import-paste", { agents: rows });
      setResult(res);
      success(res.message, "Import complete");
      setRaw("");
    } catch (err) {
      notifyError(err, "Import failed. Nothing was saved.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Import Realtors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <header>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0A2647] dark:text-white">
            Import Realtors
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Paste rows straight from a spreadsheet. Imported realtors are saved as
            pending and stay off the public directory until you approve them.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-[#0A2647] dark:text-white mb-2">Expected columns</h2>
          <div className="overflow-x-auto">
            <code className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {COLUMNS.join("  |  ")}
            </code>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Only <strong>name</strong> and <strong>email</strong> are required. Columns are matched by
            content, so extra or reordered columns are fine. Emails inside contact-form links are
            picked up automatically.
          </p>
        </section>

        <div>
          <label htmlFor="paste-area" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            Paste rows
          </label>
          <textarea
            id="paste-area"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder={"Jane Smith\tjane@example.com\t(555) 123-4567\tCentury 21\t12 Oak St\tAustin, Texas 78701"}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-[16px] sm:text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]"
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
            {raw.trim() === ""
              ? "Tab-separated or CSV both work."
              : `${rows.length} realtor${rows.length === 1 ? "" : "s"} ready` +
                (skipped > 0 ? ` · ${skipped} row${skipped === 1 ? "" : "s"} skipped (missing name or email)` : "")}
          </p>
        </div>

        {/* Preview: lets the operator catch a mis-parsed column before writing. */}
        {rows.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[#0A2647] dark:text-white mb-2">
              Preview{rows.length > 5 ? ` (first 5 of ${rows.length})` : ""}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    {["Name", "Email", "Phone", "Brokerage", "City", "State"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="bg-white dark:bg-slate-800">
                      <td className="px-3 py-2 whitespace-nowrap text-slate-800 dark:text-slate-100">{r.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.email}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.phone || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.brokerage_name || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.city || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.state || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={rows.length === 0 || submitting}
            className="min-h-[48px] px-6 rounded-lg bg-[#C9A227] text-[#07162C] font-bold text-sm hover:bg-[#B59123] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
          >
            {submitting ? "Importing…" : `Import ${rows.length || ""} realtor${rows.length === 1 ? "" : "s"}`.trim()}
          </button>
          {raw.trim() !== "" && (
            <button
              type="button"
              onClick={() => { setRaw(""); setResult(null); }}
              disabled={submitting}
              className="min-h-[48px] px-6 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
            >
              Clear
            </button>
          )}
        </div>

        {result && (
          <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 p-4">
            <p className="text-sm text-emerald-900 dark:text-emerald-200">{result.message}</p>
            {result.failed > 0 && result.batch_id && (
              <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                Batch #{result.batch_id} — open import history to download the failed rows.
              </p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
