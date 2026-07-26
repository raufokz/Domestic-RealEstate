import { API_BASE } from "@/lib/api";

/**
 * Shape of a public blog post returned by GET /blogs and GET /blogs/{slug}.
 * Mirrors the `blogs` table + the `category` / `author` relations eager-loaded
 * by BlogController::index() and ::show().
 */
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  /** Admin-authored HTML (the admin editor is a raw HTML textarea). */
  content?: string | null;
  featured_image?: string | null;
  status: "draft" | "published" | "scheduled";
  published_at?: string | null;
  created_at?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  reading_time?: number | null;
  tags?: string[] | null;
  category?: { id: number; name?: string; slug?: string } | null;
  author?: { id: number; name?: string; email?: string } | null;
}

/**
 * Result wrapper so callers can tell "no posts published yet" apart from
 * "the API is unreachable" — the two need different UI, and collapsing them
 * into an empty array is exactly the silent-failure pattern we avoid.
 */
export interface BlogListResult {
  posts: BlogPost[];
  error: string | null;
}

/** Fetch published posts on the server. Newest first, per BlogController::index(). */
export async function getBlogPosts(perPage = 12): Promise<BlogListResult> {
  try {
    const res = await fetch(`${API_BASE}/blogs?per_page=${perPage}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return { posts: [], error: `Could not load articles (server responded ${res.status}).` };
    }
    const data = await res.json();
    // index() returns a Laravel paginator: { data: [...], current_page, ... }
    const posts = (Array.isArray(data) ? data : data?.data ?? []) as BlogPost[];
    return { posts, error: null };
  } catch {
    return { posts: [], error: "Could not reach the content service. Please try again shortly." };
  }
}

/** Fetch one published post by slug. Returns null when missing (→ 404). */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

/**
 * Posts related to `post`, preferring the same category and falling back to
 * most-recent. The public index endpoint takes no category filter, so we
 * filter the recent list here rather than inventing a query param.
 */
export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const { posts } = await getBlogPosts(24);
  const others = posts.filter((p) => p.id !== post.id);
  const sameCategory = post.category?.id
    ? others.filter((p) => p.category?.id === post.category?.id)
    : [];
  const merged = [...sameCategory, ...others.filter((p) => !sameCategory.includes(p))];
  return merged.slice(0, limit);
}

/** "July 20, 2026" — falls back to the empty string when no date is set. */
export function formatBlogDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** "6 min read", or the empty string when the backend didn't compute one. */
export function formatReadingTime(minutes?: number | null): string {
  return minutes && minutes > 0 ? `${minutes} min read` : "";
}

/** Initials for the author avatar, e.g. "Sarah Kim" -> "SK". */
export function authorInitials(name?: string | null): string {
  if (!name) return "DR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Short teaser: the stored excerpt, or the first 180 chars of the body text. */
export function postExcerpt(post: BlogPost): string {
  if (post.excerpt) return post.excerpt;
  const text = (post.content ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 180 ? `${text.slice(0, 180)}…` : text;
}
