"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface MediaFile {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  collection: string;
  url: string;
  webp_url: string | null;
  width: number | null;
  height: number | null;
  meta: { alt_text?: string; caption?: string } | null;
  created_at: string;
}

export default function MediaPage() {
  const { success, notifyError } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [collectionFilter, setCollectionFilter] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ data: MediaFile[] }>("/admin/media");
      setFiles(data.data || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.file_name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || (typeFilter === "Images" && f.mime_type.startsWith("image/")) || (typeFilter === "Documents" && (f.mime_type.includes("pdf") || f.mime_type.includes("document") || f.mime_type.includes("text"))) || (typeFilter === "Videos" && f.mime_type.startsWith("video/"));
    const matchCollection = collectionFilter === "All" || f.collection === collectionFilter;
    return matchSearch && matchType && matchCollection;
  });

  const collections = [...new Set(files.map((f) => f.collection).filter(Boolean))];
  const allFilteredSelected = filtered.length > 0 && filtered.every((f) => selected.includes(f.id));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith("image/")) return "🖼️";
    if (mime.startsWith("video/")) return "🎬";
    if (mime.includes("pdf")) return "📄";
    if (mime.includes("spreadsheet") || mime.includes("excel")) return "📊";
    if (mime.includes("document") || mime.includes("word")) return "📝";
    return "📁";
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        const formData = new FormData();
        formData.append("file", fileList[i]);
        formData.append("name", fileList[i].name);
        formData.append("collection", "admin");
        await apiPost("/admin/media", formData);
      }
      fetchFiles();
      success("Upload complete.");
    } catch (e) {
      notifyError(e, "Could not upload one or more files. Please check the file type and size, then try again.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/admin/media/${id}`);
      setDeleteConfirm(null);
      success("File deleted.");
      setSelected((prev) => prev.filter((i) => i !== id));
      fetchFiles();
    } catch (e) {
      notifyError(e, "Could not delete this file. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await apiPost("/admin/media/bulk-delete", { ids: selected });
      success(`${selected.length} file(s) deleted.`);
      setSelected([]);
      setBulkDeleteConfirm(false);
      fetchFiles();
    } catch (e) {
      notifyError(e, "Could not delete the selected files.");
    }
  };

  const handleSaveMeta = async (id: number, meta: { alt_text: string; caption: string }) => {
    try {
      await apiPut(`/admin/media/${id}`, { meta });
      success("Details saved.");
      setEditing(null);
      fetchFiles();
    } catch (e) {
      notifyError(e, "Could not save file details.");
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      success("URL copied to clipboard.");
    } catch {
      notifyError(new Error("Clipboard unavailable"), "Could not copy URL.");
    }
  };

  return (
    <AdminLayout title="Media Library">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Search files by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
            <option value="All">All Types</option>
            <option value="Images">Images</option>
            <option value="Documents">Documents</option>
            <option value="Videos">Videos</option>
          </select>
          {collections.length > 0 && (
            <select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
              <option value="All">All Collections</option>
              {collections.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <input ref={fileInputRef} type="file" multiple onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] transition-colors whitespace-nowrap disabled:opacity-50">
            {uploading ? "Uploading..." : "+ Upload"}
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#0A2647] text-white rounded-xl px-4 py-2.5 mb-4 shadow-md">
          <span className="text-sm font-semibold">{selected.length} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setBulkDeleteConfirm(true)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700">
              Delete Selected
            </button>
            <button onClick={() => setSelected([])} className="text-xs font-semibold text-slate-300 hover:text-white px-2">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No media files found</p>
            <p className="text-gray-400 text-sm mt-1">Upload files using the button above</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 pt-4">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={() => setSelected(allFilteredSelected ? [] : filtered.map((f) => f.id))}
              />
              <span className="text-xs text-gray-500 font-semibold">Select all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
              {filtered.map((file) => (
                <div key={file.id} className="group relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <input
                    type="checkbox"
                    checked={selected.includes(file.id)}
                    onChange={() =>
                      setSelected((prev) => (prev.includes(file.id) ? prev.filter((i) => i !== file.id) : [...prev, file.id]))
                    }
                    className="absolute top-1 left-1 z-10"
                  />
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {file.mime_type.startsWith("image/") && file.url ? (
                      <img src={file.webp_url || file.url} alt={file.meta?.alt_text || file.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{getFileIcon(file.mime_type)}</span>
                    )}
                    {file.webp_url && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        WEBP
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                      {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
                    </p>
                  </div>
                  <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyUrl(file.url)} title="Copy URL" className="w-6 h-6 bg-[#0A2647] text-white rounded-full flex items-center justify-center text-xs hover:bg-[#07162C]">🔗</button>
                    <button onClick={() => setEditing(file)} title="Edit alt/caption" className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-slate-700">✎</button>
                    <button onClick={() => setDeleteConfirm(file.id)} title="Delete" className="w-6 h-6 bg-[#8B1E3F] text-white rounded-full flex items-center justify-center text-xs hover:bg-red-800">✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing {filtered.length} of {files.length} files</p>
            </div>
          </>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Delete File</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this file? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-[#8B1E3F] text-white rounded-lg font-semibold hover:bg-red-800">Delete</button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Delete {selected.length} Files</h3>
            <p className="text-gray-600 mb-4">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 px-4 py-2 bg-[#8B1E3F] text-white rounded-lg font-semibold hover:bg-red-800">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#0A2647] mb-4">Edit File Details</h3>
            <EditMetaForm file={editing} onSave={(meta) => handleSaveMeta(editing.id, meta)} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function EditMetaForm({
  file,
  onSave,
  onCancel,
}: {
  file: MediaFile;
  onSave: (meta: { alt_text: string; caption: string }) => void;
  onCancel: () => void;
}) {
  const [alt, setAlt] = useState(file.meta?.alt_text ?? "");
  const [caption, setCaption] = useState(file.meta?.caption ?? "");

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Alt Text</label>
        <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Caption</label>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
        <button onClick={() => onSave({ alt_text: alt, caption })} className="flex-1 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">Save</button>
      </div>
    </div>
  );
}
