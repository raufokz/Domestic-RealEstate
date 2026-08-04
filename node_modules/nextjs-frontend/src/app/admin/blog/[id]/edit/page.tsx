"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import BlogForm, { BlogFormPost } from "@/components/admin/blog/BlogForm";

export default function EditBlogPage() {
  const params = useParams();
  const id = params.id as string;
  const { notifyError } = useToast();
  const [post, setPost] = useState<BlogFormPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<BlogFormPost>(`/admin/blog/posts/${id}`);
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load this post.");
          notifyError(err, "Blog post could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AdminLayout title="Edit Blog Post">
      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading…</div>
      ) : error || !post ? (
        <div className="py-16 text-center text-red-600 text-sm">{error ?? "Post not found."}</div>
      ) : (
        <BlogForm post={post} />
      )}
    </AdminLayout>
  );
}
