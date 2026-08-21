"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export interface PropertyFormValues {
  title: string;
  description: string;
  price: string;
  price_type: string;
  property_type_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  neighborhood: string;
  county: string;
  bedrooms: string;
  bathrooms: string;
  half_bathrooms: string;
  sqft: string;
  lot_size: string;
  year_built: string;
  parking_spaces: string;
  floors: string;
  hoa_fees: string;
  video_url: string;
  virtual_tour_url: string;
  amenities: string[];
  featured: boolean;
  premium: boolean;
  approval_status: string;
  status: string;
}

export const emptyPropertyForm: PropertyFormValues = {
  title: "",
  description: "",
  price: "",
  price_type: "sale",
  property_type_id: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  neighborhood: "",
  county: "",
  bedrooms: "",
  bathrooms: "",
  half_bathrooms: "",
  sqft: "",
  lot_size: "",
  year_built: "",
  parking_spaces: "",
  floors: "",
  hoa_fees: "",
  video_url: "",
  virtual_tour_url: "",
  amenities: [],
  featured: false,
  premium: false,
  approval_status: "approved",
  status: "active",
};

interface PropertyType {
  id: number;
  name: string;
}

interface Amenity {
  id: number;
  name: string;
}

interface Props {
  value: PropertyFormValues;
  onChange: (next: PropertyFormValues) => void;
}

const inputClass =
  "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const cardClass = "bg-white rounded-xl shadow-sm p-6 space-y-4";

