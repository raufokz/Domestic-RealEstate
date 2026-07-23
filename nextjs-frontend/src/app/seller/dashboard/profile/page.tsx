"use client";

import SellerLayout from "@/components/seller/SellerLayout";

export default function SellerProfilePage() {
  return (
    <SellerLayout title="Seller Profile" subtitle="Manage your personal information and property ownership details.">
      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">First Name</label>
              <input type="text" defaultValue="Sarah" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
              <input type="text" defaultValue="Martinez" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input type="email" defaultValue="sarah.martinez@email.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
              <input type="tel" defaultValue="(555) 987-6543" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Address</label>
              <input type="text" defaultValue="1245 Palm Avenue, Miami, FL 33101" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option selected>Single Family</option>
                <option>Condo</option>
                <option>Townhouse</option>
                <option>Multi-Family</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Years Owned</label>
              <input type="text" defaultValue="5" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Mortgage Balance</label>
              <input type="text" defaultValue="$320,000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Preferred Sale Timeline</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>ASAP</option>
                <option selected>1-3 months</option>
                <option>3-6 months</option>
                <option>No rush</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-[#C9A227] text-[#0A2647] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            Save Profile
          </button>
        </div>
      </div>
    </SellerLayout>
  );
}
