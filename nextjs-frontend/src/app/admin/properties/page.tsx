"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";
import PropertyImageManager, { PropertyImage } from "@/components/property/PropertyImageManager";

interface Property {
  id: number;
  title: string;
  description?: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  status: string;
  approval_status: string;
  featured?: boolean;
  property_type?: { name: string } | null;
  realtor?: { name?: string; first_name?: string; last_name?: string } | null;
  images?: PropertyImage[];
}

interface Paginated {
  data: Property[];
  current_page: number;
  last_page: number;
  total: number;
}

const emptyForm = {
  title: "",
  description: "",
  price: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  approval_status: "approved",
  status: "active",
};

export default function PropertiesPage() {
  const { success, notifyError } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });
      if (tab !== "all") params.set("status", tab);
      const data = await apiGet<Paginated>(`/admin/properties?${params}`);
      setProperties(data.data || []);
      setLastPage(data.last_page || 1);
    } catch (err) {
      notifyError(err, "Properties could not be loaded.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [page, tab, notifyError]);

  useEffect(() => {
    void fetchProperties();
  }, [fetchProperties]);

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      p.title?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setForm({
      title: p.title || "",
      description: p.description || "",
      price: String(p.price || ""),
      address: p.address || "",
      city: p.city || "",
      state: p.state || "",
      zip: p.zip || "",
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
      sqft: p.sqft != null ? String(p.sqft) : "",
      approval_status: p.approval_status || "approved",
      status: p.status || "active",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.price || !form.address || !form.city) {
      notifyError(new Error("Title, price, address, and city are required."));
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: form.title,
        description: form.description || form.title,
        price: Number(form.price),
        address: form.address,
        city: form.city,
        state: form.state || "CA",
        zip: form.zip || "00000",
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        sqft: form.sqft ? Number(form.sqft) : null,
        approval_status: form.approval_status,
        status: form.status,
      };
      if (editing) {
        await apiPut(`/admin/properties/${editing.id}`, payload);
        success("Property updated.", "Properties");
        setShowModal(false);
      } else {
        const created = await apiPost<{ data: Property }>("/admin/properties", payload);
        success("Property created. Now add some photos.", "Properties");
        setEditing(created.data);
      }
      await fetchProperties();
    } catch (err) {
      notifyError(err, "Property could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleApproval = async (id: number, approval_status: string) => {
    try {
      await apiPost(`/admin/properties/${id}/approval`, { approval_status });
      success(`Property ${approval_status}.`, "Properties");
      await fetchProperties();
    } catch (err) {
      notifyError(err, "Approval update failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this property?")) return;
    try {
      await apiDelete(`/admin/properties/${id}`);
      success("Property deleted.", "Properties");
      await fetchProperties();
    } catch (err) {
      notifyError(err, "Property could not be deleted.");
    }
  };

  const agentName = (p: Property) =>
    p.realtor?.name ||
    [p.realtor?.first_name, p.realtor?.last_name].filter(Boolean).join(" ") ||
    "—";

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <AdminLayout title="Property Management">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm rounded-lg font-medium ${
                tab === t.id ? "bg-navy text-white" : "bg-white text-slate-600 border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search properties..."
          className="flex-1 px-4 py-2 border rounded-lg text-sm"
        />
        <Link
          href="/admin/properties/create"
          className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold"
        >
          + Create Property
        </Link>
        <Link
          href="/admin/properties/import"
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          📁 Import
        </Link>
        <button onClick={openCreate} className="px-4 py-2 border rounded-lg text-sm font-medium">
          Quick Add
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading properties...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            No properties found. Create your first listing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm">Property</th>
                  <th className="px-4 py-3 text-left text-sm">Price</th>
                  <th className="px-4 py-3 text-left text-sm">Beds/Baths</th>
                  <th className="px-4 py-3 text-left text-sm">Agent</th>
                  <th className="px-4 py-3 text-left text-sm">Approval</th>
                  <th className="px-4 py-3 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {p.address}, {p.city}, {p.state}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">{money(p.price)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {p.bedrooms ?? "—"} / {p.bathrooms ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">{agentName(p)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100 capitalize">
                        {p.approval_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {p.approval_status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproval(p.id, "approved")}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(p.id, "rejected")}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEdit(p)}
                          className="px-2 py-1 border text-xs rounded text-navy"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-2 py-1 border border-red-200 text-red-600 text-xs rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lastPage > 1 && (
          <div className="flex justify-between p-4 border-t text-sm">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">
              Prev
            </button>
            <span>
              Page {page} / {lastPage}
            </span>
            <button disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className={`bg-white rounded-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto ${editing ? "max-w-2xl" : "max-w-lg"}`}>
            <h3 className="text-lg font-bold text-navy">{editing ? "Edit Property" : "Add Property"}</h3>
            {(["title", "address", "city", "state", "zip", "price", "bedrooms", "bathrooms", "sqft"] as const).map(
              (field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              )
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">
                {editing ? "Close" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {editing && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-navy mb-3">Photos</h4>
                <PropertyImageManager propertyId={editing.id} initialImages={editing.images ?? []} />
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
