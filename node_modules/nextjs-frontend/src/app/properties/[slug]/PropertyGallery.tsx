"use client";

import React, { useState, useEffect, useCallback } from "react";

interface PropertyGalleryProps {
  photos: string[];
  title: string;
  location: string;
  propertyTypeName?: string | null;
  featured?: boolean;
}

export default function PropertyGallery({
  photos,
  title,
  location,
  propertyTypeName,
  featured,
}: PropertyGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Close lightbox on Escape key, navigate on Left/Right keys
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % photos.length);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
      }
    },
    [isOpen, photos.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="rounded-3xl h-[320px] md:h-[480px] bg-gradient-to-br from-[#0A2647]/5 to-[#C9A227]/10 flex flex-col items-center justify-center border border-slate-200/50">
        <svg className="w-12 h-12 text-[#C9A227] mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169m-1.134-.175a2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
        <span className="text-slate-400 font-body text-sm font-semibold">Photos coming soon</span>
      </div>
    );
  }

  // Cover image URL
  const coverImg = photos[0];

  return (
    <div className="space-y-3 font-body">
      {/* Airbnb-style Premium Grid Wrapper */}
      <div className="relative group/gallery h-[320px] sm:h-[400px] md:h-[480px] rounded-3xl overflow-hidden shadow-premium-md border border-slate-100 bg-slate-900">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
          {/* Main Large Header Image */}
          <div
            onClick={() => openLightbox(0)}
            className="col-span-4 md:col-span-2 row-span-2 h-full relative cursor-pointer overflow-hidden transition-all duration-300 hover:brightness-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImg}
              alt={`${title} Cover view`}
              className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-102"
            />
            {/* Soft decorative bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

            {/* Floating Badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {propertyTypeName && (
                <span className="bg-[#0A2647]/90 backdrop-blur-sm text-[#C9A227] border border-[#C9A227]/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  {propertyTypeName}
                </span>
              )}
              {featured && (
                <span className="bg-[#C9A227] text-[#0A2647] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Grid Slot 1 */}
          {photos[1] && (
            <div
              onClick={() => openLightbox(1)}
              className="hidden md:block col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden hover:brightness-90 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[1]} alt={`${title} Room view 1`} className="w-full h-full object-cover select-none" />
            </div>
          )}

          {/* Grid Slot 2 */}
          {photos[2] && (
            <div
              onClick={() => openLightbox(2)}
              className="hidden md:block col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden hover:brightness-90 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[2]} alt={`${title} Room view 2`} className="w-full h-full object-cover select-none" />
            </div>
          )}

          {/* Grid Slot 3 */}
          {photos[3] && (
            <div
              onClick={() => openLightbox(3)}
              className="hidden md:block col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden hover:brightness-90 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[3]} alt={`${title} Room view 3`} className="w-full h-full object-cover select-none" />
            </div>
          )}

          {/* Grid Slot 4 (Bottom-Right, with counting overlay) */}
          {photos[4] && (
            <div
              onClick={() => openLightbox(4)}
              className="hidden md:block col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden hover:brightness-90 transition-all bg-slate-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[4]} alt={`${title} Room view 4`} className="w-full h-full object-cover select-none" />
              {photos.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white transition-opacity hover:bg-black/50">
                  <span className="text-xl font-bold">+{photos.length - 5}</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Photos</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View All Photos Button (Zillow/Airbnb Style) */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[#0A2647] hover:bg-white hover:text-[#C9A227] font-extrabold text-xs px-4.5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 border border-slate-200 cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169m-1.134-.175a2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
          <span>View All {photos.length} Photos</span>
        </button>
      </div>

      {/* Full-Screen Interactive Lightbox Slider */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9999] bg-[#07162C]/98 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6"
        >
          {/* Top Bar controls */}
          <div className="flex justify-between items-center text-white z-10">
            <div className="bg-slate-900/60 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider">
              {activeIndex + 1} / {photos.length}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-slate-900/60 flex items-center justify-center text-white hover:text-[#C9A227] transition-colors border border-white/10 hover:border-[#C9A227]/40 cursor-pointer"
              aria-label="Close Gallery"
            >
              ✕
            </button>
          </div>

          {/* Main Slider Zone */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            {/* Left Nav Arrow */}
            <button
              onClick={prevPhoto}
              className="absolute left-2 sm:left-4 z-10 w-12 h-12 rounded-full bg-slate-950/60 border border-white/10 hover:border-[#C9A227]/40 text-white hover:text-[#C9A227] flex items-center justify-center transition-colors cursor-pointer select-none active:scale-95"
              aria-label="Previous Photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
 
            {/* Slider Active Image container */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[70vh] sm:max-h-[75vh] w-full h-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[activeIndex]}
                alt={`${title} Detail view ${activeIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg select-none"
              />
            </div>
 
            {/* Right Nav Arrow */}
            <button
              onClick={nextPhoto}
              className="absolute right-2 sm:right-4 z-10 w-12 h-12 rounded-full bg-slate-950/60 border border-white/10 hover:border-[#C9A227]/40 text-white hover:text-[#C9A227] flex items-center justify-center transition-colors cursor-pointer select-none active:scale-95"
              aria-label="Next Photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Horizontal Scrolling Thumbnails strip */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex gap-2.5 overflow-x-auto py-3 px-2 mx-auto max-w-4xl scrollbar-thin scrollbar-thumb-slate-700 bg-slate-950/50 backdrop-blur rounded-2xl border border-white/5 scroll-smooth"
          >
            {photos.map((src, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    isActive
                      ? "border-[#C9A227] scale-105 shadow-[0_0_12px_rgba(201,162,39,0.5)]"
                      : "border-transparent opacity-55 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover select-none" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
