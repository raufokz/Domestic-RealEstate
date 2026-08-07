"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SellerLayout from "@/components/seller/SellerLayout";
import { apiGet, apiPost } from "@/lib/api";
import PropertyImageManager from "@/components/property/PropertyImageManager";

interface PropertyType {
  id: number;
  name: string;
}

export default function NewSellerListingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    property_type_id: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    year_built: "",
    lot_size: "",
    parking_spaces: "",
    amenities: "",
    nearby_places: "",
  });

  useEffect(() => {
    apiGet<{ data: PropertyType[] }>("/admin/property-types")
      .then((res) => setPropertyTypes(res.data || []))
      .catch(() => setPropertyTypes([]));
  }, []);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        property_type_id: form.property_type_id ? Number(form.property_type_id) : undefined,
        price: form.price ? Number(form.price) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        sqft: form.sqft ? Number(form.sqft) : undefined,
        year_built: form.year_built ? Number(form.year_built) : undefined,
        lot_size: form.lot_size ? Number(form.lot_size) : undefined,
        parking_spaces: form.parking_spaces ? Number(form.parking_spaces) : undefined,
        amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()) : [],
        nearby_places: form.nearby_places ? form.nearby_places.split(",").map((a) => a.trim()) : [],
      };
      const created = await apiPost<{ id: number }>("/properties", payload);
      setCreatedId(created.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create listing";
      setError(msg);
    }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none text-sm text-slate-800";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  if (createdId) {
    return (
      <SellerLayout title="Add Photos" subtitle="Your listing was created">
        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#0A2647] mb-1">Listing created</h2>
            <p className="text-sm text-slate-500 mb-4">Add photos now, or skip and add them later from your listings.</p>
            <PropertyImageManager propertyId={createdId} initialImages={[]} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/seller/dashboard/listings")}
              className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
            >
              Done
            </button>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout title="Add New Listing" subtitle="Create a new property listing">
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#0A2647] mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Property Title *</label>
                <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} placeholder="e.g. Charming 3BR Family Home" required />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Describe the property features and highlights..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Property Type</label>
                  <select value={form.property_type_id} onChange={(e) => update("property_type_id", e.target.value)} className={inputClass}>
                    <option value="">Select a type…</option>
                    {propertyTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Price *</label>
                  <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className={inputClass} placeholder="e.g. 500000" required />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#0A2647] mb-5">Location</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Street Address *</label>
                <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="123 Oak Lane" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>City *</label>
                  <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} placeholder="Beverly Hills" required />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} placeholder="CA" required />
                </div>
                <div>
                  <label className={labelClass}>ZIP Code</label>
                  <input type="text" value={form.zip} onChange={(e) => update("zip", e.target.value)} className={inputClass} placeholder="90210" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#0A2647] mb-5">Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Bedrooms</label>
                <input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className={inputClass} placeholder="4" />
              </div>
              <div>
                <label className={labelClass}>Bathrooms</label>
                <input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className={inputClass} placeholder="3" />
              </div>
              <div>
                <label className={labelClass}>Square Feet</label>
                <input type="number" value={form.sqft} onChange={(e) => update("sqft", e.target.value)} className={inputClass} placeholder="2500" />
              </div>
              <div>
                <label className={labelClass}>Year Built</label>
                <input type="number" value={form.year_built} onChange={(e) => update("year_built", e.target.value)} className={inputClass} placeholder="2020" />
              </div>
              <div>
                <label className={labelClass}>Lot Size (sqft)</label>
                <input type="number" value={form.lot_size} onChange={(e) => update("lot_size", e.target.value)} className={inputClass} placeholder="5000" />
              </div>
              <div>
                <label className={labelClass}>Parking Spaces</label>
                <input type="number" value={form.parking_spaces} onChange={(e) => update("parking_spaces", e.target.value)} className={inputClass} placeholder="2" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#0A2647] mb-5">Amenities & Nearby</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Amenities (comma-separated)</label>
                <input type="text" value={form.amenities} onChange={(e) => update("amenities", e.target.value)} className={inputClass} placeholder="Pool, Garage, Garden, Gym" />
              </div>
              <div>
                <label className={labelClass}>Nearby Places (comma-separated)</label>
                <input type="text" value={form.nearby_places} onChange={(e) => update("nearby_places", e.target.value)} className={inputClass} placeholder="Schools, Shopping, Parks, Hospital" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
              {saving ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}
