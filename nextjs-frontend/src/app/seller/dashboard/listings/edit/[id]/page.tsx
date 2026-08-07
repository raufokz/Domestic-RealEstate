"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import SellerLayout from "@/components/seller/SellerLayout";
import { apiGet, apiPut } from "@/lib/api";
import Link from "next/link";
import PropertyImageManager, { PropertyImage } from "@/components/property/PropertyImageManager";

interface PropertyType {
  id: number;
  name: string;
}

interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  property_type_id: number | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built: number;
  lot_size: number;
  parking_spaces: number;
  amenities: string[];
  nearby_places: string[];
  images: PropertyImage[];
}

export default function EditSellerListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  const [form, setForm] = useState({
    title: "", description: "", address: "", city: "", state: "", zip: "", country: "US",
    property_type_id: "", price: "", bedrooms: "", bathrooms: "", sqft: "",
    year_built: "", lot_size: "", parking_spaces: "", amenities: "", nearby_places: "",
  });

  useEffect(() => {
    apiGet<{ data: PropertyType[] }>("/admin/property-types")
      .then((res) => setPropertyTypes(res.data || []))
      .catch(() => setPropertyTypes([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    apiGet<Property>(`/properties/${id}`)
      .then((p) => {
        setForm({
          title: p.title || "",
          description: p.description || "",
          address: p.address || "",
          city: p.city || "",
          state: p.state || "",
          zip: p.zip || "",
          country: p.country || "US",
          property_type_id: p.property_type_id ? String(p.property_type_id) : "",
          price: p.price?.toString() || "",
          bedrooms: p.bedrooms?.toString() || "",
          bathrooms: p.bathrooms?.toString() || "",
          sqft: p.sqft?.toString() || "",
          year_built: p.year_built?.toString() || "",
          lot_size: p.lot_size?.toString() || "",
          parking_spaces: p.parking_spaces?.toString() || "",
          amenities: Array.isArray(p.amenities) ? p.amenities.join(", ") : "",
          nearby_places: Array.isArray(p.nearby_places) ? p.nearby_places.join(", ") : "",
        });
        setImages(p.images || []);
      })
      .catch(() => setError("Failed to load listing"))
      .finally(() => setLoading(false));
  }, [id]);

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
      await apiPut(`/properties/${id}`, payload);
      router.push("/seller/dashboard/listings");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
    }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none text-sm text-slate-800";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <SellerLayout title="Edit Listing" subtitle="Update your property listing details">
      <div className="max-w-3xl">
        <div className="mb-4">
          <Link href="/seller/dashboard/listings" className="text-sm text-slate-500 hover:text-[#0A2647]">← Back to Listings</Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading listing...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-5">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Property Title *</label>
                  <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className={`${inputClass} resize-none`} />
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
                    <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className={inputClass} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-5">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Street Address *</label>
                  <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>ZIP Code</label>
                    <input type="text" value={form.zip} onChange={(e) => update("zip", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-5">Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Square Feet</label>
                  <input type="number" value={form.sqft} onChange={(e) => update("sqft", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Year Built</label>
                  <input type="number" value={form.year_built} onChange={(e) => update("year_built", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Lot Size (sqft)</label>
                  <input type="number" value={form.lot_size} onChange={(e) => update("lot_size", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Parking Spaces</label>
                  <input type="number" value={form.parking_spaces} onChange={(e) => update("parking_spaces", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-5">Amenities & Nearby</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Amenities (comma-separated)</label>
                  <input type="text" value={form.amenities} onChange={(e) => update("amenities", e.target.value)} className={inputClass} placeholder="Pool, Garage, Garden" />
                </div>
                <div>
                  <label className={labelClass}>Nearby Places (comma-separated)</label>
                  <input type="text" value={form.nearby_places} onChange={(e) => update("nearby_places", e.target.value)} className={inputClass} placeholder="Schools, Shopping, Parks" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {!loading && id && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
            <h2 className="text-lg font-bold text-[#0A2647] mb-5">Photos</h2>
            <PropertyImageManager propertyId={Number(id)} initialImages={images} />
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
