"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

interface ResourceItem {
  id: string;
  title: string;
  category: "Contracts" | "Marketing" | "CMA & Analytics" | "Playbooks";
  description: string;
  format: "PDF" | "DOCX" | "CANVA" | "XLSM";
  size: string;
  isPopular?: boolean;
}

const resources: ResourceItem[] = [
  {
    id: "r1",
    title: "Luxury Listing Presentation Deck 2026",
    category: "Marketing",
    description: "High-converting 24-slide customizable presentation deck designed for seller consultations and listing appointments.",
    format: "CANVA",
    size: "14.2 MB",
    isPopular: true,
  },
  {
    id: "r2",
    title: "Standard Purchase & Sale Agreement Checklist",
    category: "Contracts",
    description: "Step-by-step contingency compliance checklist covering inspection timelines, appraisal clauses, and loan approval.",
    format: "PDF",
    size: "1.4 MB",
    isPopular: true,
  },
  {
    id: "r3",
    title: "Comparative Market Analysis (CMA) Template",
    category: "CMA & Analytics",
    description: "Automated excel spreadsheet with price-per-square-foot adjustments and neighborhood trend graphing.",
    format: "XLSM",
    size: "3.8 MB",
    isPopular: true,
  },
  {
    id: "r4",
    title: "Cold Call & Expired Listing Phone Scripts",
    category: "Playbooks",
    description: "Objection-handling script playbook for converting expired listings, FSBOs, and absentee property owners.",
    format: "PDF",
    size: "2.1 MB",
  },
  {
    id: "r5",
    title: "Open House Visitor Sign-In & Qualification Sheet",
    category: "Marketing",
    description: "Printable and digital sign-in form with built-in buyer timeline & pre-approval qualification questions.",
    format: "PDF",
    size: "0.8 MB",
  },
  {
    id: "r6",
    title: "Seller Property Disclosure Guide",
    category: "Contracts",
    description: "Comprehensive guide explaining state compliance standards for environmental, structural, and material defect disclosures.",
    format: "DOCX",
    size: "1.9 MB",
  },
  {
    id: "r7",
    title: "Social Media Post & Story Templates Pack",
    category: "Marketing",
    description: "50+ ready-to-use Instagram, Facebook, and LinkedIn graphics for Just Listed, Under Contract, and Sold properties.",
    format: "CANVA",
    size: "28.5 MB",
  },
  {
    id: "r8",
    title: "First-Time Homebuyer Educational Guide",
    category: "Playbooks",
    description: "Co-brandable 12-page ebook explaining escrow, closing costs, inspections, and mortgages to buyer clients.",
    format: "PDF",
    size: "5.4 MB",
  },
];

export default function AgentResourcesClient() {
  const { success, info } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Contracts", "Marketing", "CMA & Analytics", "Playbooks"];

  const filtered = resources.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (title: string, format: string) => {
    info(`Downloading ${title} (${format})...`);
    setTimeout(() => {
      success(`${title} downloaded successfully!`, "Asset Saved");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A2647] font-body flex flex-col justify-between">
      <div>
        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-[#07162C] via-[#0A2647] to-[#07162C] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#C9A227]/30 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
            <span className="bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
              📁 Agent Resource & Asset Vault
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
              Essential Tools & <span className="text-[#C9A227]">Templates</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-body">
              Download pre-approved contract checklists, listing decks, social media kits, and market analysis templates designed to win clients.
            </p>
          </div>
        </section>

        {/* SEARCH & FILTER BAR */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search */}
              <div className="w-full md:w-96 relative">
                <input
                  type="text"
                  placeholder="Search resources, templates, forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#0A2647] text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RESOURCE CARDS GRID */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-500">
              Showing <span className="text-[#0A2647]">{filtered.length}</span> verified agent assets
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 space-y-3">
              <p className="text-slate-500 font-semibold text-sm">No resources match your search.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="text-xs font-bold text-[#C9A227] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#C9A227]/10 text-[#0A2647] text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.isPopular && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🔥 Popular
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          {item.format} · {item.size}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-heading font-extrabold text-lg text-[#0A2647]">{item.title}</h3>
                    <p className="text-xs text-slate-600 font-body leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleDownload(item.title, item.format)}
                      className="bg-[#0A2647] hover:bg-[#07162C] text-white font-heading font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>📥 Download Asset</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">Verified 2026 Template</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-white py-12 border-t border-slate-200 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <h2 className="font-heading text-2xl font-bold text-[#0A2647]">Need Custom Brand Materials?</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-body">
              Our in-house design team builds bespoke listing kits and digital presentations for partner realtors.
            </p>
            <Link
              href="/agents/apply"
              className="inline-block bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-black text-xs px-6 py-3 rounded-xl shadow-gold transition-all uppercase tracking-wider"
            >
              Join Agent Network →
            </Link>
          </div>
        </section>
      </div>

      <ChatWidgetWrapper context="agent" leadType="agent" />
    </div>
  );
}
