"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import MarketplaceCountdown from "@/components/marketplace/MarketplaceCountdown";

interface MarketplaceLead {
  id: number;
  lead_number: string;
  title: string;
  category: string | null;
  description: string | null;
  price: number;
  status: "available" | "reserved" | "sold";
  location: string | null;
  state: string | null;
  city: string | null;
  budget_min: number;
  budget_max: number;
  type: string;
  listed_at: string | null;
  views_count: number;
  attachments_count: number;
  reserved_by_me: boolean;
  sold_to_me: boolean;
  reservation_expires_at: string | null;
  purchase: { paid_at: string | null; amount: number } | null;
}

interface UserNotification {
  id: number;
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  read_at: string | null;
  created_at: string;
}

interface ReservationState {
  lead: MarketplaceLead;
  token: string;
  expiresAt: string;
  /** "unpaid" = show the payment form; "awaiting" = bank transfer submitted,
   * pending admin/webhook confirmation. Payoneer checkout never reaches
   * either "paid" state here — the browser redirects to Payoneer instead. */
  paymentState: "unpaid" | "awaiting";
}

const CATEGORIES = ["Pay Per Close", "Exclusive Buyer", "Exclusive Seller", "Residential", "Commercial", "Luxury", "Investment", "Land", "Rental"];
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

function budgetRange(lead: MarketplaceLead): string {
  if (!lead.budget_min && !lead.budget_max) return "Budget: N/A";
  if (lead.budget_min && lead.budget_max) {
    return `Budget: $${lead.budget_min.toLocaleString()}–$${lead.budget_max.toLocaleString()}`;
  }
  return `Budget: $${(lead.budget_min || lead.budget_max).toLocaleString()}+`;
}

function postedTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function MarketplacePage() {
  const { user, loading: authLoading } = useAuth();
  const { success, notifyError } = useToast();

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Construct API Query String
  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (selectedState) queryParams.set("state", selectedState);
  if (selectedCity) queryParams.set("city", selectedCity);
  if (selectedCategory) queryParams.set("category", selectedCategory);
  if (selectedType) queryParams.set("type", selectedType);
  if (minPrice) queryParams.set("min_price", minPrice);
  if (maxPrice) queryParams.set("max_price", maxPrice);
  if (datePosted) queryParams.set("date_posted", datePosted);
  if (sort) queryParams.set("sort", sort);
  queryParams.set("page", String(page));

  const { data, loading, error, refetch } = useFetch<{
    data: MarketplaceLead[];
    meta?: { current_page: number; last_page: number; total: number };
  }>(`/marketplace?${queryParams.toString()}`);

  const { data: notifData, refetch: refetchNotifs } = useFetch<{ data: UserNotification[] }>("/my/notifications");

  const [reservation, setReservation] = useState<ReservationState | null>(null);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"payoneer" | "bank_transfer">("payoneer");

  const leads = data?.data || [];
  const meta = data?.meta;
  const unread = (notifData?.data || []).filter((n) => !n.read_at && !dismissed.includes(String(n.id)));

  const activeFiltersCount = [search, selectedState, selectedCity, selectedCategory, selectedType, minPrice, maxPrice, datePosted].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedCategory("");
    setSelectedType("");
    setMinPrice("");
    setMaxPrice("");
    setDatePosted("");
    setSort("newest");
    setPage(1);
  };

  const reserve = useCallback(
    async (lead: MarketplaceLead) => {
      if (busy) return;
      setBusy(true);
      try {
        const res = await apiPost<{ token: string; expires_at: string }>(`/marketplace/leads/${lead.id}/reserve`);
        setReservation({ lead, token: res.token, expiresAt: res.expires_at, paymentState: "unpaid" });
        refetch();
      } catch (e) {
        notifyError(e, "Could not reserve this lead. It may have just been taken.");
        refetch();
      } finally {
        setBusy(false);
      }
    },
    [busy, notifyError, refetch]
  );

  const processPayment = useCallback(async () => {
    if (!reservation || busy) return;
    setBusy(true);
    try {
      const res = await apiPost<{ status: string; message: string; expires_at?: string; checkout_url?: string }>(
        `/marketplace/leads/${reservation.lead.id}/process-payment`,
        { token: reservation.token, payment_method: paymentMethod }
      );

      if (res.status === "checkout_created" && res.checkout_url) {
        // Real Payoneer-hosted checkout — the lead only unlocks after
        // Payoneer's signature-verified webhook confirms payment, never
        // from this response alone.
        window.location.href = res.checkout_url;
        return;
      }

      success(res.message);
      setReservation({ ...reservation, paymentState: "awaiting", expiresAt: res.expires_at || reservation.expiresAt });
      refetch();
    } catch (e) {
      notifyError(e, "Payment could not be started. Your reservation may have expired.");
      setReservation(null);
      refetch();
    } finally {
      setBusy(false);
    }
  }, [reservation, busy, paymentMethod, success, notifyError, refetch]);

  const release = useCallback(async () => {
    if (!reservation || busy) return;
    setBusy(true);
    try {
      await apiPost(`/marketplace/leads/${reservation.lead.id}/release`);
      setReservation(null);
      success("Lead released back to the marketplace.");
      refetch();
    } catch (e) {
      notifyError(e, "Could not release this lead.");
    } finally {
      setBusy(false);
    }
  }, [reservation, busy, success, notifyError, refetch]);

  const markRead = async () => {
    if (unread.length === 0) return;
    try {
      await apiPost("/my/notifications/read", { ids: unread.map((n) => n.id) });
      setDismissed((d) => [...d, ...unread.map((n) => String(n.id))]);
      refetchNotifs();
    } catch {
      // Non-fatal
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0A2647] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
          <div className="text-4xl mb-3">🔓</div>
          <h1 className="text-2xl font-bold text-[#0A2647] mb-2">Sign in to buy leads</h1>
          <p className="text-slate-500 text-sm mb-6">
            Pay-per-lead gives you exclusive access to verified real estate opportunities on a first-come, first-served basis.
          </p>
          <Link href="/login" className="inline-block bg-[#C9A227] text-[#0A2647] font-bold px-6 py-3 rounded-xl hover:bg-[#b8911f] transition">
            Sign In to Access
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Exclusive Lead Exchange
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0A2647]">Pay-Per-Lead Marketplace</h1>
          <p className="text-slate-500 mt-1">
            High-intent property buyers &amp; sellers. First to purchase unlocks complete contact information.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/how-it-works"
            className="text-sm font-semibold text-slate-600 hover:text-[#0A2647] bg-slate-100 px-4 py-2 rounded-xl transition"
          >
            How it Works
          </Link>
          <Link
            href="/marketplace/purchased"
            className="text-sm font-bold text-[#0A2647] bg-[#C9A227] px-5 py-2 rounded-xl hover:bg-[#b8911f] transition shadow-sm"
          >
            My Purchased Leads →
          </Link>
        </div>
      </div>

      {/* Notifications Banner */}
      {unread.length > 0 && (
        <div className="mb-6 bg-[#0A2647] text-white rounded-xl p-4 flex items-center justify-between gap-3 shadow-md">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">🔔 {unread[0].title}</p>
            <p className="text-white/80 text-sm mt-0.5 truncate">{unread[0].message}</p>
          </div>
          <button
            onClick={markRead}
            className="shrink-0 bg-[#C9A227] text-[#0A2647] text-xs font-bold px-3.5 py-1.5 rounded-lg hover:bg-[#b8911f] transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search leads by title, location, city..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-[#0A2647] focus:outline-none focus:border-[#0A2647]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0A2647]"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0A2647]"
            >
              <option value="">All States</option>
              {US_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0A2647]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border flex items-center gap-1.5 transition ${
                activeFiltersCount > 0
                  ? "bg-[#0A2647] text-white border-[#0A2647]"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>⚙️ Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#C9A227] text-[#0A2647] text-xs font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Miami, Dallas"
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Lead Type</label>
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="investor">Investor</option>
                <option value="realtor">Realtor</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Price Range ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Date Posted</label>
              <select
                value={datePosted}
                onChange={(e) => { setDatePosted(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Anytime</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
            {search && <Chip label={`Search: "${search}"`} onClear={() => setSearch("")} />}
            {selectedCategory && <Chip label={`Category: ${selectedCategory}`} onClear={() => setSelectedCategory("")} />}
            {selectedState && <Chip label={`State: ${selectedState}`} onClear={() => setSelectedState("")} />}
            {selectedCity && <Chip label={`City: ${selectedCity}`} onClear={() => setSelectedCity("")} />}
            {selectedType && <Chip label={`Type: ${selectedType}`} onClear={() => setSelectedType("")} />}
            {minPrice && <Chip label={`Min: $${minPrice}`} onClear={() => setMinPrice("")} />}
            {maxPrice && <Chip label={`Max: $${maxPrice}`} onClear={() => setMaxPrice("")} />}
            {datePosted && <Chip label={`Date: ${datePosted}`} onClear={() => setDatePosted("")} />}
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-red-600 hover:underline ml-2"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Access Denied Warning */}
      {error && error.includes("not eligible") && (
        <div className="mb-6 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold">PPL Program Access Required</h3>
          <p className="text-sm mt-1 max-w-md mx-auto text-amber-800">
            {error} Please contact support or your account manager to activate Pay-Per-Lead access.
          </p>
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="text-xl font-bold text-[#0A2647] mb-1">No matching leads found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            {activeFiltersCount > 0
              ? "Try adjusting or clearing your filters to see more leads."
              : "No leads are available in the marketplace at this moment. Check back soon!"}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-5 bg-[#0A2647] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#07162C] transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} busy={busy} onUnlock={reserve} />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">
                Page {meta.current_page} of {meta.last_page} ({meta.total} total leads)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-40 hover:bg-slate-100"
                >
                  ← Previous
                </button>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-40 hover:bg-slate-100"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reservation & Multi-Gateway Payment Modal */}
      {reservation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-[#0A2647] w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
                  {reservation.lead.category || reservation.lead.type}
                </span>
                <h3 className="text-xl font-extrabold text-[#0A2647]">{reservation.lead.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {reservation.lead.location || "Location on purchase"} · {budgetRange(reservation.lead)}
                </p>
              </div>
              <button
                onClick={() => setReservation(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {reservation.paymentState === "unpaid" ? (
              <>
                {/* Hold Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Reservation Lock</span>
                    <span className="text-2xl font-black text-[#0A2647]">${reservation.lead.price}</span>
                  </div>
                  <p className="text-xs text-amber-900">
                    Lead is reserved exclusively for you for{" "}
                    <span className="font-extrabold text-[#0A2647]">
                      <MarketplaceCountdown
                        expiresAt={reservation.expiresAt}
                        onExpire={() => {
                          setReservation(null);
                          success("Reservation expired. Lead returned to marketplace.");
                          refetch();
                        }}
                      />
                    </span>
                    . Complete payment before the timer expires.
                  </p>
                </div>

                {/* Gateway Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("payoneer")}
                      className={`p-3 rounded-xl border text-left font-bold text-xs flex flex-col gap-1 transition ${
                        paymentMethod === "payoneer"
                          ? "border-[#0A2647] bg-[#0A2647]/5 text-[#0A2647]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>💳 Card via Payoneer</span>
                      <span className="text-[10px] text-slate-400 font-normal">Secure checkout</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`p-3 rounded-xl border text-left font-bold text-xs flex flex-col gap-1 transition ${
                        paymentMethod === "bank_transfer"
                          ? "border-[#0A2647] bg-[#0A2647]/5 text-[#0A2647]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>🏦 Bank / Manual Transfer</span>
                      <span className="text-[10px] text-slate-400 font-normal">Admin verified</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === "payoneer" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-xs text-slate-600">
                    <p className="font-bold text-[#0A2647] mb-1">🔒 Secure Payoneer Checkout</p>
                    <p>
                      You&apos;ll be redirected to Payoneer&apos;s secure hosted checkout to enter your card details.
                      We never see or store your card information. The lead unlocks automatically once payment is confirmed.
                    </p>
                  </div>
                )}

                {/* Bank Instructions */}
                {paymentMethod === "bank_transfer" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-xs space-y-1 text-slate-600">
                    <p className="font-bold text-[#0A2647]">Bank Transfer Instructions:</p>
                    <p>Account: Domestic Real Estate PPL LLC</p>
                    <p>Bank: Chase Bank N.A.</p>
                    <p>Routing #: 123456789 | Account #: 987654321</p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      After submitting, your lead will be held for 48 hours while our team verifies receipt.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={processPayment}
                    disabled={busy}
                    className="w-full bg-[#C9A227] text-[#0A2647] font-extrabold py-3.5 rounded-xl hover:bg-[#b8911f] transition disabled:opacity-50 text-base shadow-md"
                  >
                    {busy
                      ? "Redirecting to secure checkout..."
                      : paymentMethod === "payoneer"
                        ? `Pay $${reservation.lead.price} via Payoneer`
                        : `Submit $${reservation.lead.price} Bank Transfer`}
                  </button>
                  <button
                    onClick={release}
                    disabled={busy}
                    className="w-full bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition disabled:opacity-50 text-sm"
                  >
                    Cancel &amp; Release Hold
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">⏳</div>
                <h4 className="font-extrabold text-[#0A2647] text-lg">Payment Awaiting Confirmation</h4>
                <p className="text-sm text-amber-900 mt-2">
                  Your bank transfer was submitted. This lead is held for you while our team verifies receipt — it
                  unlocks automatically as soon as payment is confirmed.
                </p>
                <div className="mt-5 flex gap-3 justify-center">
                  <Link
                    href="/marketplace/purchased"
                    className="bg-[#0A2647] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#07162C] transition shadow-md"
                  >
                    View My Unlocked Leads
                  </Link>
                  <button
                    onClick={() => setReservation(null)}
                    className="bg-slate-200 text-slate-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
      {label}
      <button onClick={onClear} className="hover:text-red-600 font-bold">✕</button>
    </span>
  );
}

function LeadCard({
  lead,
  busy,
  onUnlock,
}: {
  lead: MarketplaceLead;
  busy: boolean;
  onUnlock: (lead: MarketplaceLead) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#C9A227] bg-amber-50 px-2.5 py-0.5 rounded-md">
            {lead.category || lead.type}
          </span>
          <StatusBadge lead={lead} />
        </div>

        <h3 className="text-lg font-bold text-[#0A2647] leading-snug">{lead.title}</h3>
        {lead.description && (
          <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{lead.description}</p>
        )}

        <div className="text-sm text-slate-600 mt-4 space-y-1.5">
          <p className="flex items-center gap-1.5">
            <span>📍</span> {lead.location || "Location revealed on purchase"}
          </p>
          <p className="flex items-center gap-1.5">
            <span>💰</span> {budgetRange(lead)}
          </p>
          <div className="flex items-center justify-between text-slate-400 text-xs pt-1">
            <span>Posted {postedTime(lead.listed_at)}</span>
            {lead.views_count > 0 && <span>👁️ {lead.views_count} views</span>}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Lead Price</span>
          <p className="text-2xl font-black text-[#0A2647]">${lead.price}</p>
        </div>

        {(lead.status === "available" || (lead.status === "reserved" && lead.reserved_by_me)) && (
          <button
            onClick={() => onUnlock(lead)}
            disabled={busy}
            className={`font-bold text-sm px-5 py-2.5 rounded-xl transition disabled:opacity-50 shadow-sm ${
              lead.status === "reserved"
                ? "bg-[#C9A227] text-[#0A2647] hover:bg-[#b8911f]"
                : "bg-[#0A2647] text-white hover:bg-[#07162C]"
            }`}
          >
            {busy ? "Locking..." : lead.status === "reserved" ? "Complete Payment" : "Unlock Lead"}
          </button>
        )}

        {lead.status === "reserved" && !lead.reserved_by_me && (
          <div className="text-right">
            <span className="inline-block text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              ⏳ Reserved
              {lead.reservation_expires_at && (
                <>
                  {" "}
                  · <MarketplaceCountdown expiresAt={lead.reservation_expires_at} />
                </>
              )}
            </span>
          </div>
        )}

        {lead.status === "sold" && lead.sold_to_me && (
          <Link
            href="/marketplace/purchased"
            className="bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
          >
            View Contact
          </Link>
        )}

        {lead.status === "sold" && !lead.sold_to_me && (
          <span className="inline-block text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-lg">
            Sold
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ lead }: { lead: MarketplaceLead }) {
  if (lead.status === "sold") {
    return (
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${lead.sold_to_me ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
        {lead.sold_to_me ? "Purchased" : "Sold"}
      </span>
    );
  }
  if (lead.status === "reserved") {
    return (
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${lead.reserved_by_me ? "bg-amber-100 text-amber-800" : "bg-orange-100 text-orange-800"}`}>
        Reserved
      </span>
    );
  }
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Available</span>;
}
