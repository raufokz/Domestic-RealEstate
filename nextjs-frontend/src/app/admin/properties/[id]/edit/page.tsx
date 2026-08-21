"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/components/Toast";
import PropertyImageManager, { PropertyImage } from "@/components/property/PropertyImageManager";
import PropertyForm, {
  emptyPropertyForm,
  propertyFormToPayload,
  propertyToFormValues,
  PropertyFormValues,
} from "@/components/admin/property/PropertyForm";

interface PropertyResponse {
  id: number;
  images?: PropertyImage[];
  [key: string]: unknown;
}

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const router = useRouter();
  const { success, notifyError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PropertyFormValues>(emptyPropertyForm);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await apiGet<{ data: PropertyResponse }>(`/admin/properties/${id}`);
        if (cancelled) return;
        setForm(propertyToFormValues(res.data));
        setImages(res.data.images ?? []);
        setTitle(String(res.data.title ?? ""));
      } catch (err) {
        notifyError(err, "Property could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiPut(`/admin/properties/${id}`, propertyFormToPayload(form));
      success("Property updated.", "Properties");
      router.push("/admin/properties");
    } catch (err) {
      notifyError(err, "Property could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Property">
        <div className="py-16 text-center text-slate-500">Loading property...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Property${title ? ` — ${title}` : ""}`}>
      <div className="max-w-3xl mb-4">
        <Link href="/admin/properties" className="text-sm text-slate-500 hover:text-navy">
          ← Back to Properties
        </Link>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy">Photos</h2>
          <PropertyImageManager propertyId={Number(id)} initialImages={images} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PropertyForm value={form} onChange={setForm} />

          <div className="flex gap-3">
            <button type="button" onClick={() => router.push("/admin/properties")} className="px-5 py-2.5 border rounded-lg text-sm font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gold text-navy rounded-lg text-sm font-bold hover:bg-[#b8911f] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
