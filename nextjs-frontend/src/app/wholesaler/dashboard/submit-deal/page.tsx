"use client";

import WholesalerLayout from "@/components/wholesaler/WholesalerLayout";

export default function WholesalerSubmitDealPage() {
  return (
    <WholesalerLayout title="Submit Deal" subtitle="List a new wholesale deal for your buyer network.">
      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Address</label>
              <input type="text" placeholder="Enter full address" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>Single Family</option>
                <option>Multi-Family</option>
                <option>Condo</option>
                <option>Townhouse</option>
                <option>Land</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Bedrooms / Bathrooms</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Beds" className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
                <input type="number" placeholder="Baths" className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Square Footage</label>
              <input type="number" placeholder="e.g. 2000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Year Built</label>
              <input type="number" placeholder="e.g. 1995" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Deal Financials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Asking Price</label>
              <input type="text" placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">After Repair Value (ARV)</label>
              <input type="text" placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Estimated Repairs</label>
              <input type="text" placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Assignment Fee</label>
              <input type="text" placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Rent Estimate</label>
              <input type="text" placeholder="$0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Deal Source</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>Direct Mail</option>
                <option>Driving for Dollars</option>
                <option>MLS</option>
                <option>Networking</option>
                <option>Online</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Additional Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Description</label>
              <textarea rows={4} placeholder="Describe the property, condition, and key selling points..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Repair Details</label>
              <textarea rows={3} placeholder="List major repair items needed..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Photos</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-500">Drag and drop photos here, or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 10MB each</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            Save Draft
          </button>
          <button className="bg-[#C9A227] text-[#0A2647] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            Submit Deal
          </button>
        </div>
      </div>
    </WholesalerLayout>
  );
}
