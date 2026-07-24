"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/Toast";

interface SeoPageItem {
  id: number;
  title: string;
  slug: string;
  city: string;
  state: string;
  status: "Published" | "Draft" | "Scheduled";
  published: string;
  metaTitle?: string;
  metaDescription?: string;
}

const initialPages: SeoPageItem[] = [
  { id: 1, title: "Homes for Sale in Beverly Hills", slug: "/homes-for-sale-beverly-hills", status: "Published", city: "Beverly Hills", state: "CA", published: "2024-09-15", metaTitle: "Beverly Hills Luxury Real Estate", metaDescription: "Find exclusive luxury homes and estates in Beverly Hills CA." },
  { id: 2, title: "Luxury Real Estate in Malibu", slug: "/luxury-real-estate-malibu", status: "Published", city: "Malibu", state: "CA", published: "2024-09-20", metaTitle: "Malibu Beachfront Properties", metaDescription: "Explore luxury oceanfront homes and beach estates in Malibu." },
  { id: 3, title: "Downtown LA Apartments", slug: "/downtown-la-apartments", status: "Draft", city: "Los Angeles", state: "CA", published: "", metaTitle: "Downtown LA Modern Condos", metaDescription: "Urban high-rise apartments & condos in Downtown LA." },
  { id: 4, title: "Pasadena Family Homes", slug: "/pasadena-family-homes", status: "Published", city: "Pasadena", state: "CA", published: "2024-10-01", metaTitle: "Pasadena Family Real Estate", metaDescription: "Charming family residences near Old Town Pasadena." },
  { id: 5, title: "Big Bear Lake Properties", slug: "/big-bear-lake-properties", status: "Scheduled", city: "Big Bear Lake", state: "CA", published: "2024-10-30", metaTitle: "Big Bear Mountain Cabins", metaDescription: "Mountain cabins and lakefront retreats in Big Bear Lake." },
  { id: 6, title: "Hollywood Hills Mansions", slug: "/hollywood-hills-mansions", status: "Published", city: "Hollywood", state: "CA", published: "2024-10-05", metaTitle: "Hollywood Hills Luxury Estates", metaDescription: "Celebrity-grade luxury mansions with views of Los Angeles." },
  { id: 7, title: "Santa Monica Beach Houses", slug: "/santa-monica-beach-houses", status: "Draft", city: "Santa Monica", state: "CA", published: "", metaTitle: "Santa Monica Coastal Living", metaDescription: "Oceanfront homes and condos in Santa Monica." },
  { id: 8, title: "Woodland Hills Condos", slug: "/woodland-hills-condos", status: "Published", city: "Woodland Hills", state: "CA", published: "2024-10-08", metaTitle: "Woodland Hills Real Estate", metaDescription: "Modern townhomes and condos in Woodland Hills." },
];

const statusColors: Record<string, string> = {
  Published: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
  Scheduled: "bg-blue-100 text-blue-800",
};

export default function SeoPagesPage() {
  const [pagesList, setPagesList] = useState<SeoPageItem[]>(initialPages);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { success, info } = useToast();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    city: "",
    state: "CA",
    status: "Draft" as "Published" | "Draft" | "Scheduled",
    metaTitle: "",
    metaDescription: "",
  });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      city: "",
      state: "CA",
      status: "Draft",
      metaTitle: "",
      metaDescription: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (page: SeoPageItem) => {
    setEditingId(page.id);
    setForm({
      title: page.title,
      slug: page.slug,
      city: page.city,
      state: page.state,
      status: page.status,
      metaTitle: page.metaTitle || page.title,
      metaDescription: page.metaDescription || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setPagesList((prev) => prev.filter((p) => p.id !== id));
      success(`SEO Page "${title}" deleted.`, "Page Removed");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) return;

    let formattedSlug = form.slug.trim();
    if (!formattedSlug.startsWith("/")) {
      formattedSlug = "/" + formattedSlug;
    }

    if (editingId !== null) {
      setPagesList((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: form.title,
                slug: formattedSlug,
                city: form.city,
                state: form.state,
                status: form.status,
                metaTitle: form.metaTitle,
                metaDescription: form.metaDescription,
              }
            : p
        )
      );
      success(`SEO Page "${form.title}" updated successfully!`, "SEO Page Saved");
    } else {
      const newPage: SeoPageItem = {
        id: Date.now(),
        title: form.title,
        slug: formattedSlug,
        city: form.city,
        state: form.state,
        status: form.status,
        published: form.status === "Published" ? new Date().toISOString().split("T")[0] : "",
        metaTitle: form.metaTitle || form.title,
        metaDescription: form.metaDescription,
      };
      setPagesList((prev) => [newPage, ...prev]);
      success(`New SEO Page "${form.title}" created!`, "SEO Page Created");
    }

    setIsModalOpen(false);
  };

  const filtered = pagesList.filter((p) => {
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout title="SEO Landing Pages">
      {/* Top Actions & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search SEO pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-1.5">
            {["All", "Draft", "Published", "Scheduled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? "bg-[#0A2647] text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-bold hover:bg-[#b8911f] transition shadow-sm flex items-center gap-2"
        >
          <span>+</span> Create New SEO Page
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A2647] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Published Date</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No SEO pages found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{page.title}</p>
                      {page.metaTitle && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{page.metaTitle}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-blue-600 font-mono">{page.slug}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs font-medium">{page.city}, {page.state}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${statusColors[page.status]}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{page.published || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(page)}
                          className="text-[#C9A227] hover:text-[#0A2647] text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(page.id, page.title)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit SEO Page */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold text-[#0A2647]">
                {editingId ? "Edit SEO Page" : "Create New SEO Page"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Condos in Downtown Miami"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    if (!editingId && !form.slug) {
                      setForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug: "/" + e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      }));
                    }
                  }}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="/luxury-condos-miami"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Miami"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    placeholder="FL"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Meta Title</label>
                <input
                  type="text"
                  placeholder="Meta title for Google search results"
                  value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for search engines..."
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-bold hover:bg-[#0d3366] transition shadow-md"
                >
                  {editingId ? "Save Changes" : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

