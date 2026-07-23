"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

interface BlogAuthor {
  id: number;
  first_name: string;
  last_name: string;
}

interface BlogCategory {
  id: number;
  name: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  published_at: string | null;
  created_at: string;
  reading_time: number;
  category: BlogCategory | null;
  author: BlogAuthor | null;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const statusFilters = ["All", "Draft", "Published", "Archived"];

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  archived: "bg-red-100 text-red-800",
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchPosts = useCallback(async (page: number, status: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "15");
      if (status !== "All") {
        params.set("status", status.toLowerCase());
      }
      const res = await apiGet<PaginatedResponse<BlogPost>>(`/admin/blog/posts?${params.toString()}`);
      setPosts(res.data);
      setTotalPages(res.last_page);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage, statusFilter);
  }, [currentPage, statusFilter, fetchPosts]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    try {
      await apiDelete(`/admin/blog/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (id: number) => {
    setToggling(id);
    try {
      const updated = await apiPost<BlogPost>(`/admin/blog/posts/${id}/publish`);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: updated.status, published_at: updated.published_at } : p)));
    } catch {
      // silent
    } finally {
      setToggling(null);
    }
  };

  return (
    <AdminLayout title="Blog Management">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#0A2647] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <Link
          href="/admin/blog/create"
          className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
        >
          + Create New Blog
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A2647] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Author</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Published</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">No posts found.</td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{post.title}</p>
                      {post.reading_time > 0 && (
                        <p className="text-xs text-gray-400">{post.reading_time} min read</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {post.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full ${statusColors[post.status] || "bg-gray-100 text-gray-700"}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {post.author ? `${post.author.first_name} ${post.author.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/blog/${post.id}/edit`} className="text-[#C9A227] hover:text-[#0A2647] text-sm font-medium">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(post.id)}
                          disabled={toggling === post.id}
                          className="text-[#0A2647] hover:text-[#C9A227] text-sm font-medium disabled:opacity-50"
                        >
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deleting === post.id}
                          className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          {deleting === post.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
