"use client";

import React, { useState } from "react";

export default function HomeVariant3() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Modernist Villas", "Waterfront", "Penthouses", "Historic Restorations"];

  const collections = [
    {
      id: 1,
      title: "The Glass & Oak Residence",
      architect: "Studio Kasa",
      location: "Carmel-by-the-Sea, California",
      price: "$6,800,000",
      image: "/variant3-hero.jpg",
      category: "Modernist Villas",
    },
    {
      id: 2,
      title: "Nordic Minimalist Pavilion",
      architect: "Björn & Partners",
      location: "Jackson Hole, Wyoming",
      price: "$8,400,000",
      image: "/variant1-hero.jpg",
      category: "Waterfront",
    },
    {
      id: 3,
      title: "Metropolitan Sky Gallery",
      architect: "Foster Studio",
      location: "Tribeca, New York",
      price: "$11,200,000",
      image: "/variant2-hero.jpg",
      category: "Penthouses",
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-[#1C1917] min-h-screen font-serif">
      {/* ── EDITORIAL HERO ── */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <span className="text-amber-800 text-xs font-sans font-medium uppercase tracking-[0.25em]">
          Volume XII — Architectural Anthology
        </span>

        <h1 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#1C1917] leading-[1.15]">
          Living Spaces Crafted with <br className="hidden sm:inline" />
          <span className="italic font-serif text-amber-900">Intention & Elegance</span>
        </h1>

        <p className="mt-6 text-slate-700 text-base sm:text-lg max-w-xl mx-auto font-sans font-light leading-relaxed">
          A minimalist curation of fine architectural homes, serene retreats, and bespoke residences designed for mindful living.
        </p>

        {/* Hero Image Showcase */}
        <div className="mt-12 relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 aspect-[16/9] max-w-5xl mx-auto">
          <img
            src="/variant3-hero.jpg"
            alt="Minimalist Architectural Villa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-left text-white font-sans">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-200">Featured Residence</span>
            <h3 className="text-2xl font-serif text-white mt-1">The Pine Forest Pavilion</h3>
            <p className="text-xs text-stone-300">Architect: Studio Kasa | Aspen, CO</p>
          </div>
        </div>
      </section>

      {/* ── CURATED CATEGORIES FILTER ── */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 font-sans">
          <span className="text-xs uppercase tracking-widest text-stone-500">Curation</span>
          <h2 className="text-3xl font-serif text-[#1C1917] mt-1">Architectural Collections</h2>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#1C1917] text-white shadow"
                    : "bg-stone-200/70 text-stone-700 hover:bg-stone-300/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="overflow-hidden rounded-2xl aspect-[4/3] bg-stone-200 mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="font-sans">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider">{item.category}</span>
                  <span className="text-sm font-serif font-bold text-[#1C1917]">{item.price}</span>
                </div>
                <h3 className="text-xl font-serif text-[#1C1917] mt-1 group-hover:text-amber-800 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1 font-light">{item.location} • {item.architect}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EDITORIAL JOURNAL ── */}
      <section className="py-20 bg-stone-100/80 border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs font-sans uppercase tracking-widest text-stone-500">Journal & Perspectives</span>
          <h2 className="text-3xl font-serif text-[#1C1917] mt-2">Design Essays & Architecture</h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left font-sans">
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-xs text-amber-800 font-semibold uppercase">Design Philosophy</span>
              <h3 className="text-xl font-serif text-[#1C1917] mt-2">The Art of Seamless Indoor-Outdoor Transition</h3>
              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                Exploring how natural oak timber, hidden glass tracks, and tactile stone floors harmonally blur the boundaries between home and landscape.
              </p>
              <span className="inline-block mt-4 text-xs font-bold text-[#1C1917]">Read Essay →</span>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-xs text-amber-800 font-semibold uppercase">Market Insight</span>
              <h3 className="text-xl font-serif text-[#1C1917] mt-2">Preserving Historic Mid-Century Modern Homes</h3>
              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                How modern restoration techniques bring 1950s architectural icons into the 21st century without sacrificing authentic heritage.
              </p>
              <span className="inline-block mt-4 text-xs font-bold text-[#1C1917]">Read Essay →</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
