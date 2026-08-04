"use client";

import { useRef, useState } from "react";

export interface UploadedImage {
  id: number | string;
  url: string;
  webp_url?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  credit?: string | null;
}

interface ImageMeta {
  alt_text?: string;
  caption?: string;
  credit?: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  /** Gallery mode (multiple images, reorderable) vs single mode (one image, e.g. featured image). */
  multiple?: boolean;
  onUpload: (files: FileList | File[]) => void | Promise<void>;
  onDelete: (id: number | string) => void | Promise<void>;
  onReorder?: (orderedIds: (number | string)[]) => void | Promise<void>;
  onUpdateMeta?: (id: number | string, meta: ImageMeta) => void | Promise<void>;
  uploading?: boolean;
  label?: string;
  helpText?: string;
}

/**
 * Drag-and-drop + choose-file image uploader with preview/replace/delete and
 * alt/caption/credit editing. Purely presentational — the caller owns the
 * actual upload/delete/reorder API calls via the callback props, so this one
 * component works for a blog featured image, a blog gallery, OG images, etc.
 */
export default function ImageUploader({
  images,
  multiple = false,
  onUpload,
  onDelete,
  onReorder,
  onUpdateMeta,
  uploading = false,
  label,
  helpText,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const draggedId = useRef<number | string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    void onUpload(multiple ? list : [list[0]]);
  }

  function handleDropReorder(targetId: number | string) {
    if (!onReorder) return;
    const sourceId = draggedId.current;
    draggedId.current = null;
    if (sourceId == null || sourceId === targetId) return;

    const current = [...images];
    const sourceIdx = current.findIndex((i) => i.id === sourceId);
    const targetIdx = current.findIndex((i) => i.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const [moved] = current.splice(sourceIdx, 1);
    current.splice(targetIdx, 0, moved);
    void onReorder(current.map((i) => i.id));
  }

  const showDropzone = multiple || images.length === 0;

  return (
    <div className="space-y-3">
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>}

      {showDropzone && (
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
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragActive ? "border-[#C9A227] bg-[#C9A227]/5" : "border-slate-300 hover:border-slate-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <p className="text-sm font-medium text-slate-600">
            {uploading ? "Uploading…" : "Drag and drop image(s) here, or click to browse"}
          </p>
          {helpText && <p className="text-xs text-slate-400 mt-1">{helpText}</p>}
        </div>
      )}

      {images.length > 0 && (
        <div className={multiple ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" : "max-w-xs"}>
          {images.map((img) => (
            <div key={img.id} className="space-y-2">
              <div
                draggable={multiple && !!onReorder}
                onDragStart={() => {
                  draggedId.current = img.id;
                }}
                onDragOver={(e) => multiple && e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropReorder(img.id);
                }}
                className={`relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square ${
                  multiple && onReorder ? "cursor-move" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt_text || ""} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  {!multiple && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-semibold text-white bg-black/50 hover:bg-black/70 rounded px-2 py-1"
                    >
                      Replace
                    </button>
                  )}
                  {onUpdateMeta && (
                    <button
                      type="button"
                      onClick={() => setEditingId(editingId === img.id ? null : img.id)}
                      className="text-[10px] font-semibold text-white bg-black/50 hover:bg-black/70 rounded px-2 py-1"
                    >
                      {editingId === img.id ? "Close" : "Edit"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(img.id)}
                    className="text-[10px] font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded px-2 py-1 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {onUpdateMeta && editingId === img.id && (
                <ImageMetaFields
                  initial={{ alt_text: img.alt_text ?? "", caption: img.caption ?? "", credit: img.credit ?? "" }}
                  onSave={(meta) => {
                    void onUpdateMeta(img.id, meta);
                    setEditingId(null);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {!multiple && images.length === 0 && null}
    </div>
  );
}

function ImageMetaFields({
  initial,
  onSave,
}: {
  initial: Required<ImageMeta>;
  onSave: (meta: ImageMeta) => void;
}) {
  const [alt, setAlt] = useState(initial.alt_text);
  const [caption, setCaption] = useState(initial.caption);
  const [credit, setCredit] = useState(initial.credit);

  return (
    <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2">
      <input
        type="text"
        placeholder="Alt text (SEO/accessibility)"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded"
      />
      <input
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded"
      />
      <input
        type="text"
        placeholder="Credit"
        value={credit}
        onChange={(e) => setCredit(e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded"
      />
      <button
        type="button"
        onClick={() => onSave({ alt_text: alt, caption, credit })}
        className="w-full text-[10px] font-bold text-white bg-[#0A2647] hover:bg-[#07162C] rounded px-2 py-1"
      >
        Save
      </button>
    </div>
  );
}
