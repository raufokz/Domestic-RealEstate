"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import { apiGet, apiPut, apiPost, apiPatch, apiDelete, ApiError, API_BASE } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { SITE_URL } from "@/lib/seo";

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

// Fields AgentController::updateMe actually accepts — anything else (status,
// license_status, rating, etc.) is server-controlled and stripped there too,
// but keeping this list here means we never even try to send it.
const EDITABLE_FIELDS = [
  "middle_name", "preferred_name", "dob", "gender", "ethnicity", "nationality", "timezone",
  "headline", "bio", "years_experience", "secondary_email", "mobile_number", "office_number",
  "whatsapp_number", "fax", "website", "office_address", "office_city", "office_state", "office_zip",
  "office_country", "office_phone", "office_email", "license_number", "license_state", "license_expiry_date",
  "mls_board", "mls_number", "nar_membership", "realtor_membership", "brokerage_name", "broker_name",
  "brokerage_address", "brokerage_website", "brokerage_contact", "certifications", "awards", "designations",
  "specialties", "property_types", "languages", "service_areas", "social_links", "business_name",
  "business_email", "business_phone", "office_hours", "team_name", "team_members", "assistant_info",
  "notification_preferences", "privacy_settings", "intro_video_url",
] as const;

interface AgentDocument {
  id: number;
  document_type: string;
  original_name: string;
  uploaded_at: string;
  status: string;
}

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperType, setCropperType] = useState<"profile_photo" | "cover_photo" | "company_logo">("profile_photo");
  const [fullName, setFullName] = useState("");
  const [languageDraft, setLanguageDraft] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>({});

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // AgentController::me() returns the profile as a bare object, not {data: ...}.
      const res = await apiGet<any>("/admin/agent-profile/me"); // eslint-disable-line @typescript-eslint/no-explicit-any
      setProfile(res || {});
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user?.name) setFullName(user.name);
  }, [user?.name]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (path: string, value: any) => {
    setProfile((prev: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const keys = path.split(".");
      if (keys.length === 1) return { ...prev, [keys[0]]: value };
      if (keys.length === 2) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
      return prev;
    });
  };

  const toggleArrayItem = (field: string, item: string) => {
    setProfile((prev: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const current: string[] = prev[field] || [];
      const updated = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const addLanguage = () => {
    const lang = languageDraft.trim();
    if (!lang) return;
    const current: string[] = profile.languages || [];
    if (!current.includes(lang)) updateField("languages", [...current, lang]);
    setLanguageDraft("");
  };

  const removeLanguage = (lang: string) => {
    updateField("languages", (profile.languages || []).filter((l: string) => l !== lang));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (fullName && fullName !== user?.name) {
        await apiPut("/auth/profile", { name: fullName });
      }
      const payload: Record<string, unknown> = {};
      for (const field of EDITABLE_FIELDS) {
        if (field in profile) payload[field] = profile[field];
      }
      await apiPut("/admin/agent-profile/me", payload);
      setSavedMessage("Profile updated & saved successfully!");
      fetchProfile();
    } catch (e) {
      setSavedMessage(e instanceof ApiError ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    setPublishMessage(null);
    try {
      const nextValue = !profile.is_published;
      const res = await apiPatch<{ message: string }>("/admin/agent-profile/me/publish", { is_published: nextValue });
      setPublishMessage(res.message);
      fetchProfile();
    } catch (e) {
      setPublishMessage(e instanceof ApiError ? e.message : "Could not update your profile's visibility.");
    } finally {
      setPublishing(false);
      setTimeout(() => setPublishMessage(null), 5000);
    }
  };

  const handleShareProfile = async () => {
    if (!profile.slug) return;
    const url = `${SITE_URL}/agents/${profile.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch {
      // Clipboard API unavailable — fall back to a prompt so the link can still be copied manually.
      window.prompt("Copy your public profile link:", url);
    }
  };

  const handleCroppedMediaUpload = async (file: File) => {
    try {
      const token = readAuthToken();
      const body = new FormData();
      body.append("media_type", cropperType);
      body.append("file", file);
      const res = await fetch(`${API_BASE}/admin/agent-profile/me/media`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      if (!res.ok) throw new Error("Upload failed.");
      setSavedMessage("Image uploaded & saved!");
      fetchProfile();
    } catch {
      setSavedMessage("Failed to upload image.");
    } finally {
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      await apiPost("/admin/agent-profile/me/documents", (() => {
        const body = new FormData();
        body.append("document", file);
        body.append("document_type", "license");
        return body;
      })());
      setSavedMessage("Document uploaded.");
      fetchProfile();
    } catch (err) {
      setSavedMessage(err instanceof ApiError ? err.message : "Could not upload document.");
    } finally {
      setUploadingDoc(false);
      e.target.value = "";
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  const handleDocumentDelete = async (id: number) => {
    if (!confirm("Remove this document?")) return;
    try {
      await apiDelete(`/admin/agent-profile/me/documents/${id}`);
      fetchProfile();
    } catch (err) {
      setSavedMessage(err instanceof ApiError ? err.message : "Could not remove document.");
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
          <p className="text-red-700 mb-3">{loadError}</p>
          <button onClick={fetchProfile} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  profile.status === "approved" || profile.status === "verified" ? "bg-emerald-100 text-emerald-800"
                  : profile.status === "rejected" || profile.status === "suspended" ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
                }`}>
                  {profile.status || "pending"}
                </span>
                {profile.is_published && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    Live
                  </span>
                )}
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
          {/* Profile Visibility */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#0A2647]">Profile Visibility</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile.status === "approved" || profile.status === "verified"
                  ? profile.is_published
                    ? "Your profile is live and visible to the public."
                    : "Your profile is approved but not currently live."
                  : "Your profile must be approved by an admin before you can go live."}
              </p>
              {publishMessage && <p className="text-xs font-semibold text-[#0A2647] mt-1">{publishMessage}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareProfile}
                disabled={!profile.slug}
                className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                {shareCopied ? "Link Copied!" : "Share Profile"}
              </button>
              <button
                onClick={handleTogglePublish}
                disabled={publishing || !(profile.status === "approved" || profile.status === "verified")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                  profile.is_published ? "border border-rose-300 text-rose-700 hover:bg-rose-50" : "bg-[#0A2647] text-white hover:bg-[#0d3366]"
                }`}
              >
                {publishing ? "Updating..." : profile.is_published ? "Unpublish" : "Go Live"}
              </button>
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
                    <input type="text" value={profile.middle_name || ""} onChange={(e) => updateField("middle_name", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ethnicity</label>
                    <input type="text" value={profile.ethnicity || ""} onChange={(e) => updateField("ethnicity", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nationality</label>
                    <input type="text" value={profile.nationality || ""} onChange={(e) => updateField("nationality", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                    <input type="number" value={profile.years_experience || 0} onChange={(e) => updateField("years_experience", parseInt(e.target.value) || 0)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
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
                  <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                    <p className="text-xs font-bold text-slate-800 mb-3">Profile Photo (Avatar)</p>
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-slate-200 border-2 border-[#0A2647] flex items-center justify-center mb-3">
                      {profile.profile_photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${API_BASE.replace(/\/api$/, "")}/storage/${profile.profile_photo}`} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-slate-500">{(fullName || "?").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <button onClick={() => { setCropperType("profile_photo"); setCropperOpen(true); }} className="bg-[#0A2647] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#0d3366] transition">
                      Upload & Crop Photo
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                    <p className="text-xs font-bold text-slate-800 mb-3">Cover Banner Photo</p>
                    <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center mb-3">
                      {profile.cover_photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${API_BASE.replace(/\/api$/, "")}/storage/${profile.cover_photo}`} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Banner Uploaded</span>
                      )}
                    </div>
                    <button onClick={() => { setCropperType("cover_photo"); setCropperOpen(true); }} className="bg-[#0A2647] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#0d3366] transition">
                      Upload & Crop Banner
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                    <p className="text-xs font-bold text-slate-800 mb-3">Company / Team Logo</p>
                    <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-white border border-slate-300 flex items-center justify-center mb-3 p-2">
                      {profile.company_logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${API_BASE.replace(/\/api$/, "")}/storage/${profile.company_logo}`} alt="Logo" className="max-h-full max-w-full object-contain" />
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Email (Office)</label>
                    <input type="email" value={profile.office_email || ""} onChange={(e) => updateField("office_email", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary Email</label>
                    <input type="email" value={profile.secondary_email || ""} onChange={(e) => updateField("secondary_email", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">License Number</label>
                    <input type="text" value={profile.license_number || ""} onChange={(e) => updateField("license_number", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Licensing State</label>
                    <input type="text" value={profile.license_state || ""} onChange={(e) => updateField("license_state", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">License Expiry Date</label>
                    <input type="date" value={profile.license_expiry_date || ""} onChange={(e) => updateField("license_expiry_date", e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brokerage Name</label>
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
                  <p className="text-xs font-bold text-[#0A2647] mb-2">Professional Certifications &amp; Designations</p>
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

                <div>
                  <p className="text-xs font-bold text-[#0A2647] mb-2">Languages Spoken</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(profile.languages || []).map((lang: string) => (
                      <span key={lang} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0A2647]/5 text-[#0A2647] rounded-full text-xs font-semibold">
                        {lang}
                        <button type="button" onClick={() => removeLanguage(lang)} className="text-[#0A2647]/50 hover:text-red-600">✕</button>
                      </span>
                    ))}
                    {(!profile.languages || profile.languages.length === 0) && <span className="text-xs text-slate-400">None added</span>}
                  </div>
                  <div className="flex gap-2 max-w-xs">
                    <input
                      type="text"
                      value={languageDraft}
                      onChange={(e) => setLanguageDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguage(); } }}
                      placeholder="e.g. Spanish"
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <button type="button" onClick={addLanguage} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-[#0A2647]">
                      Add
                    </button>
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
                  <label className="bg-[#0A2647] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#0d3366] transition cursor-pointer">
                    {uploadingDoc ? "Uploading..." : "+ Upload New Document"}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" disabled={uploadingDoc} onChange={handleDocumentUpload} />
                  </label>
                </div>

                <div className="divide-y divide-slate-100">
                  {(profile.documents || []).map((doc: AgentDocument) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{doc.original_name}</p>
                        <p className="text-[11px] text-slate-500 capitalize">Type: {doc.document_type} | Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {doc.status}
                        </span>
                        <button onClick={() => handleDocumentDelete(doc.id)} className="text-xs font-bold text-red-500 hover:text-red-700">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!profile.documents || profile.documents.length === 0) && (
                    <p className="text-xs text-slate-400 py-4 text-center">No documents uploaded yet.</p>
                  )}
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
                    {Object.keys(profile.privacy_settings || {}).length === 0 && <p className="text-xs text-slate-400">No settings yet — saving will initialize defaults.</p>}
                    {Object.keys(profile.privacy_settings || {}).map((setting) => (
                      <label key={setting} className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                        <span className="capitalize">{setting.replace("show_", "Display ").replace("_", " ")}</span>
                        <input type="checkbox" checked={profile.privacy_settings[setting]} onChange={(e) => updateField(`privacy_settings.${setting}`, e.target.checked)} className="rounded text-[#0A2647]" />
                      </label>
                    ))}
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-[#0A2647] mb-2">Notification Preferences</p>
                    {Object.keys(profile.notification_preferences || {}).length === 0 && <p className="text-xs text-slate-400">No preferences yet — saving will initialize defaults.</p>}
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
