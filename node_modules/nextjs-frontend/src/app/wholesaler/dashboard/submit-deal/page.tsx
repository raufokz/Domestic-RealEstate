"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WholesalerLayout from "@/components/wholesaler/WholesalerLayout";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
];

const DEAL_SOURCES = [
  { value: "direct_mail", label: "Direct Mail" },
  { value: "driving_for_dollars", label: "Driving for Dollars" },
  { value: "mls", label: "MLS" },
  { value: "networking", label: "Networking" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  title: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  property_type: "single_family",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  year_built: "",
  asking_price: "",
  arv: "",
  repair_estimate: "",
  assignment_fee: "",
  monthly_rent_estimate: "",
  deal_source: "direct_mail",
  description: "",
  repair_details: "",
};

export default function WholesalerSubmitDealPage() {
  const router = useRouter();
  const { success, notifyError } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(status: "draft" | "new") {
    if (!form.address.trim()) {
      notifyError(null, "Enter a property address.");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/wholesaler/deals", {
        title: form.title.trim() || form.address.trim(),
        address: form.address.trim(),
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        zip: form.zip.trim() || undefined,
        property_type: form.property_type,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        sqft: form.sqft ? Number(form.sqft) : undefined,
        year_built: form.year_built ? Number(form.year_built) : undefined,
        asking_price: form.asking_price ? Number(form.asking_price) : undefined,
        arv: form.arv ? Number(form.arv) : undefined,
        repair_estimate: form.repair_estimate ? Number(form.repair_estimate) : undefined,
        assignment_fee: form.assignment_fee ? Number(form.assignment_fee) : undefined,
        monthly_rent_estimate: form.monthly_rent_estimate ? Number(form.monthly_rent_estimate) : undefined,
        deal_source: form.deal_source,
        description: form.description.trim() || undefined,
        repair_details: form.repair_details.trim() || undefined,
        status,
      });
      success(status === "draft" ? "Deal saved as draft." : "Deal submitted successfully.", "Wholesale Deal");
      router.push("/wholesaler/dashboard/deals");
    } catch (err) {
      notifyError(err, "Could not save this deal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WholesalerLayout title="Submit Deal" subtitle="List a new wholesale deal for your buyer network.">
      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Address</label>
              <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Enter full address" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">City / State / ZIP</label>
              <div className="flex gap-2">
                <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="City" className="w-1/3 border border-slate-200 rounded-lg px-2 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
                <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="State" className="w-1/3 border border-slate-200 rounded-lg px-2 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
                <input type="text" value={form.zip} onChange={(e) => update("zip", e.target.value)} placeholder="ZIP" className="w-1/3 border border-slate-200 rounded-lg px-2 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Type</label>
              <select value={form.property_type} onChange={(e) => update("property_type", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Bedrooms / Bathrooms</label>
              <div className="flex gap-2">
                <input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} placeholder="Beds" className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
                <input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} placeholder="Baths" className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Square Footage</label>
              <input type="number" value={form.sqft} onChange={(e) => update("sqft", e.target.value)} placeholder="e.g. 2000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Year Built</label>
              <input type="number" value={form.year_built} onChange={(e) => update("year_built", e.target.value)} placeholder="e.g. 1995" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Deal Financials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Asking Price</label>
              <input type="number" value={form.asking_price} onChange={(e) => update("asking_price", e.target.value)} placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">After Repair Value (ARV)</label>
              <input type="number" value={form.arv} onChange={(e) => update("arv", e.target.value)} placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Estimated Repairs</label>
              <input type="number" value={form.repair_estimate} onChange={(e) => update("repair_estimate", e.target.value)} placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Assignment Fee</label>
              <input type="number" value={form.assignment_fee} onChange={(e) => update("assignment_fee", e.target.value)} placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Rent Estimate</label>
              <input type="number" value={form.monthly_rent_estimate} onChange={(e) => update("monthly_rent_estimate", e.target.value)} placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Deal Source</label>
              <select value={form.deal_source} onChange={(e) => update("deal_source", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                {DEAL_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Additional Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Description</label>
              <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the property, condition, and key selling points..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Repair Details</label>
              <textarea rows={3} value={form.repair_details} onChange={(e) => update("repair_details", e.target.value)} placeholder="List major repair items needed..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Photos</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-500">Photo upload coming soon</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 10MB each</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => handleSubmit("draft")} disabled={saving} className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={() => handleSubmit("new")} disabled={saving} className="bg-[#C9A227] text-[#0A2647] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Submitting..." : "Submit Deal"}
          </button>
        </div>
      </div>
    </WholesalerLayout>
  );
}
