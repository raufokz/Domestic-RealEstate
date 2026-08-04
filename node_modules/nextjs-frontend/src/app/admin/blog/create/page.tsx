"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import BlogForm from "@/components/admin/blog/BlogForm";

export default function CreateBlogPage() {
  return (
    <AdminLayout title="Create Blog Post">
      <BlogForm post={null} />
    </AdminLayout>
  );
}