export default function PropertyForm({ value, onChange }: Props) {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [amenityOptions, setAmenityOptions] = useState<Amenity[]>([]);

  useEffect(() => {
    apiGet<{ data: PropertyType[] }>("/admin/property-types")
      .then((r) => setPropertyTypes(r.data || []))
      .catch(() => setPropertyTypes([]));
    apiGet<{ data: Amenity[] }>("/admin/amenities")
      .then((r) => setAmenityOptions(r.data || []))
      .catch(() => setAmenityOptions([]));
  }, []);

  const set = <K extends keyof PropertyFormValues>(field: K, val: PropertyFormValues[K]) =>
    onChange({ ...value, [field]: val });

  const toggleAmenity = (name: string) => {
    const has = value.amenities.includes(name);
    set("amenities", has ? value.amenities.filter((a) => a !== name) : [...value.amenities, name]);
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="text-lg font-bold text-navy">Basic Information</h2>
        <div>
          <label className={labelClass}>Title *</label>
          <input
            required
            className={inputClass}
            value={value.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Modern Coastal Luxury Villa"
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={inputClass}
            rows={4}
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Write an engaging property overview..."
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price ($) *</label>
            <input
              required
              type="number"
              className={inputClass}
              value={value.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="1250000"
            />
          </div>
          <div>
            <label className={labelClass}>Listing Type</label>
            <select className={inputClass} value={value.price_type} onChange={(e) => set("price_type", e.target.value)}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Property Type</label>
            <select
              className={inputClass}
              value={value.property_type_id}
              onChange={(e) => set("property_type_id", e.target.value)}
            >
              <option value="">— Select type —</option>
              {propertyTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-bold text-navy">Location</h2>
        <div>
          <label className={labelClass}>Address *</label>
          <input
            required
            className={inputClass}
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="123 Ocean Drive"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City *</label>
            <input required className={inputClass} value={value.city} onChange={(e) => set("city", e.target.value)} placeholder="Beverly Hills" />
          </div>
          <div>
            <label className={labelClass}>State *</label>
            <input required className={inputClass} value={value.state} onChange={(e) => set("state", e.target.value)} placeholder="CA" />
          </div>
          <div>
            <label className={labelClass}>ZIP *</label>
            <input required className={inputClass} value={value.zip} onChange={(e) => set("zip", e.target.value)} placeholder="90210" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Neighborhood</label>
            <input className={inputClass} value={value.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="e.g. Downtown" />
          </div>
          <div>
            <label className={labelClass}>County</label>
            <input className={inputClass} value={value.county} onChange={(e) => set("county", e.target.value)} placeholder="e.g. Travis County" />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-bold text-navy">Property Specs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            ["bedrooms", "Bedrooms"],
            ["bathrooms", "Bathrooms"],
            ["half_bathrooms", "Half Baths"],
            ["sqft", "Sqft"],
            ["lot_size", "Lot Size"],
            ["year_built", "Year Built"],
            ["parking_spaces", "Parking Spaces"],
            ["floors", "Floors"],
            ["hoa_fees", "HOA Fees ($/mo)"],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <input type="number" className={inputClass} value={value[field]} onChange={(e) => set(field, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-bold text-navy">Amenities</h2>
        {amenityOptions.length === 0 ? (
          <p className="text-sm text-slate-400">No amenities configured yet. Add some under Properties → Amenities.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {amenityOptions.map((a) => (
              <label
                key={a.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                  value.amenities.includes(a.name)
                    ? "border-[#C9A227] bg-[#C9A227]/10 text-navy font-medium"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-[#C9A227]"
                  checked={value.amenities.includes(a.name)}
                  onChange={() => toggleAmenity(a.name)}
                />
                {a.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-bold text-navy">Media Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Video URL</label>
            <input className={inputClass} value={value.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label className={labelClass}>Virtual Tour URL</label>
            <input className={inputClass} value={value.virtual_tour_url} onChange={(e) => set("virtual_tour_url", e.target.value)} placeholder="https://my.matterport.com/..." />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-bold text-navy">Publishing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Approval Status</label>
            <select className={inputClass} value={value.approval_status} onChange={(e) => set("approval_status", e.target.value)}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Listing Status</label>
            <select className={inputClass} value={value.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" className="accent-[#C9A227]" checked={value.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured listing
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" className="accent-[#C9A227]" checked={value.premium} onChange={(e) => set("premium", e.target.checked)} />
            Premium listing
          </label>
        </div>
      </div>
    </div>
  );
}

export function propertyFormToPayload(form: PropertyFormValues) {
  return {
    title: form.title,
    description: form.description || form.title,
    price: Number(form.price),
    price_type: form.price_type,
    property_type_id: form.property_type_id ? Number(form.property_type_id) : null,
    address: form.address,
    city: form.city,
    state: form.state,
    zip: form.zip,
    country: form.country || "US",
    neighborhood: form.neighborhood || null,
    county: form.county || null,
    bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
    half_bathrooms: form.half_bathrooms ? Number(form.half_bathrooms) : null,
    sqft: form.sqft ? Number(form.sqft) : null,
    lot_size: form.lot_size ? Number(form.lot_size) : null,
    year_built: form.year_built ? Number(form.year_built) : null,
    parking_spaces: form.parking_spaces ? Number(form.parking_spaces) : null,
    floors: form.floors ? Number(form.floors) : null,
    hoa_fees: form.hoa_fees ? Number(form.hoa_fees) : null,
    video_url: form.video_url || null,
    virtual_tour_url: form.virtual_tour_url || null,
    amenities: form.amenities,
    featured: form.featured,
    premium: form.premium,
    approval_status: form.approval_status,
    status: form.status,
  };
}

export function propertyToFormValues(p: Record<string, unknown>): PropertyFormValues {
  const str = (v: unknown) => (v == null ? "" : String(v));
  return {
    title: str(p.title),
    description: str(p.description),
    price: str(p.price),
    price_type: str(p.price_type) || "sale",
    property_type_id: p.property_type_id != null ? String(p.property_type_id) : "",
    address: str(p.address),
    city: str(p.city),
    state: str(p.state),
    zip: str(p.zip),
    country: str(p.country) || "US",
    neighborhood: str(p.neighborhood),
    county: str(p.county),
    bedrooms: str(p.bedrooms),
    bathrooms: str(p.bathrooms),
    half_bathrooms: str(p.half_bathrooms),
    sqft: str(p.sqft),
    lot_size: str(p.lot_size),
    year_built: str(p.year_built),
    parking_spaces: str(p.parking_spaces),
    floors: str(p.floors),
    hoa_fees: str(p.hoa_fees),
    video_url: str(p.video_url),
    virtual_tour_url: str(p.virtual_tour_url),
    amenities: Array.isArray(p.amenities) ? (p.amenities as string[]) : [],
    featured: !!p.featured,
    premium: !!p.premium,
    approval_status: str(p.approval_status) || "approved",
    status: str(p.status) || "active",
  };
}
