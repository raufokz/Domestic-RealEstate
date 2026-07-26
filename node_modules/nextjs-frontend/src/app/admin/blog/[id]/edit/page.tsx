"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface BlogPost {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  status?: string;
  seo_title?: string;
  meta_description?: string;
}

export default function EditBlogPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { success, notifyError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "draft",
    seo_title: "",
    meta_description: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const post = await apiGet<BlogPost>(`/admin/blog/posts/${id}`);
        setForm({
          title: post.title || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          status: post.status || "draft",
          seo_title: post.seo_title || "",
          meta_description: post.meta_description || "",
        });
      } catch (err) {
        notifyError(err, "Blog post could not be loaded.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, notifyError]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiPut(`/admin/blog/posts/${id}`, form);
      success("Blog post updated.", "Blog");
      router.push("/admin/blog");
    } catch (err) {
      notifyError(err, "Blog post could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Blog Post">
        <div className="py-16 text-center text-slate-500">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Blog Post">
      <div className="max-w-3xl space-y-4 bg-white rounded-xl shadow-sm p-6">
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 min-h-[240px]"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded-lg text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
