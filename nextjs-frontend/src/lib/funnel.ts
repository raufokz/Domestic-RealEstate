/** sessionStorage autosave for progressive funnel wizards — free, client-only,
 * satisfies "back button preserves answers" / "survives a refresh" without
 * any server round-trip. Session-scoped only (cleared on tab close), which
 * is appropriate since the real persistence is the server-side Lead row
 * created at the checkpoint screen. */

export interface FunnelDraft {
  step: number;
  token?: string;
  answers: Record<string, unknown>;
}

function key(funnel: string): string {
  return `funnel_draft_${funnel}`;
}

export function saveFunnelDraft(funnel: string, draft: FunnelDraft): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key(funnel), JSON.stringify(draft));
  } catch {
    // Storage full/unavailable — non-fatal, autosave is a convenience.
  }
}

export function loadFunnelDraft(funnel: string): FunnelDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key(funnel));
    return raw ? (JSON.parse(raw) as FunnelDraft) : null;
  } catch {
    return null;
  }
}

export function clearFunnelDraft(funnel: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key(funnel));
  } catch {
    // Non-fatal.
  }
}

export const CONSENT_TEXT =
  "By continuing, you agree that a licensed real estate professional may contact you by phone, text, or email about your request. Consent is not a condition of any purchase.";
export const CONSENT_VERSION = "v1";
