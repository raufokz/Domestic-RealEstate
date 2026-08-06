"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiPut, apiDelete, ApiError, API_BASE } from "@/lib/api";
import { useToast } from "@/components/Toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import HtmlBlogViewer from "@/components/blog/HtmlBlogViewer";
import SeoFieldsPanel, { SeoFieldsValue } from "@/components/admin/SeoFieldsPanel";
import ImageUploader, { UploadedImage } from "@/components/admin/ImageUploader";
import MediaPicker from "@/components/admin/MediaPicker";

interface Category {
  id: number;
  name: string;
}

interface AuthorOption {
  id: number;
  name: string;
  role: string;
}

interface Revision {
  id: number;
  created_at: string;
  author: { id: number; name: string } | null;
  data: Record<string, unknown>;
}

export interface BlogFormPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category_id: number | null;
  categories?: Category[];
  author_id: number | null;
  co_author_id: number | null;
  tags: string[] | null;
  status: string;
  scheduled_at: string | null;
  is_featured: boolean;
  is_trending: boolean;
  is_popular: boolean;
  is_editors_choice: boolean;
  featured_image: string | null;
  featured_image_alt: string | null;
  featured_image_caption: string | null;
  featured_image_credit: string | null;
  images?: { id: number; url: string; webp_url: string | null; alt_text: string | null; caption: string | null; credit: string | null }[];
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[] | null;
  canonical_url: string | null;
  robots_index: boolean;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  json_ld_override: string | null;
  faq_schema: { question: string; answer: string }[] | null;
  breadcrumb_title: string | null;
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  category_ids: number[];
  author_id: string;
  co_author_id: string;
  tags: string;
  status: string;
  scheduled_at: string;
  is_featured: boolean;
  is_trending: boolean;
  is_popular: boolean;
  is_editors_choice: boolean;
  featured_image: string;
  featured_image_alt: string;
  featured_image_caption: string;
  featured_image_credit: string;
  seo: SeoFieldsValue;
}

function toFormState(post?: BlogFormPost | null): FormState {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    category_id: post?.category_id ? String(post.category_id) : "",
    category_ids: (post?.categories ?? []).map((c) => c.id),
    author_id: post?.author_id ? String(post.author_id) : "",
    co_author_id: post?.co_author_id ? String(post.co_author_id) : "",
    tags: (post?.tags ?? []).join(", "),
    status: post?.status ?? "draft",
    scheduled_at: post?.scheduled_at ? post.scheduled_at.slice(0, 16) : "",
    is_featured: post?.is_featured ?? false,
    is_trending: post?.is_trending ?? false,
    is_popular: post?.is_popular ?? false,
    is_editors_choice: post?.is_editors_choice ?? false,
    featured_image: post?.featured_image ?? "",
    featured_image_alt: post?.featured_image_alt ?? "",
    featured_image_caption: post?.featured_image_caption ?? "",
    featured_image_credit: post?.featured_image_credit ?? "",
    seo: {
      seo_title: post?.seo_title ?? "",
      meta_description: post?.meta_description ?? "",
      focus_keyword: post?.focus_keyword ?? "",
      secondary_keywords: post?.secondary_keywords ?? [],
      canonical_url: post?.canonical_url ?? "",
      robots_index: post?.robots_index ?? true,
      og_title: post?.og_title ?? "",
      og_description: post?.og_description ?? "",
      og_image: post?.og_image ?? "",
      twitter_title: post?.twitter_title ?? "",
      twitter_description: post?.twitter_description ?? "",
      twitter_image: post?.twitter_image ?? "",
      json_ld_override: post?.json_ld_override ?? "",
      faq_schema: post?.faq_schema ?? [],
      breadcrumb_title: post?.breadcrumb_title ?? "",
    },
  };
}

function wordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

