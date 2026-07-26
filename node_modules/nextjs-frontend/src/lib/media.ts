import { API_BASE } from "@/lib/api";

/** Origin of the Laravel app (API_BASE minus the trailing /api). */
const ORIGIN = API_BASE.replace(/\/api\/?$/, "");

/**
 * Build a fully-qualified URL for a file stored on Laravel's `public` disk.
 * Accepts a stored relative path (e.g. "properties/abc.jpg") or an absolute URL.
 * Returns null for empty input so callers can fall back to a placeholder.
 */
export function storageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${ORIGIN}/storage/${path.replace(/^\/+/, "")}`;
}
