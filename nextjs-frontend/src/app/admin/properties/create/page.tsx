"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiPost, API_BASE, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import PropertyImageManager, { PropertyImage } from "@/components/property/PropertyImageManager";

function authToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const { success, notifyError } = useToast();
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [createdImages, setCreatedImages] = useState<PropertyImage[]>([]);
  
  // Staged cover and gallery files before property creation
  const [stagedFiles, setStagedFiles] = useState<{ file: File; preview: string; isCover: boolean }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleStageFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) return;

    const newStaged = valid.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      isCover: stagedFiles.length === 0 && idx === 0,
    }));

    setStagedFiles((prev) => [...prev, ...newStaged]);
  };

  const handleSetCover = (index: number) => {
    setStagedFiles((prev) =>
      prev.map((item, i) => ({
        ...item,
        isCover: i === index,
      }))
    );
  };

  const handleRemoveStaged = (index: number) => {
    setStagedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((item) => item.isCover)) {
        next[0].isCover = true;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const created = await apiPost<{ data: { id: number } }>("/admin/properties", {
        ...form,
        description: form.description || form.title,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        sqft: form.sqft ? Number(form.sqft) : null,
        year_built: form.year_built ? Number(form.year_built) : null,
        parking_spaces: form.parking_spaces ? Number(form.parking_spaces) : null,
      });

      const propId = created.data.id;

      // Upload staged images if any
      if (stagedFiles.length > 0) {
        const fd = new FormData();
        // Place cover image first if designated
        const coverItem = stagedFiles.find((f) => f.isCover);
        const otherItems = stagedFiles.filter((f) => !f.isCover);
        const ordered = coverItem ? [coverItem, ...otherItems] : stagedFiles;

        ordered.forEach((item) => fd.append("images[]", item.file));
        const token = authToken();
        const uploadRes = await fetch(`${API_BASE}/properties/${propId}/images`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
          body: fd,
        });

        if (!uploadRes.ok) {
          let msg = "Property was created, but the photos could not be uploaded. You can add them below.";
          try {
            const body = await uploadRes.json();
            if (body?.message) msg = body.message;
          } catch {
            /* keep default */
          }
          notifyError(new ApiError(msg, uploadRes.status), msg);
          setCreatedId(propId);
          return;
        }

        const body = (await uploadRes.json()) as { data: PropertyImage[] };
        setCreatedImages(body.data);
        success("Property created with cover photos.", "Properties");
      } else {
        success("Property created.", "Properties");
      }

      setCreatedId(propId);
    } catch (err) {
      notifyError(err, "Property could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  if (createdId) {
    return (
      <AdminLayout title="Add & Edit Photos">
        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-navy mb-1">Property Created Successfully!</h2>
            <p className="text-sm text-slate-500 mb-4">Manage, drag & drop to reorder, or update your cover and gallery photos below.</p>
            <PropertyImageManager propertyId={createdId} initialImages={createdImages} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/properties")}
              className="px-5 py-2.5 bg-gold text-navy rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Done & Return to Properties
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const coverItem = stagedFiles.find((f) => f.isCover);

  return (
    <AdminLayout title="Create Property">
      <div className="max-w-3xl mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700">
        <h3 className="font-semibold text-sm text-[#0A2647] flex items-center gap-2 mb-2">
          <span>💡</span> Quick Creation Guidelines
        </h3>
        <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
          <li><strong>Cover Image:</strong> Drag and drop a high-resolution cover photo below or choose from your files.</li>
          <li><strong>Location & Pricing:</strong> Fill out address, city, state, and listing price.</li>
          <li><strong>Approval:</strong> Set status to <em>Approved</em> to publish immediately.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Cover Photo Drag and Drop Dropzone */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy">Cover & Gallery Photos</h2>
            <span className="text-xs font-semibold text-slate-400">Drag & Drop Upload</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.length) handleStageFiles(e.dataTransfer.files);
            }}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? "border-[#C9A227] bg-[#C9A227]/5" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleStageFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="w-12 h-12 rounded-full bg-[#0A2647]/5 text-[#0A2647] flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
              📸
            </div>
            <p className="text-sm font-semibold text-[#0A2647]">
              Drag & Drop Cover Image & Gallery Photos Here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Or <span className="text-[#C9A227] font-bold underline">click to choose files</span> from your computer
            </p>
            <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, WEBP. First image selected will be set as Primary Cover Photo.</p>
          </div>

          {stagedFiles.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Selected Photos ({stagedFiles.length})
                </span>
                <span className="text-xs text-[#C9A227] font-semibold">★ Click a photo to set as Primary Cover</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stagedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSetCover(idx)}
                    className={`relative group rounded-lg overflow-hidden border bg-slate-50 aspect-square cursor-pointer transition-all ${
                      item.isCover ? "ring-2 ring-[#C9A227] border-[#C9A227]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt="Staged property photo" className="w-full h-full object-cover" />
                    {item.isCover && (
                      <span className="absolute top-1.5 left-1.5 bg-[#C9A227] text-[#0A2647] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        ★ Cover Photo
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStaged(idx);
                      }}
                      className="absolute top-1.5 right-1.5 bg-red-600/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy">Basic Information</h2>
          <div>
            <label className={labelClass}>Title *</label>
            <input required className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Modern Coastal Luxury Villa" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Write an engaging property overview..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price ($) *</label>
              <input required type="number" className={inputClass} value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="1250000" />
            </div>
            <div>
              <label className={labelClass}>Approval Status</label>
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
            <input required className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Ocean Drive" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>City *</label>
              <input required className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Beverly Hills" />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input required className={inputClass} value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="CA" />
            </div>
            <div>
              <label className={labelClass}>ZIP *</label>
              <input required className={inputClass} value={form.zip} onChange={(e) => update("zip", e.target.value)} placeholder="90210" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy">Property Specs</h2>
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
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border rounded-lg text-sm font-semibold">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-gold text-navy rounded-lg text-sm font-bold hover:bg-[#b8911f] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Property"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
