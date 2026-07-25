'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

/**
 * Top admin status strip — shows AI/email readiness without exposing vendor names.
 */
export default function SystemStatusBar() {
  const [items, setItems] = useState<{ label: string; ok: boolean; hint: string }[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: { label: string; ok: boolean; hint: string }[] = [];
      try {
        const agents = await apiGet<{ is_active?: boolean }[] | { data?: unknown }>('/admin/ai-agents');
        const list = Array.isArray(agents) ? agents : [];
        const active = list.filter((a) => a.is_active !== false).length;
        next.push({
          label: 'AI Agents',
          ok: active > 0,
          hint: active > 0 ? `${active} active` : 'None active — enable in AI Agents',
        });
      } catch {
        next.push({ label: 'AI Agents', ok: false, hint: 'Could not load — check API' });
      }

      try {
        await apiGet('/admin/email-settings');
        next.push({ label: 'Email', ok: true, hint: 'Settings reachable' });
      } catch {
        next.push({ label: 'Email', ok: false, hint: 'Configure SMTP in Email Settings' });
      }

      if (!cancelled) setItems(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (hidden || items.length === 0) return null;

  const hasIssue = items.some((i) => !i.ok);

  return (
    <div
      className={`w-full px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 ${
        hasIssue ? 'bg-amber-50 text-amber-900 border-b border-amber-200' : 'bg-slate-50 text-slate-700 border-b border-slate-200'
      }`}
    >
      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <strong className="font-semibold">{item.label}:</strong> {item.hint}
          </span>
        ))}
      </div>
      <button type="button" onClick={() => setHidden(true)} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
