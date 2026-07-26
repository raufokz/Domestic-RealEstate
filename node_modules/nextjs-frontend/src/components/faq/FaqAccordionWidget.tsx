"use client";

import { useId, useState } from "react";
import { faqs, faqCategories } from "@/lib/faqData";

export default function FaqAccordionWidget() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const searchId = useId();
  const baseId = useId();

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 font-body">
      {/* Search & Filter Header */}
      <div className="bg-[#0A2647] p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-premium">
        <label htmlFor={searchId} className="block text-white text-sm font-semibold mb-2">
          Search questions
        </label>
        <div className="relative mb-6">
          <input
            id={searchId}
            type="text"
            placeholder="Search by keyword (e.g. leads, valuation, pre-approval)…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenIndex(null);
            }}
            className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/40"
          />
          <svg
            aria-hidden="true"
            className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div role="group" aria-label="Filter by category" className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {faqCategories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  active ? "bg-[#C9A227] text-[#0A2647] shadow-gold" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
            <p className="text-slate-600 text-sm font-medium">
              No matching questions found{searchQuery ? ` for “${searchQuery}”` : ""}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-3 text-[#C9A227] font-bold text-sm underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const btnId = `${baseId}-faq-btn-${idx}`;
            const panelId = `${baseId}-faq-panel-${idx}`;
            return (
              <div
                key={faq.question}
                className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                  isOpen ? "border-[#C9A227] shadow-md" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left font-heading font-bold text-[#0A2647] text-base sm:text-lg flex justify-between items-center gap-4 hover:text-[#C9A227] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-inset"
                  >
                    <span className="flex flex-wrap items-center gap-3">
                      <span className="text-xs px-2.5 py-1 bg-slate-100 text-[#0A2647] font-extrabold rounded-md uppercase tracking-wider">
                        {faq.category}
                      </span>
                      {faq.question}
                    </span>
                    <span aria-hidden="true" className="text-2xl font-mono text-[#C9A227] flex-shrink-0 leading-none">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  hidden={!isOpen}
                  className="px-5 sm:px-6 pb-6 text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-4 font-medium"
                >
                  {faq.answer}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
