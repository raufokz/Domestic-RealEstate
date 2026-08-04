"use client";

import { useState, useRef, ChangeEvent } from "react";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  aspectRatioName?: "avatar" | "cover" | "logo" | "gallery";
  onCropComplete: (file: File) => void;
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  title,
  aspectRatioName = "avatar",
  onCropComplete,
}: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAndSaveWebP = () => {
    if (!imageRef.current) return;
    setIsProcessing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = imageRef.current.naturalWidth;
    let height = imageRef.current.naturalHeight;

    // Apply max bounds for WebP optimization
    const MAX_WIDTH = aspectRatioName === "cover" ? 1600 : 800;
    if (width > MAX_WIDTH) {
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imageRef.current, -width / 2, -height / 2, width, height);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], `optimized-${Date.now()}.webp`, {
            type: "image/webp",
          });
          onCropComplete(croppedFile);
          setIsProcessing(false);
          setImageSrc(null);
          onClose();
        }
      },
      "image/webp",
      0.88
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-[#0A2647]">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {!imageSrc ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#0A2647] rounded-xl p-8 text-center cursor-pointer transition bg-slate-50 hover:bg-white"
            >
              <svg
                className="w-12 h-12 text-slate-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-semibold text-[#0A2647] mb-1">
                Drag & drop image here or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Supports JPG, PNG, WebP (Max 10MB). Automatically converts to optimized WebP.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.1s ease",
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Zoom Level</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#0A2647]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Rotation</span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-[#0A2647]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              setImageSrc(null);
              setZoom(1);
              setRotation(0);
            }}
            disabled={!imageSrc}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            Change Image
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={processAndSaveWebP}
              disabled={!imageSrc || isProcessing}
              className="px-5 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#b8911f] text-[#0A2647] rounded-lg transition disabled:opacity-50"
            >
              {isProcessing ? "Optimizing WebP..." : "Save & Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
