"use client";

import { useState } from "react";

interface BlogCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
}

export default function BlogCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
}: BlogCategoryFilterProps) {
  return (
    <div className="bg-[#FDFBF7] border border-[#EBE6DD] rounded-2xl p-6 shadow-sm mb-12 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search guides, investment topics, market analysis..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#EBE6DD] text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-semibold p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Count Indicator */}
        <div className="text-xs text-stone-500 font-medium shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
          <span>
            Showing <strong className="text-stone-900 font-bold">{filteredCount}</strong> of{" "}
            {totalCount} Articles
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory("All")}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
            selectedCategory === "All"
              ? "bg-[#0A2647] text-white shadow-sm"
              : "bg-white border border-[#EBE6DD] text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          }`}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? "bg-[#0A2647] text-white shadow-sm"
                : "bg-white border border-[#EBE6DD] text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
