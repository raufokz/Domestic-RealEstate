"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { apiGet, apiPost, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface BlogListItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string;
  reading_time: number;
  word_count: number;
  view_count: number;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  featured_image_alt: string | null;
  category: { id: number; name: string } | null;
  author: { id: number; name: string } | null;
  co_author: { id: number; name: string } | null;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

function seoScore(post: BlogListItem): number {
  let score = 0;
  const title = post.seo_title || post.title;
  if (title && title.length >= 10 && title.length <= 60) score++;
  if (post.meta_description && post.meta_description.length >= 50 && post.meta_description.length <= 160) score++;
  if (post.focus_keyword) score++;
  if (post.featured_image_alt) score++;
  return score;
}

function SeoScoreBadge({ post }: { post: BlogListItem }) {
  const score = seoScore(post);
  const color =
    score === 4 ? "bg-emerald-100 text-emerald-700" : score >= 2 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700";
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`} title="SEO readiness: meta title, meta description, focus keyword, image alt text">
      SEO {score}/4
    </span>
  );
}

export default function BlogPage() {
  const { success, notifyError } = useToast();
  const [tab, setTab] = useState<"posts" | "trash">("posts");

  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("created_at");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "15");
      params.set("sort", sort);
      params.set("direction", direction);
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const endpoint = tab === "trash" ? "/admin/blog/posts/trashed" : "/admin/blog/posts";
      const res = await apiGet<PaginatedResponse<BlogListItem>>(`${endpoint}?${params.toString()}`);
      setPosts(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load blog posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, sort, direction, search, status]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [tab, search, status]);

  const handleTogglePublish = async (id: number) => {
    setBusyId(id);
    try {
      await apiPost(`/admin/blog/posts/${id}/publish`);
      success("Status updated.");
      fetchPosts();
    } catch (e) {
      notifyError(e, "Could not update status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (id: number) => {
    setBusyId(id);
    try {
      await apiPost(`/admin/blog/posts/${id}/duplicate`);
      success("Post duplicated as a new draft.");
      fetchPosts();
    } catch (e) {
      notifyError(e, "Could not duplicate this post.");
    } finally {
      setBusyId(null);
    }
  };

  const handleTrash = async (id: number) => {
    if (!confirm("Move this post to trash?")) return;
    setBusyId(id);
    try {
      await apiDelete(`/admin/blog/posts/${id}`);
      success("Post moved to trash.");
      fetchPosts();
    } catch (e) {
      notifyError(e, "Could not delete this post.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (id: number) => {
    setBusyId(id);
    try {
      await apiPost(`/admin/blog/posts/${id}/restore`);
      success("Post restored.");
      fetchPosts();
    } catch (e) {
      notifyError(e, "Could not restore this post.");
    } finally {
      setBusyId(null);
    }
  };

  const handleForceDelete = async (id: number) => {
    if (!confirm("Permanently delete this post? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await apiDelete(`/admin/blog/posts/${id}/force`);
      success("Post permanently deleted.");
      fetchPosts();
    } catch (e) {
      notifyError(e, "Could not permanently delete this post.");
    } finally {
      setBusyId(null);
    }
  };

  const columns: ColumnDef<BlogListItem>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (post) => (
        <div>
          <p className="font-semibold text-slate-800">{post.title}</p>
          <p className="text-xs text-slate-400">
            {post.word_count} words · {post.reading_time} min read
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (post) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
          {post.category?.name || "Uncategorized"}
        </span>
      ),
    },
    { key: "status", label: "Status", sortable: true, render: (post) => <StatusBadge status={post.status} /> },
    { key: "seo", label: "SEO", render: (post) => <SeoScoreBadge post={post} /> },
    {
      key: "author",
      label: "Author",
      render: (post) => (
        <span className="text-slate-600">
          {post.author?.name ?? "—"}
          {post.co_author?.name ? ` + ${post.co_author.name}` : ""}
        </span>
      ),
    },
    {
      key: "view_count",
      label: "Views",
      sortable: true,
      render: (post) => <span className="text-slate-600">{post.view_count.toLocaleString()}</span>,
    },
    {
      key: "published_at",
      label: "Published",
      sortable: true,
      render: (post) => (
        <span className="text-slate-500 text-xs">
          {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Blog Management">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("posts")}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "posts" ? "bg-[#0A2647] text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Posts
          </button>
          <button
            onClick={() => setTab("trash")}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === "trash" ? "bg-[#0A2647] text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Trash
          </button>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/categories" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Categories
          </Link>
          <Link href="/admin/blog/tags" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Tags
          </Link>
          <Link href="/admin/blog/create" className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-bold hover:bg-[#b8911f]">
            + Create New Blog
          </Link>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        rows={posts}
        loading={loading}
        error={error}
        onRetry={fetchPosts}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title, slug, or focus keyword…"
        filters={
          tab === "posts"
            ? [
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { value: "draft", label: "Draft" },
                    { value: "published", label: "Published" },
                    { value: "scheduled", label: "Scheduled" },
                    { value: "archived", label: "Archived" },
                  ],
                },
              ]
            : undefined
        }
        filterValues={{ status }}
        onFilterChange={(key, value) => key === "status" && setStatus(value)}
        sort={sort}
        direction={direction}
        onSortChange={(key) => {
          if (sort === key) setDirection(direction === "asc" ? "desc" : "asc");
          else {
            setSort(key);
            setDirection("desc");
          }
        }}
        page={page}
        lastPage={lastPage}
        total={total}
        onPageChange={setPage}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        emptyMessage={tab === "trash" ? "Trash is empty." : "No posts found."}
        bulkActions={
          tab === "posts"
            ? [
                {
                  label: "Publish",
                  onRun: async (ids) => {
                    await apiPost("/admin/blog/posts/bulk-publish", { ids });
                    success(`${ids.length} post(s) published.`);
                    setSelected([]);
                    fetchPosts();
                  },
                },
                {
                  label: "Set Draft",
                  onRun: async (ids) => {
                    await apiPost("/admin/blog/posts/bulk-draft", { ids });
                    success(`${ids.length} post(s) set to draft.`);
                    setSelected([]);
                    fetchPosts();
                  },
                },
                {
                  label: "Delete",
                  variant: "danger",
                  confirm: "Move selected posts to trash?",
                  onRun: async (ids) => {
                    await apiPost("/admin/blog/posts/bulk-delete", { ids });
                    success(`${ids.length} post(s) moved to trash.`);
                    setSelected([]);
                    fetchPosts();
                  },
                },
              ]
            : [
                {
                  label: "Restore",
                  onRun: async (ids) => {
                    await apiPost("/admin/blog/posts/bulk-restore", { ids });
                    success(`${ids.length} post(s) restored.`);
                    setSelected([]);
                    fetchPosts();
                  },
                },
              ]
        }
        rowActions={(post) =>
          tab === "posts" ? (
            <div className="flex justify-end gap-3">
              <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs font-semibold text-slate-500 hover:text-[#0A2647]">
                Preview
              </Link>
              <Link href={`/admin/blog/${post.id}/edit`} className="text-xs font-semibold text-[#C9A227] hover:text-[#0A2647]">
                Edit
              </Link>
              <button
                onClick={() => handleTogglePublish(post.id)}
                disabled={busyId === post.id}
                className="text-xs font-semibold text-[#0A2647] hover:text-[#C9A227] disabled:opacity-50"
              >
                {post.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => handleDuplicate(post.id)}
                disabled={busyId === post.id}
                className="text-xs font-semibold text-slate-500 hover:text-[#0A2647] disabled:opacity-50"
              >
                Duplicate
              </button>
              <button
                onClick={() => handleTrash(post.id)}
                disabled={busyId === post.id}
                className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleRestore(post.id)}
                disabled={busyId === post.id}
                className="text-xs font-semibold text-[#0A2647] hover:text-[#C9A227] disabled:opacity-50"
              >
                Restore
              </button>
              <button
                onClick={() => handleForceDelete(post.id)}
                disabled={busyId === post.id}
                className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                Delete Forever
              </button>
            </div>
          )
        }
      />
    </AdminLayout>
  );
}
