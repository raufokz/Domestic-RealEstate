"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function CreateBlogPage() {
  const router = useRouter();
  const { success, notifyError } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "draft",
    seo_title: "",
    meta_description: "",
  });

  const handleSave = async () => {
    if (!form.title || !form.content) {
      notifyError(new Error("Title and content are required."));
      return;
    }
    try {
      setSaving(true);
      await apiPost("/admin/blog/posts", {
        ...form,
        seo_title: form.seo_title || form.title,
        meta_description: form.meta_description || form.excerpt,
      });
      success("Blog post created.", "Blog");
      router.push("/admin/blog");
    } catch (err) {
      notifyError(err, "Blog post could not be created.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Create Blog Post">
      <div className="max-w-3xl space-y-4 bg-white rounded-xl shadow-sm p-6">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Excerpt"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 min-h-[240px]"
          placeholder="Content (HTML allowed)"
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
        </select>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="SEO title"
          value={form.seo_title}
          onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Meta description"
          value={form.meta_description}
          onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
        />
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded-lg text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Post"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
