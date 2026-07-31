"use client";

import { useRef, useState } from "react";
import { apiDelete, apiPost, ApiError, API_BASE } from "@/lib/api";
import { storageUrl } from "@/lib/media";
import { useToast } from "@/components/Toast";

export interface PropertyImage {
  id: number;
  path: string;
  original_name?: string | null;
  is_featured: boolean;
  sort_order: number;
}

function authToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
}

interface Props {
  propertyId: number;
  initialImages: PropertyImage[];
}

export default function PropertyImageManager({ propertyId, initialImages }: Props) {
  const { success, notifyError } = useToast();
  const [images, setImages] = useState<PropertyImage[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const draggedId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("images[]", f));
      const token = authToken();
      const res = await fetch(`${API_BASE}/properties/${propertyId}/images`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
        body: fd,
      });
      if (!res.ok) {
        let msg = "Upload failed. Please try again.";
        try {
          const body = await res.json();
          if (body?.message) msg = body.message;
        } catch {
          /* keep default */
        }
        throw new ApiError(msg, res.status);
      }
      const body = (await res.json()) as { data: PropertyImage[] };
      setImages((prev) => [...prev, ...body.data].sort((a, b) => a.sort_order - b.sort_order));
      success(list.length > 1 ? `${list.length} photos uploaded.` : "Photo uploaded.");
    } catch (e) {
      notifyError(e, "Could not upload photo(s). Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: number) {
    if (!confirm("Delete this photo?")) return;
    const prev = images;
    setImages((cur) => cur.filter((i) => i.id !== imageId));
    try {
      await apiDelete(`/properties/${propertyId}/images/${imageId}`);
      success("Photo deleted.");
    } catch (e) {
      setImages(prev);
      notifyError(e, "Could not delete photo.");
    }
  }

  async function handleSetPrimary(imageId: number) {
    const prev = images;
    setImages((cur) => cur.map((i) => ({ ...i, is_featured: i.id === imageId })));
    try {
      await apiPost(`/properties/${propertyId}/images/${imageId}/primary`);
      success("Cover photo updated.");
    } catch (e) {
      setImages(prev);
      notifyError(e, "Could not set cover photo.");
    }
  }

  async function persistOrder(ordered: PropertyImage[]) {
    const prev = images;
    setImages(ordered);
    try {
      await apiPost(`/properties/${propertyId}/images/reorder`, { order: ordered.map((i) => i.id) });
    } catch (e) {
      setImages(prev);
      notifyError(e, "Could not save photo order.");
    }
  }

  function handleDropReorder(targetId: number) {
    const sourceId = draggedId.current;
    draggedId.current = null;
    if (sourceId == null || sourceId === targetId) return;

    const current = [...images];
    const sourceIdx = current.findIndex((i) => i.id === sourceId);
    const targetIdx = current.findIndex((i) => i.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const [moved] = current.splice(sourceIdx, 1);
    current.splice(targetIdx, 0, moved);
    void persistOrder(current.map((img, idx) => ({ ...img, sort_order: idx })));
  }

  return (
    <div className="space-y-4">
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
          if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragActive ? "border-[#C9A227] bg-[#C9A227]/5" : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-sm font-medium text-slate-600">
          {uploading ? "Uploading..." : "Drag and drop photos here, or click to browse"}
        </p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP up to 5MB each</p>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => {
                draggedId.current = img.id;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleDropReorder(img.id);
              }}
              className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square cursor-move"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storageUrl(img.path) ?? ""}
                alt={img.original_name ?? "Property photo"}
                className="w-full h-full object-cover"
              />
              {img.is_featured && (
                <span className="absolute top-2 left-2 bg-[#C9A227] text-[#0A2647] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.is_featured && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    className="text-[10px] font-semibold text-white bg-black/50 hover:bg-black/70 rounded px-2 py-1"
                  >
                    ★ Set as cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="text-[10px] font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded px-2 py-1 ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
