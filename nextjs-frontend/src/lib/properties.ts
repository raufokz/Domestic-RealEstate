import { API_BASE } from "@/lib/api";

/** Shape of a public property returned by GET /properties/{slug}. */
export interface PublicProperty {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  price?: string | number | null;
  price_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | string | null;
  sqft?: number | null;
  lot_size?: string | number | null;
  year_built?: number | null;
  parking_spaces?: number | null;
  hoa_fees?: string | number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  neighborhood?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photos?: string[] | null;
  gallery?: string[] | null;
  amenities?: string[] | null;
  video_url?: string | null;
  virtual_tour_url?: string | null;
  featured?: boolean;
  premium?: boolean;
  view_count?: number;
  propertyType?: { id: number; name?: string; slug?: string } | null;
  realtor?: {
    id: number;
    name?: string;
    email?: string;
    agentProfile?: { slug?: string; headline?: string | null } | null;
  } | null;
}

/** Fetch a list of public properties on the server with optional query filters. */
export async function getProperties(
  query: Record<string, string | number | boolean | undefined> = {},
  limit = 9
): Promise<PublicProperty[]> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  params.set("per_page", String(limit));
  try {
    const res = await fetch(`${API_BASE}/properties?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // index() returns a paginator ({ data: [...] }); featured/premium return bare arrays.
    return (Array.isArray(data) ? data : data.data ?? []) as PublicProperty[];
  } catch {
    return [];
  }
}

/** Fetch a single public property by slug on the server. Returns null if missing. */
export async function getPropertyBySlug(slug: string): Promise<PublicProperty | null> {
  try {
    const res = await fetch(`${API_BASE}/properties/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicProperty;
  } catch {
    return null;
  }
}

/** Format a numeric price as USD, e.g. "$1,250,000". Falls back to "Contact for price". */
export function formatPrice(price?: string | number | null): string {
  if (price === null || price === undefined || price === "") return "Contact for price";
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (!isFinite(n) || n <= 0) return "Contact for price";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

/** Numeric price or undefined (for structured-data offers). */
export function priceNumber(price?: string | number | null): number | undefined {
  if (price === null || price === undefined || price === "") return undefined;
  const n = typeof price === "string" ? parseFloat(price) : price;
  return isFinite(n) && n > 0 ? n : undefined;
}
