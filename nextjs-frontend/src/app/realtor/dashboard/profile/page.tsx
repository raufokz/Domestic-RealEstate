"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ImageCropperModal from "@/components/ui/ImageCropperModal";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/realtor/dashboard", active: false, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Leads", href: "/realtor/dashboard/leads", active: false, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Properties", href: "/realtor/dashboard/properties", active: false, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
  { label: "Profile", href: "/realtor/dashboard/profile", active: true, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const PROPERTY_TYPES_LIST = [
  "Residential", "Commercial", "Luxury", "Rental", "Investment", "Land", "Farms", "Industrial", "New Construction"
];

const SPECIALTIES_LIST = [
  "Buyers", "Sellers", "Investors", "Relocation", "First-Time Buyers", "Luxury Homes", "Short Sales", "Foreclosures", "Property Management", "Vacation Homes"
];

const CERTIFICATIONS_LIST = [
  "CRS (Certified Residential Specialist)", "ABR (Accredited Buyer's Representative)", "GRI (Graduate, REALTOR® Institute)", "SRES (Seniors Real Estate Specialist)", "CCIM (Certified Commercial Investment Member)", "SIOR (Society of Industrial and Office Realtors)", "e-PRO® Certified"
];

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperType, setCropperType] = useState<"profile_photo" | "cover_photo" | "company_logo" | "office_photos">("profile_photo");

  const [profile, setProfile] = useState<any>({
    first_name: "Sarah",
    middle_name: "M.",
    last_name: "Johnson",
    preferred_name: "Sarah",
    dob: "1988-04-12",
    gender: "Female",
    ethnicity: "Caucasian",
    nationality: "American",
    languages: ["English", "Spanish"],
    timezone: "America/New_York",
    headline: "Luxury Real Estate Specialist | Top 1% Producer",
    bio: "Over 12 years of experience in luxury residential real estate and investment properties.",
    years_experience: 12,
    office_email: "sarah.johnson@domesticrealestate.us",
    secondary_email: "sarah.personal@example.com",
    mobile_number: "(555) 987-6543",
    office_number: "(555) 987-6000",
    whatsapp_number: "+1 555 987 6543",
    fax: "(555) 987-6001",
    website: "https://sarahjohnson.domesticrealestate.us",
    office_address: "1200 Brickell Ave, Suite 800",
    office_city: "Miami",
    office_state: "FL",
    office_zip: "33131",
    office_country: "US",
    license_number: "RE-2847561",
    license_state: "FL",
    license_expiry_date: "2027-12-31",
    license_status: "active",
    brokerage_name: "Domestic Real Estate Group",
    brokerage_address: "1000 Brickell Ave, Miami, FL",
    brokerage_website: "https://domesticrealestate.us",
    brokerage_contact: "(555) 100-2000",
    mls_board: "MIAMI Association of REALTORS®",
    mls_number: "MLS-998822",
    nar_membership: true,
    realtor_membership: true,
    certifications: ["CRS", "ABR", "e-PRO"],
    awards: ["Top Producer 2024", "President Circle 2025"],
    designations: ["Luxury Specialist", "Buyer Agent"],
    property_types: ["Residential", "Luxury", "Investment"],
    specialties: ["Buyers", "Sellers", "Luxury Homes"],
    service_areas: [
      { state: "FL", county: "Miami-Dade", city: "Miami", zip: "33131" },
      { state: "FL", county: "Miami-Dade", city: "Miami Beach", zip: "33139" },
    ],
    social_links: {
      facebook: "https://facebook.com/sarahjohnsonre",
      instagram: "https://instagram.com/sarahjohnsonre",
      linkedin: "https://linkedin.com/in/sarahjohnsonre",
      twitter: "https://x.com/sarahjohnsonre",
      youtube: "https://youtube.com/@sarahjohnsonre",
      tiktok: "https://tiktok.com/@sarahjohnsonre",
      pinterest: "https://pinterest.com/sarahjohnsonre",
      threads: "https://threads.net/@sarahjohnsonre",
    },
    business_name: "Sarah Johnson Real Estate Team",
    business_email: "team@sarahjohnsonre.com",
    business_phone: "(555) 987-6543",
    office_hours: { monday: "9AM - 6PM", tuesday: "9AM - 6PM", wednesday: "9AM - 6PM", thursday: "9AM - 6PM", friday: "9AM - 5PM", saturday: "10AM - 4PM", sunday: "By Appointment" },
    team_name: "The Johnson Luxury Group",
    team_members: ["Michael Chen", "Lisa Anderson"],
    assistant_info: { name: "Emily Davis", email: "emily@sarahjohnsonre.com", phone: "(555) 987-6544" },
    documents: [
      { id: 1, document_type: "license", original_name: "FL_Real_Estate_License_2026.pdf", uploaded_at: "2026-01-15", status: "approved" },
      { id: 2, document_type: "insurance", original_name: "EO_Insurance_Policy.pdf", uploaded_at: "2026-02-01", status: "approved" },
    ],
    privacy_settings: {
      show_phone: true,
      show_email: true,
      show_address: true,
      show_whatsapp: true,
      show_social_links: true,
      show_license_number: true,
    },
    notification_preferences: {
      email: true,
      sms: true,
      marketplace: true,
      leads: true,
      appointments: true,
      marketing: false,
    },
    dashboard_stats: {
      active_listings: 14,
      pending_listings: 5,
      sold_listings: 28,
      total_leads: 142,
      assigned_leads: 88,
      purchased_leads: 34,
      pay_at_closing_leads: 20,
      profile_views: 1240,
    },
    status: "verified",
    profile_photo: null,
    cover_photo: null,
    company_logo: null,
  });

  const updateField = (path: string, value: any) => {
    setProfile((prev: any) => {
      const keys = path.split(".");
      if (keys.length === 1) return { ...prev, [keys[0]]: value };
      if (keys.length === 2) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
      return prev;
    });
  };

  const toggleArrayItem = (field: string, item: string) => {
    setProfile((prev: any) => {
      const current = prev[field] || [];
      const updated = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSavedMessage("Profile updated & saved successfully!");
      setTimeout(() => setSavedMessage(null), 4000);
    } catch (e) {
      setSavedMessage("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCroppedMediaUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    if (cropperType === "profile_photo") updateField("profile_photo", objectUrl);
    if (cropperType === "cover_photo") updateField("cover_photo", objectUrl);
    if (cropperType === "company_logo") updateField("company_logo", objectUrl);
    setSavedMessage("Image cropped & ready to save!");
    setTimeout(() => setSavedMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2647] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Logo size="md" />
          <span className="text-white font-bold text-lg">Domestic RE</span>
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

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#0A2647]">Realtor Profile Management</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${profile.status === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {profile.status}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">Manage your professional branding, MLS details, media, and security preferences</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedMessage && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">{savedMessage}</span>}
            <button onClick={handleSave} disabled={saving} className="bg-[#C9A227] hover:bg-[#b8911f] text-[#0A2647] px-6 py-2 rounded-lg text-sm font-bold shadow transition disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Dashboard Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs text-slate-500 font-medium">Active Listings</p>
              <p className="text-xl font-extrabold text-[#0A2647] mt-1">{profile.dashboard_stats?.active_listings ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs text-slate-500 font-medium">Properties Sold</p>
              <p className="text-xl font-extrabold text-[#0A2647] mt-1">{profile.dashboard_stats?.sold_listings ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs text-slate-500 font-medium">Total Leads</p>
              <p className="text-xl font-extrabold text-[#0A2647] mt-1">{profile.dashboard_stats?.total_leads ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs text-slate-500 font-medium">PPL Leads</p>
              <p className="text-xl font-extrabold text-[#0A2647] mt-1">{profile.dashboard_stats?.purchased_leads ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs text-slate-500 font-medium">Pay-at-Closing</p>
              <p className="text-xl font-extrabold text-[#0A2647] mt-1">{profile.dashboard_stats?.pay_at_closing_leads ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs text-slate-500 font-medium">Profile Views</p>
              <p className="text-xl font-extrabold text-[#0A2647] mt-1">{profile.dashboard_stats?.profile_views ?? 0}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1 overflow-x-auto shadow-sm">
            {[
              { id: "personal", label: "Personal & Bio" },
              { id: "media", label: "Profile Media" },
              { id: "contact", label: "Contact Info" },
              { id: "professional", label: "Professional & MLS" },
              { id: "expertise", label: "Expertise & Areas" },
              { id: "business", label: "Business & Team" },
              { id: "social", label: "Social Media" },
              { id: "documents", label: "Document Vault" },
              { id: "privacy", label: "Privacy & Notifications" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${activeTab === tab.id ? "bg-[#0A2647] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {/* 1. PERSONAL INFORMATION */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0A2647] border-b pb-3">Personal Details & Professional Bio</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <input type="text" value={profile.first_name || ""} onChange={(e) => updateField("first_name", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
                    <input type="text" value={profile.middle_name || ""} onChange={(e) => updateField("middle_name", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input type="text" value={profile.last_name || ""} onChange={(e) => updateField("last_name", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Name</label>
                    <input type="text" value={profile.preferred_name || ""} onChange={(e) => updateField("preferred_name", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" value={profile.dob || ""} onChange={(e) => updateField("dob", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select value={profile.gender || ""} onChange={(e) => updateField("gender", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                    <input type="number" value={profile.years_experience || 0} onChange={(e) => updateField("years_experience", parseInt(e.target.value))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time Zone</label>
                    <input type="text" value={profile.timezone || "America/New_York"} onChange={(e) => updateField("timezone", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
                  <input type="text" value={profile.headline || ""} onChange={(e) => updateField("headline", e.target.value)} placeholder="e.g. Luxury Real Estate Specialist | Top 1% Producer in Miami" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Biography / About Me</label>
                  <textarea rows={5} value={profile.bio || ""} onChange={(e) => updateField("bio", e.target.value)} placeholder="Write a compelling biography for clients and prospective buyers..." className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                </div>
              </div>
            )}

            {/* 2. PROFILE MEDIA */}
            {activeTab === "media" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0A2647] border-b pb-3">Branding & Media Assets</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Photo */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                    <p className="text-xs font-bold text-slate-800 mb-3">Profile Photo (Avatar)</p>
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-slate-200 border-2 border-[#0A2647] flex items-center justify-center mb-3">
                      {profile.profile_photo ? (
                        <img src={profile.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-slate-500">{profile.first_name?.[0]}{profile.last_name?.[0]}</span>
                      )}
                    </div>
                    <button onClick={() => { setCropperType("profile_photo"); setCropperOpen(true); }} className="bg-[#0A2647] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#0d3366] transition">
                      Upload & Crop Photo
                    </button>
                  </div>

                  {/* Cover Photo */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                    <p className="text-xs font-bold text-slate-800 mb-3">Cover Banner Photo</p>
                    <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center mb-3">
                      {profile.cover_photo ? (
                        <img src={profile.cover_photo} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Banner Uploaded</span>
                      )}
                    </div>
                    <button onClick={() => { setCropperType("cover_photo"); setCropperOpen(true); }} className="bg-[#0A2647] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#0d3366] transition">
                      Upload & Crop Banner
                    </button>
                  </div>

                  {/* Company Logo */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                    <p className="text-xs font-bold text-slate-800 mb-3">Company / Team Logo</p>
                    <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-white border border-slate-300 flex items-center justify-center mb-3 p-2">
                      {profile.company_logo ? (
                        <img src={profile.company_logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Logo</span>
                      )}
                    </div>
                    <button onClick={() => { setCropperType("company_logo"); setCropperOpen(true); }} className="bg-[#0A2647] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#0d3366] transition">
                      Upload Logo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Video Introduction Link (YouTube / Vimeo / MP4)</label>
                  <input type="url" value={profile.intro_video_url || ""} onChange={(e) => updateField("intro_video_url", e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                </div>
              </div>
            )}

            {/* 3. CONTACT INFORMATION */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0A2647] border-b pb-3">Contact & Office Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Email (Office) *</label>
                    <input type="email" value={profile.office_email || ""} onChange={(e) => updateField("office_email", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary Email</label>
                    <input type="email" value={profile.secondary_email || ""} onChange={(e) => updateField("secondary_email", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                    <input type="text" value={profile.mobile_number || ""} onChange={(e) => updateField("mobile_number", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Office Telephone</label>
                    <input type="text" value={profile.office_number || ""} onChange={(e) => updateField("office_number", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                    <input type="text" value={profile.whatsapp_number || ""} onChange={(e) => updateField("whatsapp_number", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fax Number</label>
                    <input type="text" value={profile.fax || ""} onChange={(e) => updateField("fax", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Website URL</label>
                    <input type="url" value={profile.website || ""} onChange={(e) => updateField("website", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Office Street Address</label>
                    <input type="text" value={profile.office_address || ""} onChange={(e) => updateField("office_address", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City, State, ZIP</label>
                    <div className="flex gap-1">
                      <input type="text" placeholder="City" value={profile.office_city || ""} onChange={(e) => updateField("office_city", e.target.value)} className="w-1/3 px-2 py-2 text-xs border border-slate-300 rounded-lg" />
                      <input type="text" placeholder="State" value={profile.office_state || ""} onChange={(e) => updateField("office_state", e.target.value)} className="w-1/3 px-2 py-2 text-xs border border-slate-300 rounded-lg" />
                      <input type="text" placeholder="ZIP" value={profile.office_zip || ""} onChange={(e) => updateField("office_zip", e.target.value)} className="w-1/3 px-2 py-2 text-xs border border-slate-300 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PROFESSIONAL INFORMATION */}
            {activeTab === "professional" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0A2647] border-b pb-3">Real Estate License & Brokerage Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">License Number *</label>
                    <input type="text" value={profile.license_number || ""} onChange={(e) => updateField("license_number", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Licensing State *</label>
                    <input type="text" value={profile.license_state || ""} onChange={(e) => updateField("license_state", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">License Expiry Date</label>
                    <input type="date" value={profile.license_expiry_date || ""} onChange={(e) => updateField("license_expiry_date", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brokerage Name *</label>
                    <input type="text" value={profile.brokerage_name || ""} onChange={(e) => updateField("brokerage_name", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brokerage Address</label>
                    <input type="text" value={profile.brokerage_address || ""} onChange={(e) => updateField("brokerage_address", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">MLS Board Name</label>
                    <input type="text" value={profile.mls_board || ""} onChange={(e) => updateField("mls_board", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">MLS Member ID #</label>
                    <input type="text" value={profile.mls_number || ""} onChange={(e) => updateField("mls_number", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                </div>

                <div className="flex gap-6 border-t border-b py-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input type="checkbox" checked={profile.nar_membership || false} onChange={(e) => updateField("nar_membership", e.target.checked)} className="rounded text-[#0A2647] focus:ring-[#0A2647]" />
                    National Association of REALTORS® (NAR) Member
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input type="checkbox" checked={profile.realtor_membership || false} onChange={(e) => updateField("realtor_membership", e.target.checked)} className="rounded text-[#0A2647] focus:ring-[#0A2647]" />
                    Official REALTOR® Membership Status
                  </label>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#0A2647] mb-2">Professional Certifications & Designations</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CERTIFICATIONS_LIST.map((cert) => {
                      const code = cert.split(" ")[0];
                      const isSelected = (profile.certifications || []).includes(code);
                      return (
                        <button key={cert} onClick={() => toggleArrayItem("certifications", code)} type="button" className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition ${isSelected ? "border-[#0A2647] bg-[#0A2647]/5 text-[#0A2647]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                          {cert}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 5. EXPERTISE & SERVICE AREAS */}
            {activeTab === "expertise" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0A2647] border-b pb-3">Real Estate Expertise & Service Areas</h3>

                <div>
                  <p className="text-xs font-bold text-[#0A2647] mb-2">Property Types Handled</p>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES_LIST.map((pt) => {
                      const isSelected = (profile.property_types || []).includes(pt);
                      return (
                        <button key={pt} onClick={() => toggleArrayItem("property_types", pt)} type="button" className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${isSelected ? "bg-[#0A2647] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                          {pt} {isSelected ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#0A2647] mb-2">Real Estate Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES_LIST.map((spec) => {
                      const isSelected = (profile.specialties || []).includes(spec);
                      return (
                        <button key={spec} onClick={() => toggleArrayItem("specialties", spec)} type="button" className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${isSelected ? "bg-[#C9A227] text-[#0A2647]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                          {spec} {isSelected ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 6. BUSINESS & TEAM */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0A2647] border-b pb-3">Business Entity & Team Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Entity Name</label>
                    <input type="text" value={profile.business_name || ""} onChange={(e) => updateField("business_name", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email</label>
                    <input type="email" value={profile.business_email || ""} onChange={(e) => updateField("business_email", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Team Name</label>
                    <input type="text" value={profile.team_name || ""} onChange={(e) => updateField("team_name", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {/* 7. SOCIAL MEDIA */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0A2647] border-b pb-3">Social Media Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["facebook", "instagram", "linkedin", "twitter", "youtube", "tiktok", "pinterest", "threads"].map((soc) => (
                    <div key={soc}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 capitalize">{soc}</label>
                      <input type="url" value={profile.social_links?.[soc] || ""} onChange={(e) => updateField(`social_links.${soc}`, e.target.value)} placeholder={`https://${soc}.com/...`} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. DOCUMENT VAULT */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0A2647]">Private Verification Document Vault</h3>
                    <p className="text-xs text-slate-500">Only Admin and you can access or download these verification documents</p>
                  </div>
                  <button className="bg-[#0A2647] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#0d3366] transition">
                    + Upload New Document
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {profile.documents?.map((doc: any) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{doc.original_name}</p>
                        <p className="text-[11px] text-slate-500 capitalize">Type: {doc.document_type} | Uploaded: {doc.uploaded_at}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. PRIVACY & NOTIFICATIONS */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0A2647] border-b pb-3">Public Profile Privacy & Notification Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-[#0A2647] mb-2">Public Profile Visibility Toggles</p>
                    {Object.keys(profile.privacy_settings || {}).map((setting) => (
                      <label key={setting} className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                        <span className="capitalize">{setting.replace("show_", "Display ").replace("_", " ")}</span>
                        <input type="checkbox" checked={profile.privacy_settings[setting]} onChange={(e) => updateField(`privacy_settings.${setting}`, e.target.checked)} className="rounded text-[#0A2647]" />
                      </label>
                    ))}
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-[#0A2647] mb-2">Notification Preferences</p>
                    {Object.keys(profile.notification_preferences || {}).map((pref) => (
                      <label key={pref} className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                        <span className="capitalize">{pref} Alerts</span>
                        <input type="checkbox" checked={profile.notification_preferences[pref]} onChange={(e) => updateField(`notification_preferences.${pref}`, e.target.checked)} className="rounded text-[#0A2647]" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ImageCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        title={`Crop ${cropperType.replace("_", " ").toUpperCase()}`}
        aspectRatioName={cropperType === "cover_photo" ? "cover" : "avatar"}
        onCropComplete={handleCroppedMediaUpload}
      />
    </div>
  );
}
