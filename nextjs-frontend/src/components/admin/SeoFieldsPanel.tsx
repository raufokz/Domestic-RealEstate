"use client";

import { useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";

export interface SeoFieldsValue {
  seo_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  secondary_keywords?: string[] | null;
  canonical_url?: string | null;
  robots_index?: boolean;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  json_ld_override?: string | null;
  faq_schema?: { question: string; answer: string }[] | null;
  breadcrumb_title?: string | null;
}

interface SeoFieldsPanelProps {
  value: SeoFieldsValue;
  onChange: (patch: Partial<SeoFieldsValue>) => void;
  titleFallback?: string;
  urlPreview?: string;
}

export default function SeoFieldsPanel({ value, onChange, titleFallback, urlPreview }: SeoFieldsPanelProps) {
  const [open, setOpen] = useState<string | null>("basics");

  const toggle = (key: string) => setOpen(open === key ? null : key);
  const displayTitle = value.seo_title || titleFallback || "";
  const jsonLdError = validateJson(value.json_ld_override);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-heading font-bold text-sm text-[#0A2647]">SEO &amp; Social</h3>
      </div>

      <Section id="basics" open={open} onToggle={toggle} label="Search Appearance">
        <Field label={`Meta Title (${displayTitle.length}/60)`}>
          <input
            type="text"
            value={value.seo_title ?? ""}
            onChange={(e) => onChange({ seo_title: e.target.value })}
            placeholder={titleFallback}
            className="admin-input"
          />
        </Field>
        <Field label={`Meta Description (${(value.meta_description ?? "").length}/160)`}>
          <textarea
            value={value.meta_description ?? ""}
            onChange={(e) => onChange({ meta_description: e.target.value })}
            rows={3}
            className="admin-input resize-none"
          />
        </Field>
        {urlPreview && (
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <p className="text-[#1a0dab] text-sm truncate">{displayTitle || "Untitled post"}</p>
            <p className="text-[#006621] text-xs truncate">{urlPreview}</p>
            <p className="text-slate-600 text-xs line-clamp-2 mt-0.5">{value.meta_description}</p>
          </div>
        )}
        <Field label="Focus Keyword">
          <input
            type="text"
            value={value.focus_keyword ?? ""}
            onChange={(e) => onChange({ focus_keyword: e.target.value })}
            className="admin-input"
          />
        </Field>
        <Field label="Secondary Keywords (comma-separated)">
          <input
            type="text"
            value={(value.secondary_keywords ?? []).join(", ")}
            onChange={(e) =>
              onChange({ secondary_keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
            className="admin-input"
          />
        </Field>
        <Field label="Canonical URL">
          <input
            type="text"
            value={value.canonical_url ?? ""}
            onChange={(e) => onChange({ canonical_url: e.target.value })}
            placeholder={urlPreview}
            className="admin-input"
          />
        </Field>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={value.robots_index ?? true}
            onChange={(e) => onChange({ robots_index: e.target.checked })}
          />
          Allow search engines to index this page (robots: index)
        </label>
        <Field label="Breadcrumb Title (defaults to post title)">
          <input
            type="text"
            value={value.breadcrumb_title ?? ""}
            onChange={(e) => onChange({ breadcrumb_title: e.target.value })}
            className="admin-input"
          />
        </Field>
      </Section>

      <Section id="social" open={open} onToggle={toggle} label="Open Graph &amp; Twitter">
        <Field label="OG Title">
          <input type="text" value={value.og_title ?? ""} onChange={(e) => onChange({ og_title: e.target.value })} className="admin-input" />
        </Field>
        <Field label="OG Description">
          <textarea value={value.og_description ?? ""} onChange={(e) => onChange({ og_description: e.target.value })} rows={2} className="admin-input resize-none" />
        </Field>
        <ImageUrlField label="OG Image" url={value.og_image} onChange={(url) => onChange({ og_image: url })} />
        <Field label="Twitter Title">
          <input type="text" value={value.twitter_title ?? ""} onChange={(e) => onChange({ twitter_title: e.target.value })} className="admin-input" />
        </Field>
        <Field label="Twitter Description">
          <textarea value={value.twitter_description ?? ""} onChange={(e) => onChange({ twitter_description: e.target.value })} rows={2} className="admin-input resize-none" />
        </Field>
        <ImageUrlField label="Twitter Image" url={value.twitter_image} onChange={(url) => onChange({ twitter_image: url })} />
      </Section>

      <Section id="schema" open={open} onToggle={toggle} label="Structured Data">
        <Field label="FAQ Schema (question / answer pairs)">
          <FaqEditor items={value.faq_schema ?? []} onChange={(faq_schema) => onChange({ faq_schema })} />
        </Field>
        <Field label={`JSON-LD Override (advanced, raw JSON)${jsonLdError ? " — " + jsonLdError : ""}`}>
          <textarea
            value={value.json_ld_override ?? ""}
            onChange={(e) => onChange({ json_ld_override: e.target.value })}
            rows={4}
            placeholder='{"@context":"https://schema.org", ...}'
            className={`admin-input font-mono text-xs resize-none ${jsonLdError ? "border-red-400" : ""}`}
          />
        </Field>
      </Section>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          color: #0f172a;
        }
        .admin-input:focus {
          outline: none;
          border-color: #c9a227;
          box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.15);
        }
      `}</style>
    </div>
  );
}

function validateJson(raw?: string | null): string | null {
  if (!raw || !raw.trim()) return null;
  try {
    JSON.parse(raw);
    return null;
  } catch {
    return "invalid JSON";
  }
}

function Section({
  id,
  open,
  onToggle,
  label,
  children,
}: {
  id: string;
  open: string | null;
  onToggle: (id: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  const isOpen = open === id;
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
      >
        {label}
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ImageUrlField({ label, url, onChange }: { label: string; url?: string | null; onChange: (url: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded border border-dashed border-slate-300 shrink-0" />
        )}
        <button type="button" onClick={() => setPickerOpen(true)} className="text-xs font-semibold text-[#0A2647] underline">
          {url ? "Change" : "Choose from Library"}
        </button>
        {url && (
          <button type="button" onClick={() => onChange("")} className="text-xs font-semibold text-red-600 underline">
            Remove
          </button>
        )}
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(file) => onChange(file.url)} />
    </Field>
  );
}

function FaqEditor({
  items,
  onChange,
}: {
  items: { question: string; answer: string }[];
  onChange: (items: { question: string; answer: string }[]) => void;
}) {
  const update = (i: number, patch: Partial<{ question: string; answer: string }>) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-2 space-y-1.5">
          <input
            type="text"
            placeholder="Question"
            value={item.question}
            onChange={(e) => update(i, { question: e.target.value })}
            className="admin-input"
          />
          <textarea
            placeholder="Answer"
            value={item.answer}
            onChange={(e) => update(i, { answer: e.target.value })}
            rows={2}
            className="admin-input resize-none"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-[11px] font-semibold text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { question: "", answer: "" }])}
        className="text-xs font-semibold text-[#0A2647] underline"
      >
        + Add FAQ item
      </button>
    </div>
  );
}
