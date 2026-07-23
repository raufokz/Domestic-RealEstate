"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiGet, apiPut } from "@/lib/api";
import Link from "next/link";

interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  property_type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number;
  lot_size: number;
  parking_spaces: number;
  amenities: string[];
  nearby_places: string[];
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", address: "", city: "", state: "", zip_code: "", country: "US",
    property_type: "house", price: "", bedrooms: "", bathrooms: "", square_feet: "",
    year_built: "", lot_size: "", parking_spaces: "", amenities: "", nearby_places: "",
  });

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
          zip_code: p.zip_code || "",
          country: p.country || "US",
          property_type: p.property_type || "house",
          price: p.price?.toString() || "",
          bedrooms: p.bedrooms?.toString() || "",
          bathrooms: p.bathrooms?.toString() || "",
          square_feet: p.square_feet?.toString() || "",
          year_built: p.year_built?.toString() || "",
          lot_size: p.lot_size?.toString() || "",
          parking_spaces: p.parking_spaces?.toString() || "",
          amenities: Array.isArray(p.amenities) ? p.amenities.join(", ") : "",
          nearby_places: Array.isArray(p.nearby_places) ? p.nearby_places.join(", ") : "",
        });
      })
      .catch(() => setError("Failed to load property"))
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
        price: form.price ? Number(form.price) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        square_feet: form.square_feet ? Number(form.square_feet) : undefined,
        year_built: form.year_built ? Number(form.year_built) : undefined,
        lot_size: form.lot_size ? Number(form.lot_size) : undefined,
        parking_spaces: form.parking_spaces ? Number(form.parking_spaces) : undefined,
        amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()) : [],
        nearby_places: form.nearby_places ? form.nearby_places.split(",").map((a) => a.trim()) : [],
      };
      await apiPut(`/properties/${id}`, payload);
      router.push("/agent/dashboard/properties");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update property");
    }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none text-sm text-slate-800";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <AgentLayout title="Edit Property" subtitle="Update property listing details">
      <div className="max-w-3xl">
        <div className="mb-4">
          <Link href="/agent/dashboard/properties" className="text-sm text-slate-500 hover:text-[#0A2647]">← Back to Properties</Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading property...</div>
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
                    <select value={form.property_type} onChange={(e) => update("property_type", e.target.value)} className={inputClass}>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="villa">Villa</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
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
                    <input type="text" value={form.zip_code} onChange={(e) => update("zip_code", e.target.value)} className={inputClass} />
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
                  <input type="number" value={form.square_feet} onChange={(e) => update("square_feet", e.target.value)} className={inputClass} />
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
      </div>
    </AgentLayout>
  );
}
