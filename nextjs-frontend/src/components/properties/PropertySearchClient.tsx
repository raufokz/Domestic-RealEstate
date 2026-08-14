"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiGet, ApiError } from "@/lib/api";
import { propertyPhotoPaths } from "@/lib/properties";
import { storageUrl } from "@/lib/media";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";
import dynamic from "next/dynamic";

const PropertyListingsMap = dynamic(() => import("./PropertyListingsMap"), { ssr: false });

/** Shape returned by GET /properties (Laravel paginator of Property models). */
interface ApiProperty {
  id: number;
  slug: string;
  title: string;
  price?: string | number | null;
  bedrooms?: number | null;
  bathrooms?: number | string | null;
  sqft?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  featured?: boolean;
  photos?: string[] | null;
  images?: { id: number; path: string; is_featured: boolean; sort_order: number }[] | null;
  property_type?: { id: number; name?: string | null } | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

function formatPrice(price?: string | number | null): string {
  if (price === null || price === undefined || price === "") return "Contact for price";
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (!isFinite(n) || n <= 0) return "Contact for price";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function priceNumber(price?: string | number | null): number {
  const n = typeof price === "string" ? parseFloat(price) : (price ?? 0);
  return isFinite(n as number) ? (n as number) : 0;
}

export default function PropertySearchClient() {
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agents, setAgents] = useState<any[]>([]);

  // Seed filters from the URL so the homepage hero search actually lands here
  // with its criteria applied, and so a filtered search is shareable.
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") ?? "All");
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get("price") ?? "All");
  const [selectedBeds, setSelectedBeds] = useState(searchParams.get("beds") ?? "All");

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await apiGet<any>("/agents?per_page=100");
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setAgents(list);
      } catch (e) {
        console.error("Could not load agents", e);
      }
    }
    loadAgents();
  }, []);

  const preferredAgent = useMemo(() => {
    if (agents.length === 0) return null;
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      // Find agent covering this zipcode or city
      const match = agents.find((a) => {
        const zipMatch = a.service_areas?.some((zip: string) => zip.toLowerCase().includes(term));
        const cityMatch = a.office_city?.toLowerCase().includes(term);
        return zipMatch || cityMatch;
      });
      if (match) return match;
    }
    // Fallback to first featured agent or any agent
    return agents.find((a) => a.is_featured) || agents[0];
  }, [agents, searchTerm]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet<{ data: ApiProperty[] } | ApiProperty[]>(
        "/properties?per_page=60"
      );
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setProperties(list);
    } catch (e) {
      // Never fall back to invented listings — say what went wrong and offer retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load properties. Please check your connection and try again."
      );
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  /** Property type options built from what is actually in the results. */
  const typeOptions = useMemo(() => {
    const names = new Set<string>();
    for (const p of properties) {
      if (p.property_type?.name) names.add(p.property_type.name);
    }
    return Array.from(names).sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return properties.filter((p) => {
      const haystack = [p.title, p.address, p.city, p.state]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !term || haystack.includes(term);

      const matchesType =
        selectedType === "All" || (p.property_type?.name ?? "") === selectedType;

      const beds = p.bedrooms ?? 0;
      const matchesBeds = selectedBeds === "All" || beds >= parseInt(selectedBeds, 10);

      const value = priceNumber(p.price);
      let matchesPrice = true;
      if (selectedPrice === "under-1m") matchesPrice = value > 0 && value < 1_000_000;
      else if (selectedPrice === "1m-2m") matchesPrice = value >= 1_000_000 && value <= 2_000_000;
      else if (selectedPrice === "2m-plus") matchesPrice = value > 2_000_000;
      else if (selectedPrice.includes("-")) {
        // Ranges handed over from the homepage hero, e.g. "500000-1000000" or "1000000-"
        const [lo, hi] = selectedPrice.split("-");
        const min = parseInt(lo, 10);
        const max = hi ? parseInt(hi, 10) : Infinity;
        if (isFinite(min)) matchesPrice = value >= min && value <= max;
      }

      return matchesSearch && matchesType && matchesBeds && matchesPrice;
    });
  }, [properties, searchTerm, selectedType, selectedPrice, selectedBeds]);

  function clearFilters() {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedPrice("All");
    setSelectedBeds("All");
  }

  const hasFilters =
    searchTerm.trim() !== "" ||
    selectedType !== "All" ||
    selectedPrice !== "All" ||
    selectedBeds !== "All";

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      
      {/* Intro Portal Header */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#0A2647] tracking-tight">
              Premium Properties Portfolio
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5 font-medium">Explore real-time listings on our map-synchronized search hub.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="bg-[#0A2647] text-[#C9A227] text-xs font-bold px-3.5 py-2 rounded-xl border border-[#C9A227]/25 shadow-sm">
              Miami Real Estate
            </span>
          </div>
        </div>
      </header>

      {/* Local Preferred Agent Spotlight Banner */}
      {preferredAgent && (
        <div className="bg-gradient-to-r from-[#0A2647] to-[#113a6b] text-white py-4 px-6 border-b border-[#C9A227]/30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full border-2 border-[#C9A227] flex items-center justify-center overflow-hidden shrink-0">
                {preferredAgent.user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={storageUrl(preferredAgent.user.avatar) ?? undefined} alt={preferredAgent.user?.name || "Agent"} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-sm text-[#C9A227]">
                    {preferredAgent.user?.name
                      ? preferredAgent.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "AG"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[#C9A227] text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  ★ Local Preferred Agent
                  {searchTerm && <span className="text-white/60 font-normal lowercase tracking-normal"> (Covering &quot;{searchTerm}&quot;)</span>}
                </p>
                <h4 className="font-heading font-extrabold text-sm sm:text-base text-white hover:underline">
                  <Link href={`/agents/${preferredAgent.slug}`}>
                    {preferredAgent.user?.name || "Domestic Real Estate Agent"}
                  </Link>
                </h4>
                {preferredAgent.headline && <p className="text-white/70 text-xs font-medium">{preferredAgent.headline}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {preferredAgent.lead_type_preferences?.leads && preferredAgent.lead_type_preferences.leads.length > 0 && (
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-white/60">
                  <span>Specialties:</span>
                  <div className="flex gap-1">
                    {preferredAgent.lead_type_preferences.leads.slice(0, 2).map((l: string, i: number) => (
                      <span key={i} className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded">{l}</span>
                    ))}
                  </div>
                </div>
              )}
              <a href={`tel:${preferredAgent.office_phone || preferredAgent.user?.phone || '555-0199'}`} className="bg-[#C9A227] text-[#0A2647] hover:bg-[#b8911f] transition text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                📞 Call Agent
              </a>
              <Link href={`/agents/${preferredAgent.slug}`} className="bg-white/10 hover:bg-white/20 transition text-white border border-white/20 text-xs font-semibold px-4 py-2 rounded-xl">
                View Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Portal View Area */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Filter Panel (lg:col-span-3) */}
          <aside className="lg:col-span-3 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/60 shadow-premium-sm lg:sticky lg:top-24">
            <h2 className="font-heading font-extrabold text-[#0A2647] text-base sm:text-lg mb-5 flex items-center gap-2">
              <span className="text-[#C9A227]">🔍</span> Search Criteria
            </h2>

            <div className="space-y-5">
              
              {/* Location Input */}
              <div>
                <label htmlFor="sidebar-keyword" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 font-heading">Location Keyword</label>
                <div className="relative">
                  <input
                    id="sidebar-keyword"
                    type="text"
                    placeholder="Enter city, ZIP, address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all font-semibold font-body"
                  />
                  <span className="absolute right-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
                </div>
              </div>

              {/* Property Type Selector */}
              <div>
                <label htmlFor="sidebar-type" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 font-heading">Property Type</label>
                <select
                  id="sidebar-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] font-semibold font-body"
                >
                  <option value="All">All Property Types</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Selector */}
              <div>
                <label htmlFor="sidebar-price" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 font-heading">Price Budget</label>
                <select
                  id="sidebar-price"
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] font-semibold font-body"
                >
                  <option value="All">Any Price range</option>
                  <option value="under-1m">Under $1,000,000</option>
                  <option value="1m-2m">$1,000,000 – $2,000,000</option>
                  <option value="2m-plus">$2,000,000+</option>
                </select>
              </div>

              {/* Beds Min Selector */}
              <div>
                <label htmlFor="sidebar-beds" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 font-heading">Bedrooms</label>
                <select
                  id="sidebar-beds"
                  value={selectedBeds}
                  onChange={(e) => setSelectedBeds(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] font-semibold font-body"
                >
                  <option value="All">Any Bedrooms</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              {/* Reset CTA */}
              <div className="pt-2 space-y-2.5">
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white font-heading font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all text-center block cursor-pointer border-b-2 border-slate-800"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={fetchProperties}
                  className="w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-heading font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all text-center block cursor-pointer"
                >
                  Refresh Feed
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column: Split Listing (md:col-span-9) */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* List Column (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              
              <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-slate-100 shadow-premium-sm">
                <p className="text-xs sm:text-sm font-bold text-slate-500 font-body">
                  Showing <span className="text-[#0A2647] font-extrabold">{filteredProperties.length}</span> matching properties
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Synchronized</span>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse">
                      <div className="h-48 bg-slate-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-8 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center shadow-sm">
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                  <button
                    onClick={fetchProperties}
                    className="mt-4 px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#b8911f] transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredProperties.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-premium-sm">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-lg font-extrabold text-[#0A2647] mb-2">
                    {properties.length === 0 ? "No listings available" : "No results match filters"}
                  </h3>
                  <p className="text-slate-400 font-body text-xs max-w-sm mx-auto leading-normal">
                    {properties.length === 0
                      ? "New listings are added daily. Drop our team a message to alert you."
                      : "Try loosening your search keywords or clearing price boundaries."}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-bold hover:bg-[#b8911f] transition-colors"
                      >
                        Reset All Filters
                      </button>
                    )}
                    <Link
                      href="/contact"
                      className="px-5 py-2.5 border border-[#0A2647] text-[#0A2647] rounded-lg text-xs font-bold hover:bg-[#0A2647] hover:text-white transition-colors"
                    >
                      Contact Advisor
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredProperties.map((p) => {
                    const photo = storageUrl(propertyPhotoPaths(p)[0]) ?? null;
                    const location = [p.city, p.state].filter(Boolean).join(", ");
                    return (
                      <article
                        key={p.id}
                        className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-premium-sm hover:shadow-premium-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div
                            className="h-48 bg-slate-800 bg-cover bg-center relative"
                            style={photo ? { backgroundImage: `url(${photo})` } : undefined}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                            {p.property_type?.name && (
                              <span className="absolute top-4 left-4 bg-[#0A2647] text-[#C9A227] border border-[#C9A227]/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {p.property_type.name}
                              </span>
                            )}
                            {p.featured && (
                              <span className="absolute top-4 right-4 bg-[#C9A227] text-[#0A2647] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                              <span className="text-xl font-heading font-extrabold text-[#C9A227] font-mono block">
                                {formatPrice(p.price)}
                              </span>
                            </div>
                          </div>

                          <div className="p-5">
                            <h3 className="font-heading font-bold text-base text-[#0A2647] line-clamp-1">
                              <Link
                                href={`/properties/${p.slug}`}
                                className="hover:text-[#C9A227] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                              >
                                {p.title}
                              </Link>
                            </h3>
                            <p className="text-slate-400 text-xs mt-1 mb-4 truncate font-medium">
                              {p.address ? `${p.address}${location ? ` · ${location}` : ""}` : location || "Location on request"}
                            </p>

                            <div className="grid grid-cols-3 gap-1 py-2.5 border-y border-slate-100 text-center text-[10px] text-slate-500 font-bold tracking-wider">
                              <div>🛌 {p.bedrooms ?? "—"} Beds</div>
                              <div>🛁 {p.bathrooms ?? "—"} Baths</div>
                              <div>📐 {p.sqft ? p.sqft.toLocaleString() : "—"} sqft</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0 space-y-2">
                          <Link
                            href={`/properties/${p.slug}`}
                            className="block w-full bg-[#0A2647] hover:!bg-[#C9A227] hover:!text-[#0A2647] !text-white font-heading font-bold text-xs py-3 rounded-xl transition-all text-center border-b-2 border-slate-800"
                          >
                            Explore Details
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sticky Map Column (5 cols) */}
            <div className="hidden md:block md:col-span-5 relative">
              <div className="sticky top-24 h-[calc(100vh-140px)] min-h-[480px]">
                <PropertyListingsMap properties={filteredProperties} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ChatWidgetWrapper context="property" leadType="buyer" />
    </div>
  );
}
