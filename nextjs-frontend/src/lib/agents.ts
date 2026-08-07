import { API_BASE } from "@/lib/api";
import type { PublicProperty } from "@/lib/properties";

/** Shape of a public agent profile returned by GET /agents and /agents/{slug}. */
export interface PublicAgent {
  id: number;
  user_id: number;
  slug: string;
  headline?: string | null;
  bio?: string | null;
  brokerage_name?: string | null;
  license_number?: string | null;
  years_experience?: number;
  specialties?: string[] | null;
  service_areas?: string[] | null;
  office_city?: string | null;
  office_state?: string | null;
  office_phone?: string | null;
  office_email?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  website?: string | null;
  cover_photo?: string | null;
  company_logo?: string | null;
  social_links?: Record<string, string | null | undefined> | null;
  languages?: string[] | null;
  certifications?: string[] | null;
  awards?: string[] | null;
  designations?: string[] | null;
  nar_membership?: boolean;
  realtor_membership?: boolean;
  rating?: string | number;
  review_count?: number;
  sales_count?: number;
  is_featured?: boolean;
  user?: {
    id: number;
    name?: string;
    email?: string;
    phone?: string | null;
    avatar?: string | null;
  } | null;
  lead_type_preferences?: {
    budget?: string | null;
    leads?: string[] | null;
    pricing_plan?: string | null;
  } | null;
  listings?: PublicProperty[];
}

interface Paginated<T> {
  data: T[];
}

/** Fetch a list of published, approved agents on the server. */
export async function getAgents(
  query: Record<string, string | number | undefined> = {},
  limit = 12
): Promise<PublicAgent[]> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  params.set("per_page", String(limit));
  try {
    const res = await fetch(`${API_BASE}/agents?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Paginated<PublicAgent> | PublicAgent[];
    return Array.isArray(data) ? data : data.data ?? [];
  } catch {
    return [];
  }
}

/** Fetch a single agent profile (with active listings) by slug. Returns null only on a
 * real 404 — any other failure throws, so a transient API outage never masquerades as
 * "this agent doesn't exist" (which `revalidate: 300` would then cache for 5 minutes). */
export async function getAgentBySlug(slug: string): Promise<PublicAgent | null> {
  const res = await fetch(`${API_BASE}/agents/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load agent "${slug}" (HTTP ${res.status})`);
  return (await res.json()) as PublicAgent;
}

/** Display name for an agent, falling back gracefully. */
export function agentName(agent: PublicAgent): string {
  return agent.user?.name || "Domestic Real Estate Agent";
}

/** Two-letter initials for an agent's avatar fallback. */
export function agentInitials(agent: PublicAgent): string {
  return agentName(agent)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
