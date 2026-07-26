"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/realtor/dashboard", active: false, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Leads", href: "/realtor/dashboard/leads", active: false, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Properties", href: "/realtor/dashboard/properties", active: false, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
  { label: "Profile", href: "/realtor/dashboard/profile", active: true, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    headline: "Luxury Real Estate Specialist | Top 1% Agent",
    bio: "With over 12 years of experience in luxury real estate, I specialize in helping discerning clients find their perfect home. My deep market knowledge, negotiation skills, and commitment to excellence have earned me a reputation as one of the top agents in the Miami market.",
    license: "RE-2847561",
    brokerage: "Domestic Real Estate Group",
    phone: "(555) 987-6543",
    email: "sarah.johnson@domesticre.com",
    specialties: "Luxury Homes, Waterfront Properties, Investment Properties",
    languages: "English, Spanish, Portuguese",
    serviceAreas: "Miami Beach, Coral Gables, Key Biscayne, Brickell",
    website: "https://sarahjohnson.domesticre.com",
    linkedin: "linkedin.com/in/sarahjohnson",
    twitter: "@sarahjohnson_re",
    instagram: "@sarahjohnson.realty",
    officeAddress: "1200 Brickell Ave, Suite 800, Miami, FL 33131",
  });

  const updateProfile = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2647] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Logo size="md" />
          <span className="text-white font-bold">Domestic RE</span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${item.active ? "bg-[#C9A227]/10 text-[#C9A227]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0A2647]">Edit Profile</h1>
              <p className="text-slate-500 text-sm">Manage your public profile and contact information</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="bg-[#C9A227] text-[#0A2647] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
          </button>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-[#0A2647] mb-5">Avatar</h2>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0A2647] to-[#0d3366] rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{profile.firstName[0]}{profile.lastName[0]}</span>
                  </div>
                  <div>
                    <button className="bg-[#0A2647] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0d3366] transition">
                      Upload Photo
                    </button>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-[#0A2647] mb-5">Basic Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                    <input type="text" value={profile.firstName} onChange={(e) => updateProfile("firstName", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                    <input type="text" value={profile.lastName} onChange={(e) => updateProfile("lastName", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Professional Headline</label>
                    <input type="text" value={profile.headline} onChange={(e) => updateProfile("headline", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                    <textarea value={profile.bio} onChange={(e) => updateProfile("bio", e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number</label>
                    <input type="text" value={profile.license} onChange={(e) => updateProfile("license", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Brokerage</label>
                    <input type="text" value={profile.brokerage} onChange={(e) => updateProfile("brokerage", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                    <input type="tel" value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input type="email" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-[#0A2647] mb-5">Expertise</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialties</label>
                    <input type="text" value={profile.specialties} onChange={(e) => updateProfile("specialties", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Languages</label>
                    <input type="text" value={profile.languages} onChange={(e) => updateProfile("languages", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Areas</label>
                    <input type="text" value={profile.serviceAreas} onChange={(e) => updateProfile("serviceAreas", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-[#0A2647] mb-5">Social Links</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                    <input type="url" value={profile.website} onChange={(e) => updateProfile("website", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn</label>
                      <input type="text" value={profile.linkedin} onChange={(e) => updateProfile("linkedin", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Twitter</label>
                      <input type="text" value={profile.twitter} onChange={(e) => updateProfile("twitter", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Instagram</label>
                      <input type="text" value={profile.instagram} onChange={(e) => updateProfile("instagram", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-[#0A2647] mb-5">Office Address</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <input type="text" value={profile.officeAddress} onChange={(e) => updateProfile("officeAddress", e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none text-sm text-slate-800" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-br from-[#0A2647] to-[#0d3366] p-6 text-center">
                    <div className="w-20 h-20 bg-[#C9A227] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-[#0A2647] text-2xl font-bold">{profile.firstName[0]}{profile.lastName[0]}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg">{profile.firstName} {profile.lastName}</h3>
                    <p className="text-slate-300 text-sm mt-1">{profile.headline}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {profile.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      License: {profile.license}
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.specialties.split(", ").map((s) => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