export default function BlogForm({ post }: { post?: BlogFormPost | null }) {
  const router = useRouter();
  const { success, notifyError } = useToast();
  const isEdit = !!post;

  const [form, setForm] = useState<FormState>(() => toFormState(post));
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [images, setImages] = useState<UploadedImage[]>(
    (post?.images ?? []).map((img) => ({ id: img.id, url: img.webp_url || img.url, alt_text: img.alt_text, caption: img.caption, credit: img.credit }))
  );
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);
  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);

  useEffect(() => {
    apiGet<{ data: Category[] }>("/admin/blog-categories")
      .then((r) => setCategories(r.data))
      .catch(() => setCategories([]));
    apiGet<{ data: AuthorOption[] }>("/admin/users?per_page=100")
      .then((r) => setAuthors(r.data.filter((u) => ["admin", "super_admin", "staff", "agent", "broker"].includes(u.role))))
      .catch(() => setAuthors([]));
  }, []);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const wc = useMemo(() => wordCount(form.content), [form.content]);
  const readingTime = Math.max(1, Math.ceil(wc / 200));
  const publicUrl = `https://domesticrealestate.us/blog/${form.slug || "your-post-slug"}`;

  const buildPayload = () => ({
    title: form.title,
    slug: form.slug || undefined,
    excerpt: form.excerpt || undefined,
    content: form.content,
    category_id: form.category_id ? Number(form.category_id) : null,
    category_ids: form.category_ids,
    author_id: form.author_id ? Number(form.author_id) : undefined,
    co_author_id: form.co_author_id ? Number(form.co_author_id) : null,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    status: form.status,
    scheduled_at: form.status === "scheduled" && form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
    is_featured: form.is_featured,
    is_trending: form.is_trending,
    is_popular: form.is_popular,
    is_editors_choice: form.is_editors_choice,
    featured_image: form.featured_image || null,
    featured_image_alt: form.featured_image_alt || null,
    featured_image_caption: form.featured_image_caption || null,
    featured_image_credit: form.featured_image_credit || null,
    seo_title: form.seo.seo_title || null,
    meta_description: form.seo.meta_description || null,
    focus_keyword: form.seo.focus_keyword || null,
    secondary_keywords: form.seo.secondary_keywords,
    canonical_url: form.seo.canonical_url || null,
    robots_index: form.seo.robots_index,
    og_title: form.seo.og_title || null,
    og_description: form.seo.og_description || null,
    og_image: form.seo.og_image || null,
    twitter_title: form.seo.twitter_title || null,
    twitter_description: form.seo.twitter_description || null,
    twitter_image: form.seo.twitter_image || null,
    json_ld_override: form.seo.json_ld_override || null,
    faq_schema: form.seo.faq_schema,
    breadcrumb_title: form.seo.breadcrumb_title || null,
  });

  const handleSubmit = async (statusOverride?: string) => {
    if (!form.title.trim()) {
      notifyError(new Error("Title is required."));
      return;
    }
    setSaving(true);
    try {
      const payload = { ...buildPayload(), ...(statusOverride ? { status: statusOverride } : {}) };
      if (isEdit) {
        await apiPut(`/admin/blog/posts/${post!.id}`, payload);
        success("Post updated.");
        router.refresh();
      } else {
        const created = await apiPost<{ id: number }>("/admin/blog/posts", payload);
        success("Post created.");
        router.push(`/admin/blog/${created.id}/edit`);
      }
    } catch (e) {
      notifyError(e, "Could not save this post.");
    } finally {
      setSaving(false);
    }
  };

  // --- Gallery (edit mode only — needs a real post id) ---

  async function uploadGalleryImages(files: FileList | File[]) {
    if (!isEdit) return;
    setGalleryUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("image", file);
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const res = await fetch(`${API_BASE}/admin/blog/posts/${post!.id}/images`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
          body: fd,
        });
        if (!res.ok) throw new ApiError("Upload failed", res.status);
        const img = await res.json();
        setImages((prev) => [...prev, { id: img.id, url: img.webp_url || img.url }]);
      }
      success("Image(s) added to gallery.");
    } catch (e) {
      notifyError(e, "Could not upload gallery image.");
    } finally {
      setGalleryUploading(false);
    }
  }

  async function deleteGalleryImage(id: number | string) {
    if (!isEdit) return;
    const prev = images;
    setImages((cur) => cur.filter((i) => i.id !== id));
    try {
      await apiDelete(`/admin/blog/posts/${post!.id}/images/${id}`);
    } catch (e) {
      setImages(prev);
      notifyError(e, "Could not delete image.");
    }
  }

  async function reorderGallery(orderedIds: (number | string)[]) {
    if (!isEdit) return;
    const byId = new Map(images.map((i) => [i.id, i]));
    setImages(orderedIds.map((id) => byId.get(id)!).filter(Boolean));
    try {
      await apiPost(`/admin/blog/posts/${post!.id}/images/reorder`, { order: orderedIds });
    } catch (e) {
      notifyError(e, "Could not save image order.");
    }
  }

  async function updateGalleryImageMeta(id: number | string, meta: { alt_text?: string; caption?: string; credit?: string }) {
    if (!isEdit) return;
    try {
      await apiPut(`/admin/blog/posts/${post!.id}/images/${id}`, meta);
      setImages((cur) => cur.map((i) => (i.id === id ? { ...i, ...meta } : i)));
      success("Image details saved.");
    } catch (e) {
      notifyError(e, "Could not save image details.");
    }
  }

  // --- Revisions (edit mode only) ---

  async function loadRevisions() {
    if (!isEdit) return;
    setShowRevisions(true);
    if (revisions) return;
    try {
      const data = await apiGet<Revision[]>(`/admin/blog/posts/${post!.id}/revisions`);
      setRevisions(data);
    } catch (e) {
      notifyError(e, "Could not load revision history.");
    }
  }

  async function restoreRevision(revisionId: number) {
    if (!isEdit) return;
    if (!confirm("Restore this version? Your current unsaved edits will be lost.")) return;
    try {
      await apiPost(`/admin/blog/posts/${post!.id}/revisions/${revisionId}/restore`);
      success("Revision restored.");
      router.refresh();
    } catch (e) {
      notifyError(e, "Could not restore this revision.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-lg font-semibold text-[#0A2647]"
              placeholder="Post title"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Slug <span className="font-normal normal-case text-slate-400">(leave blank to auto-generate)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0">/blog/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                placeholder={form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => patch({ excerpt: e.target.value })}
              rows={2}
              placeholder="Short summary shown on cards and search results (auto-generated from content if left blank)"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Content</label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-2">
                  <button
                    type="button"
                    onClick={() => setEditorTab("edit")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${editorTab === "edit" ? "bg-white text-[#0A2647] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${editorTab === "preview" ? "bg-white text-[#0A2647] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    👁️ Live Preview
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {wc} words · {readingTime} min read
                </span>
                <button
                  type="button"
                  onClick={() => setFullPreviewOpen(true)}
                  className="px-2.5 py-1 text-xs font-bold text-[#8C6D27] bg-[#F5F0E6] border border-[#E3DAC9] rounded-lg hover:bg-[#EBE3D3] transition"
                >
                  ↗ Full Screen Preview
                </button>
              </div>
            </div>

            {editorTab === "edit" ? (
              <RichTextEditor value={form.content} onChange={(content) => patch({ content })} placeholder="Write your article…" />
            ) : (
              <div className="bg-[#FDFBF7] border border-[#EBE6DD] rounded-2xl p-6 sm:p-8 min-h-[350px]">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C6D27] mb-4 pb-2 border-b border-[#EBE6DD] flex items-center justify-between">
                  <span>Sanitized Live HTML Renderer</span>
                  <span className="text-slate-400 font-normal">Matches live site 1:1</span>
                </div>
                <HtmlBlogViewer content={form.content} enableLightbox />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => patch({ tags: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm"
              placeholder="market-trends, first-time-buyers, mortgage"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-heading font-bold text-sm text-[#0A2647] mb-3">Gallery Images</h3>
          {isEdit ? (
            <ImageUploader
              images={images}
              multiple
              uploading={galleryUploading}
              onUpload={uploadGalleryImages}
              onDelete={deleteGalleryImage}
              onReorder={reorderGallery}
              onUpdateMeta={updateGalleryImageMeta}
              helpText="Drag to reorder. JPG, PNG, WEBP."
            />
          ) : (
            <p className="text-sm text-slate-400">Save the post first to add gallery images.</p>
          )}
        </div>

        <SeoFieldsPanel value={form.seo} onChange={(patchVal) => patch({ seo: { ...form.seo, ...patchVal } })} titleFallback={form.title} urlPreview={publicUrl} />

        {isEdit && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <button type="button" onClick={loadRevisions} className="text-sm font-bold text-[#0A2647] underline">
              {showRevisions ? "Hide" : "View"} Revision History
            </button>
            {showRevisions && (
              <div className="mt-3 space-y-2">
                {!revisions ? (
                  <p className="text-xs text-slate-400">Loading…</p>
                ) : revisions.length === 0 ? (
                  <p className="text-xs text-slate-400">No previous versions saved yet — revisions are captured every time you edit this post.</p>
                ) : (
                  revisions.map((rev) => (
                    <div key={rev.id} className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-600">
                        {new Date(rev.created_at).toLocaleString()} — {rev.author?.name ?? "Unknown"}
                      </span>
                      <button onClick={() => restoreRevision(rev.id)} className="text-xs font-bold text-[#C9A227]">
                        Restore
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#0A2647]">Publish</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
            <select value={form.status} onChange={(e) => patch({ status: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          {form.status === "scheduled" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Publish At</label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => patch({ scheduled_at: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit("draft")}
              className="w-full py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(form.status === "scheduled" ? "scheduled" : "published")}
              className="w-full py-2.5 rounded-lg bg-[#C9A227] text-[#0A2647] text-sm font-bold hover:bg-[#b8911f] disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Update" : form.status === "scheduled" ? "Schedule" : "Publish"}
            </button>
            {isEdit && (
              <Link href={`/blog/${post!.slug}`} target="_blank" className="w-full text-center py-2 text-xs font-semibold text-slate-500 hover:text-[#0A2647]">
                Preview live post →
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#0A2647]">Editorial Flags</h3>
          <ToggleRow label="Featured" checked={form.is_featured} onChange={(v) => patch({ is_featured: v })} />
          <ToggleRow label="Trending" checked={form.is_trending} onChange={(v) => patch({ is_trending: v })} />
          <ToggleRow label="Popular" checked={form.is_popular} onChange={(v) => patch({ is_popular: v })} />
          <ToggleRow label="Editor's Choice" checked={form.is_editors_choice} onChange={(v) => patch({ is_editors_choice: v })} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#0A2647]">Categorization</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Primary Category</label>
            <select value={form.category_id} onChange={(e) => patch({ category_id: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Secondary Categories</label>
            <select
              multiple
              value={form.category_ids.map(String)}
              onChange={(e) => patch({ category_ids: Array.from(e.target.selectedOptions).map((o) => Number(o.value)) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-24"
            >
              {categories
                .filter((c) => String(c.id) !== form.category_id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#0A2647]">Authorship</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Author</label>
            <select value={form.author_id} onChange={(e) => patch({ author_id: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">(You)</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Co-Author</label>
            <select value={form.co_author_id} onChange={(e) => patch({ co_author_id: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">None</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#0A2647]">Featured Image</h3>
          <div className="flex items-center gap-3">
            {form.featured_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.featured_image} alt="" className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
            ) : (
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300" />
            )}
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => setFeaturedPickerOpen(true)} className="text-xs font-semibold text-[#0A2647] underline text-left">
                {form.featured_image ? "Replace" : "Choose Image"}
              </button>
              {form.featured_image && (
                <button type="button" onClick={() => patch({ featured_image: "" })} className="text-xs font-semibold text-red-600 underline text-left">
                  Remove
                </button>
              )}
            </div>
          </div>
          <input
            type="text"
            placeholder="Alt text"
            value={form.featured_image_alt}
            onChange={(e) => patch({ featured_image_alt: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
          <input
            type="text"
            placeholder="Caption"
            value={form.featured_image_caption}
            onChange={(e) => patch({ featured_image_caption: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
          <input
            type="text"
            placeholder="Credit"
            value={form.featured_image_credit}
            onChange={(e) => patch({ featured_image_credit: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
          <MediaPicker open={featuredPickerOpen} onClose={() => setFeaturedPickerOpen(false)} onSelect={(file) => patch({ featured_image: file.url })} />
        </div>
      </div>

      {/* Full-Screen Live Article Preview Modal */}
      {fullPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] overflow-y-auto flex flex-col items-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-5xl bg-[#FDFBF7] rounded-3xl border border-[#EBE6DD] shadow-2xl overflow-hidden my-auto flex flex-col">
            {/* Modal Top Bar */}
            <div className="bg-[#0A2647] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <span className="bg-[#C9A227] text-[#0A2647] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                  Live CMS Preview
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">
                  Exact visual parity with live frontend
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFullPreviewOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Article Simulation Container */}
            <div className="p-6 sm:p-10 lg:p-12 space-y-8">
              {/* Header */}
              <div>
                {categories.find((c) => String(c.id) === form.category_id)?.name && (
                  <span className="text-[11px] font-extrabold bg-[#F5F0E6] text-[#8C6D27] border border-[#E3DAC9] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-4">
                    {categories.find((c) => String(c.id) === form.category_id)?.name}
                  </span>
                )}
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A2647] leading-tight mb-4">
                  {form.title || "Untitled Article"}
                </h1>
                {form.excerpt && (
                  <p className="font-serif italic text-stone-600 text-lg sm:text-xl leading-relaxed border-l-2 border-[#C9A227] pl-4 mb-6">
                    {form.excerpt}
                  </p>
                )}
                <div className="text-xs text-stone-500 font-medium">
                  {readingTime} min read · {wc} words
                </div>
              </div>

              {/* Featured Image */}
              {form.featured_image && (
                <div className="rounded-2xl overflow-hidden border border-[#EBE6DD] max-h-[400px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.featured_image} alt={form.featured_image_alt || ""} className="w-full h-full object-cover" />
                  {form.featured_image_caption && (
                    <p className="text-xs text-stone-500 italic p-3 text-center bg-white border-t border-[#EBE6DD]">
                      {form.featured_image_caption} {form.featured_image_credit && `(${form.featured_image_credit})`}
                    </p>
                  )}
                </div>
              )}

              {/* Sanitized Main Content */}
              <div className="bg-white rounded-2xl border border-[#EBE6DD] p-6 sm:p-10 shadow-xs">
                <HtmlBlogViewer content={form.content} enableLightbox />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-sm text-slate-600">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
