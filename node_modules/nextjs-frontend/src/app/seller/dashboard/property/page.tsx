"use client";

import SellerLayout from "@/components/seller/SellerLayout";

export default function SellerPropertyPage() {
  return (
    <SellerLayout title="My Property" subtitle="View and manage your listed property details.">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-56 bg-gradient-to-br from-cyan-400 to-blue-600 flex items-end p-6">
            <div>
              <span className="bg-white/90 backdrop-blur text-[#0A2647] px-3 py-1 rounded-lg text-sm font-bold">$675,000</span>
              <span className="ml-2 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">Active</span>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#0A2647]">Sunset Villa with Pool</h2>
            <p className="text-slate-500 mt-1">1245 Palm Avenue, Miami, FL 33101</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Bedrooms", value: "4" },
                { label: "Bathrooms", value: "3" },
                { label: "Square Feet", value: "2,650" },
                { label: "Year Built", value: "2018" },
                { label: "Lot Size", value: "0.35 acres" },
                { label: "Garage", value: "2-car" },
                { label: "Property Type", value: "Single Family" },
                { label: "HOA", value: "$200/mo" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-[#0A2647] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2647]">1,247</p>
                <p className="text-xs text-slate-500">Total Views</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2647]">89</p>
                <p className="text-xs text-slate-500">Favorites</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2647]">6</p>
                <p className="text-xs text-slate-500">Showing Requests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-[#0A2647] mb-3">Description</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Beautiful modern villa in the heart of Miami featuring a private pool, open floor plan, and stunning views. Recently renovated kitchen with premium appliances, spacious master suite with walk-in closet, and a landscaped backyard perfect for entertaining. Located in a highly desirable neighborhood with top-rated schools and easy access to shopping and dining.
          </p>
          <div className="flex gap-3 mt-4">
            <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
              Edit Listing
            </button>
            <button className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
              View Public Listing
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
