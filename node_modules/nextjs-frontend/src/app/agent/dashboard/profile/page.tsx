"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";

export default function AgentProfilePage() {
  const { success, notifyError } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    headline: "",
    bio: "",
    license: "",
    brokerage: "",
    phone: user?.phone || "",
    email: user?.email || "",
    specialties: "",
    languages: "English",
    serviceAreas: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });

  const update = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPost("/auth/profile", {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,
        headline: profile.headline,
        bio: profile.bio,
        license: profile.license,
        brokerage: profile.brokerage,
        specialties: profile.specialties,
        languages: profile.languages,
        service_areas: profile.serviceAreas,
        website: profile.website,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        instagram: profile.instagram,
      });
      setSaved(true);
      success("Profile saved.");
    } catch (e) {
      // Never show the saved state when the server rejected the update.
      setSaved(false);
      notifyError(e, "Could not save your profile. Your changes are still here — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none text-sm text-slate-800";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  const initials = `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase() || "AG";

  return (
    <AgentLayout title="Edit Profile" subtitle="Manage your public profile and contact information">
      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-5">Avatar</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0A2647] to-[#0d3366] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            <div>
              <button className="bg-[#0A2647] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0d3366] transition">Upload Photo</button>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-5">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" value={profile.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" value={profile.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Professional Headline</label>
              <input type="text" value={profile.headline} onChange={(e) => update("headline", e.target.value)} className={inputClass} placeholder="e.g. Luxury Real Estate Specialist" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea value={profile.bio} onChange={(e) => update("bio", e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Tell clients about yourself..." />
            </div>
            <div>
              <label className={labelClass}>License Number</label>
              <input type="text" value={profile.license} onChange={(e) => update("license", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Brokerage</label>
              <input type="text" value={profile.brokerage} onChange={(e) => update("brokerage", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={profile.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} className={inputClass} disabled />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-5">Expertise</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Specialties</label>
              <input type="text" value={profile.specialties} onChange={(e) => update("specialties", e.target.value)} className={inputClass} placeholder="Luxury Homes, Waterfront, Investment" />
            </div>
            <div>
              <label className={labelClass}>Languages</label>
              <input type="text" value={profile.languages} onChange={(e) => update("languages", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Service Areas</label>
              <input type="text" value={profile.serviceAreas} onChange={(e) => update("serviceAreas", e.target.value)} className={inputClass} placeholder="Miami Beach, Coral Gables, Brickell" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-5">Social Links</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" value={profile.website} onChange={(e) => update("website", e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>LinkedIn</label>
                <input type="text" value={profile.linkedin} onChange={(e) => update("linkedin", e.target.value)} className={inputClass} placeholder="linkedin.com/in/..." />
              </div>
              <div>
                <label className={labelClass}>Twitter</label>
                <input type="text" value={profile.twitter} onChange={(e) => update("twitter", e.target.value)} className={inputClass} placeholder="@username" />
              </div>
              <div>
                <label className={labelClass}>Instagram</label>
                <input type="text" value={profile.instagram} onChange={(e) => update("instagram", e.target.value)} className={inputClass} placeholder="@username" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50">
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </div>
    </AgentLayout>
  );
}
