"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface MediaFile {
  id: number;
  name: string;
  mime_type: string;
  url: string;
  webp_url?: string | null;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: { url: string; name: string }) => void;
}

/**
 * Modal wrapping the Media Library in "select" mode so any form (blog
 * featured image, OG image, gallery, rich-text image insert) can reuse one
 * upload+browse flow instead of each hand-rolling its own.
 */
export default function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const { notifyError, success } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: MediaFile[] }>("/admin/media?mime_type=image");
      setFiles(data.data || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void fetchFiles();
  }, [open, fetchFiles]);

  if (!open) return null;

  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("collection", "blog");
        await apiPost("/admin/media", fd);
      }
      await fetchFiles();
      success("Uploaded.");
    } catch (e) {
      notifyError(e, "Could not upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="font-heading font-bold text-[#0A2647]">Select an Image</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 flex gap-3">
          <input
            type="text"
            placeholder="Search media…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-bold hover:bg-[#b8911f] disabled:opacity-50 whitespace-nowrap"
          >
            {uploading ? "Uploading…" : "+ Upload New"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-16 text-sm">No images found. Upload one to get started.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    onSelect({ url: file.url, name: file.name });
                    onClose();
                  }}
                  className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-[#C9A227] hover:ring-2 hover:ring-[#C9A227] transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
