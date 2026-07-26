"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";

export default function InvestorProfilePage() {
  return (
    <InvestorLayout title="Investor Profile" subtitle="Manage your investor information and investment preferences.">
      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">First Name</label>
              <input type="text" defaultValue="Robert" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
              <input type="text" defaultValue="Mitchell" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input type="email" defaultValue="r.mitchell@email.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
              <input type="tel" defaultValue="(555) 876-5432" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Investment Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Experience Level</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>Beginner (0-2 deals)</option>
                <option selected>Intermediate (3-10 deals)</option>
                <option>Advanced (10+ deals)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Investment Entity</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>Individual</option>
                <option selected>LLC</option>
                <option>Corporation</option>
                <option>Trust</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Available Capital</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>Under $100K</option>
                <option>$100K - $250K</option>
                <option selected>$250K - $500K</option>
                <option>$500K - $1M</option>
                <option>$1M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Target Markets</label>
              <input type="text" defaultValue="Miami, Tampa, Orlando" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Investment Goals</label>
              <textarea defaultValue="Build a diversified portfolio of rental properties generating passive income, with occasional fix-and-flip projects for capital appreciation." rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 resize-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-[#C9A227] text-[#0A2647] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            Save Profile
          </button>
        </div>
      </div>
    </InvestorLayout>
  );
}
