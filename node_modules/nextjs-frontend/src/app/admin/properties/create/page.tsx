"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function CreatePropertyPage() {
  const router = useRouter();
  const { success, notifyError } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    price: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    year_built: "",
    parking_spaces: "",
    approval_status: "approved",
    status: "active",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiPost("/admin/properties", {
        ...form,
        description: form.description || form.title,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        sqft: form.sqft ? Number(form.sqft) : null,
        year_built: form.year_built ? Number(form.year_built) : null,
        parking_spaces: form.parking_spaces ? Number(form.parking_spaces) : null,
      });
      success("Property created.", "Properties");
      router.push("/admin/properties");
    } catch (err) {
      notifyError(err, "Property could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <AdminLayout title="Create Property">
      <div className="max-w-3xl mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700">
        <h3 className="font-semibold text-sm text-[#0A2647] flex items-center gap-2 mb-2">
          <span>💡</span> Property Creation Guidelines
        </h3>
        <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
          <li><strong>Basic Info:</strong> Provide a clear title, accurate listing price, and descriptive property summary.</li>
          <li><strong>Location:</strong> Full address, city, state, and ZIP code ensure correct Google Maps rendering.</li>
          <li><strong>Approval:</strong> Set status to <em>Approved</em> to make the listing immediately active on public portals.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy">Basic Information</h2>
          <div>
            <label className={labelClass}>Title *</label>
            <input required className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price *</label>
              <input required type="number" className={inputClass} value={form.price} onChange={(e) => update("price", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Approval</label>
              <select className={inputClass} value={form.approval_status} onChange={(e) => update("approval_status", e.target.value)}>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy">Location</h2>
          <div>
            <label className={labelClass}>Address *</label>
            <input required className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>City *</label>
              <input required className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input required className={inputClass} value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ZIP *</label>
              <input required className={inputClass} value={form.zip} onChange={(e) => update("zip", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy">Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["bedrooms", "bathrooms", "sqft", "year_built", "parking_spaces"] as const).map((f) => (
              <div key={f}>
                <label className={labelClass}>{f.replace("_", " ")}</label>
                <input type="number" className={inputClass} value={form[f]} onChange={(e) => update(f, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border rounded-lg text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-gold text-navy rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Property"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
