"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";

const TEMPLATES = [
  { id: 1, name: "Agent Portfolio", description: "Professional agent profile with listings and contact", preview: "bg-gradient-to-br from-blue-500 to-blue-700", active: true },
  { id: 2, name: "Property Showcase", description: "Focused on property listings with gallery", preview: "bg-gradient-to-br from-emerald-500 to-emerald-700", active: false },
  { id: 3, name: "Luxury Agent", description: "High-end design for luxury market agents", preview: "bg-gradient-to-br from-amber-500 to-amber-700", active: false },
  { id: 4, name: "Team Brokerage", description: "Multi-agent brokerage team page", preview: "bg-gradient-to-br from-purple-500 to-purple-700", active: false },
];

export default function AgentWebsitePage() {
  const [siteConfig, setSiteConfig] = useState({
    title: "My Real Estate Website",
    description: "Your trusted real estate professional",
    primaryColor: "#0A2647",
    accentColor: "#C9A227",
    domain: "",
    subdomain: "",
  });

  const [deployStatus, setDeployStatus] = useState<"idle" | "deploying" | "live">("idle");

  const handleDeploy = () => {
    setDeployStatus("deploying");
    setTimeout(() => setDeployStatus("live"), 3000);
  };

  return (
    <AgentLayout title="My Website" subtitle="Build and deploy your personal real estate website">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-[#0A2647] mb-4">Choose Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                className={`border-2 rounded-xl overflow-hidden cursor-pointer transition ${t.active ? "border-[#C9A227] shadow-md" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className={`h-32 ${t.preview} flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold opacity-50">{t.name[0]}</span>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-[#0A2647] text-sm">{t.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                  {t.active && <span className="inline-block mt-2 text-xs bg-[#C9A227]/10 text-[#C9A227] px-2 py-0.5 rounded-full font-medium">Selected</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-[#0A2647] mb-4">Website Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Website Title</label>
              <input type="text" value={siteConfig.title} onChange={(e) => setSiteConfig((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <input type="text" value={siteConfig.description} onChange={(e) => setSiteConfig((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Color</label>
              <div className="flex gap-2">
                <input type="color" value={siteConfig.primaryColor} onChange={(e) => setSiteConfig((p) => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer" />
                <input type="text" value={siteConfig.primaryColor} onChange={(e) => setSiteConfig((p) => ({ ...p, primaryColor: e.target.value }))} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Accent Color</label>
              <div className="flex gap-2">
                <input type="color" value={siteConfig.accentColor} onChange={(e) => setSiteConfig((p) => ({ ...p, accentColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer" />
                <input type="text" value={siteConfig.accentColor} onChange={(e) => setSiteConfig((p) => ({ ...p, accentColor: e.target.value }))} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-[#0A2647] mb-4">Domain Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subdomain</label>
              <div className="flex items-center gap-2">
                <input type="text" value={siteConfig.subdomain} onChange={(e) => setSiteConfig((p) => ({ ...p, subdomain: e.target.value }))} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" placeholder="yourname" />
                <span className="text-sm text-slate-500">.domesticrealestate.us</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom Domain (Optional)</label>
              <input type="text" value={siteConfig.domain} onChange={(e) => setSiteConfig((p) => ({ ...p, domain: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm" placeholder="yourdomain.com" />
              <p className="text-xs text-slate-400 mt-1">Point your domain CNAME to sites.domesticrealestate.us</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-[#0A2647] mb-4">Deploy</h3>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              deployStatus === "live" ? "bg-green-100 text-green-700" :
              deployStatus === "deploying" ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-600"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                deployStatus === "live" ? "bg-green-500" :
                deployStatus === "deploying" ? "bg-amber-500 animate-pulse" :
                "bg-slate-400"
              }`} />
              {deployStatus === "live" ? "Live" : deployStatus === "deploying" ? "Deploying..." : "Not Deployed"}
            </div>
            <button
              onClick={handleDeploy}
              disabled={deployStatus === "deploying"}
              className="px-6 py-2.5 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0d3366] transition disabled:opacity-50"
            >
              {deployStatus === "deploying" ? "Deploying..." : deployStatus === "live" ? "Redeploy" : "Deploy Now"}
            </button>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
