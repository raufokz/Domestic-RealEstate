"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiGet, ApiError } from "@/lib/api";
import UniversalChatWidget from "@/components/ai/UniversalChatWidget";

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
  property_type?: { id: number; name?: string | null } | null;
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

  // Seed filters from the URL so the homepage hero search actually lands here
  // with its criteria applied, and so a filtered search is shareable.
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") ?? "All");
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get("price") ?? "All");
  const [selectedBeds, setSelectedBeds] = useState(searchParams.get("beds") ?? "All");

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
    <div className="font-body">
      {/* Search Bar Section */}
      <section className="py-8 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-4 flex items-center gap-2">
              <div className="relative flex-1">
                <label htmlFor="property-search" className="sr-only">
                  Search city, ZIP, or address
                </label>
                <input
                  id="property-search"
                  name="q"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Search city, ZIP, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30"
                />
                <span className="absolute right-3 top-3.5 text-slate-400" aria-hidden="true">
                  🔍
                </span>
              </div>
              <button
                onClick={fetchProperties}
                className="bg-[#0A2647] hover:bg-[#0c2f57] text-white font-extrabold px-5 py-3 rounded-xl text-xs transition-all shadow-sm cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="property-type" className="sr-only">Property type</label>
              <select
                id="property-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227]"
              >
                <option value="All">All Property Types</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="property-price" className="sr-only">Price range</label>
              <select
                id="property-price"
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227]"
              >
                <option value="All">All Price Ranges</option>
                <option value="under-1m">Under $1,000,000</option>
                <option value="1m-2m">$1,000,000 – $2,000,000</option>
                <option value="2m-plus">$2,000,000+</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="property-beds" className="sr-only">Bedrooms</label>
              <select
                id="property-beds"
                value={selectedBeds}
                onChange={(e) => setSelectedBeds(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227]"
              >
                <option value="All">Beds: Any</option>
                <option value="2">2+ Beds</option>
                <option value="3">3+ Beds</option>
                <option value="4">4+ Beds</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Results Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-56 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-10 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchProperties}
              className="mt-4 px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
              <p className="text-sm font-bold text-slate-600">
                Showing{" "}
                <span className="text-[#0A2647] font-extrabold">{filteredProperties.length}</span>{" "}
                {filteredProperties.length === 1 ? "property" : "properties"}
                {hasFilters && properties.length !== filteredProperties.length && (
                  <span className="font-normal text-slate-400"> of {properties.length}</span>
                )}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-[#C9A227] hover:text-[#0A2647] transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Empty — distinguishes "no listings at all" from "filters too narrow" */}
            {filteredProperties.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
                <div className="text-4xl mb-4" aria-hidden="true">🏠</div>
                <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-2">
                  {properties.length === 0 ? "No listings available yet" : "No properties match your filters"}
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  {properties.length === 0
                    ? "New listings are added regularly. Contact our team and we will alert you as soon as something matches."
                    : "Try widening your price range, reducing the bedroom count, or clearing the location search."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                  <Link
                    href="/contact"
                    className="px-5 py-2.5 border border-[#0A2647] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#0A2647] hover:text-white transition-colors"
                  >
                    Contact an Advisor
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((p) => {
                  const photo = Array.isArray(p.photos) && p.photos.length ? p.photos[0] : null;
                  const location = [p.city, p.state].filter(Boolean).join(", ");
                  return (
                    <article
                      key={p.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div
                          className="h-56 bg-slate-800 bg-cover bg-center relative"
                          style={photo ? { backgroundImage: `url(${photo})` } : undefined}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2647]/70 via-transparent to-transparent" />
                          {p.property_type?.name && (
                            <span className="absolute top-4 left-4 bg-[#0A2647]/90 text-[#C9A227] border border-[#C9A227]/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {p.property_type.name}
                            </span>
                          )}
                          {p.featured && (
                            <span className="absolute top-4 right-4 bg-[#C9A227] text-[#0A2647] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                              Featured
                            </span>
                          )}
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <span className="text-2xl font-heading font-extrabold text-[#C9A227] font-mono block">
                              {formatPrice(p.price)}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="font-heading font-bold text-lg text-[#0A2647]">
                            <Link
                              href={`/properties/${p.slug}`}
                              className="hover:text-[#C9A227] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded"
                            >
                              {p.title}
                            </Link>
                          </h3>
                          <p className="text-slate-500 text-xs mt-1 mb-4">
                            {p.address ? `${p.address}${location ? ` · ${location}` : ""}` : location || "Location on request"}
                          </p>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs text-slate-700 font-bold">
                            <div>🛏 {p.bedrooms ?? "—"} Beds</div>
                            <div>🛁 {p.bathrooms ?? "—"} Baths</div>
                            <div>📐 {p.sqft ? p.sqft.toLocaleString() : "—"} sqft</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-0 space-y-2">
                        <Link
                          href={`/properties/${p.slug}`}
                          className="block w-full bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white font-heading font-bold text-xs py-3 rounded-xl transition-all text-center"
                        >
                          View Details →
                        </Link>
                        <Link
                          href={`/properties/${p.slug}#schedule-viewing`}
                          className="block w-full border border-[#0A2647]/20 text-[#0A2647] hover:border-[#C9A227] font-heading font-bold text-xs py-3 rounded-xl transition-all text-center"
                        >
                          Schedule Private Tour
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <UniversalChatWidget context="property" leadType="buyer" />
    </div>
  );
}
