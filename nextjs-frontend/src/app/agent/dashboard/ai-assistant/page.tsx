"use client";

import { useState } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiPost } from "@/lib/api";

const AI_TOOLS = [
  {
    id: "property-description",
    title: "Property Description Writer",
    description: "Generate compelling property descriptions that attract buyers",
    icon: "📝",
    color: "bg-blue-500",
    inputs: [
      { label: "Property Type", field: "property_type", type: "select", options: ["House", "Apartment", "Condo", "Villa", "Townhouse"] },
      { label: "Bedrooms", field: "bedrooms", type: "number" },
      { label: "Key Features", field: "features", type: "textarea", placeholder: "e.g. Ocean view, pool, updated kitchen..." },
      { label: "Target Buyer", field: "target", type: "text", placeholder: "e.g. Young professionals, families..." },
    ],
    endpoint: "/ai/property-description",
  },
  {
    id: "email-writer",
    title: "Email Template Writer",
    description: "Create personalized follow-up and outreach emails",
    icon: "✉️",
    color: "bg-emerald-500",
    inputs: [
      { label: "Email Type", field: "type", type: "select", options: ["Follow-up", "New Listing", "Price Reduction", "Open House Invite", "Just Listed", "Just Sold"] },
      { label: "Recipient Name", field: "recipient", type: "text", placeholder: "Client name" },
      { label: "Property Address", field: "property", type: "text", placeholder: "123 Main St" },
      { label: "Key Message", field: "message", type: "textarea", placeholder: "What do you want to highlight?" },
    ],
    endpoint: "/ai/email-writer",
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    description: "Get AI-powered insights on local market conditions",
    icon: "📊",
    color: "bg-purple-500",
    inputs: [
      { label: "City", field: "city", type: "text", placeholder: "e.g. Miami" },
      { label: "State", field: "state", type: "text", placeholder: "e.g. FL" },
      { label: "Property Type", field: "property_type", type: "select", options: ["All", "House", "Condo", "Townhouse"] },
      { label: "Price Range", field: "price_range", type: "text", placeholder: "e.g. $500K-$1M" },
    ],
    endpoint: "/ai/analytics-agent",
  },
  {
    id: "social-content",
    title: "Social Media Content",
    description: "Generate engaging social media posts for your listings",
    icon: "📱",
    color: "bg-rose-500",
    inputs: [
      { label: "Platform", field: "platform", type: "select", options: ["Instagram", "Facebook", "LinkedIn", "Twitter/X"] },
      { label: "Content Type", field: "content_type", type: "select", options: ["New Listing", "Just Sold", "Market Update", "Tips & Advice", "Open House"] },
      { label: "Property Details", field: "details", type: "textarea", placeholder: "Describe the property or topic..." },
      { label: "Tone", field: "tone", type: "select", options: ["Professional", "Friendly", "Luxury", "Casual"] },
    ],
    endpoint: "/ai/social-agent",
  },
];

export default function AgentAIAssistantPage() {
  const [selectedTool, setSelectedTool] = useState(AI_TOOLS[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await apiPost<{ content?: string; response?: string }>(selectedTool.endpoint, {
        ...formData,
        prompt: `Generate a ${selectedTool.title.toLowerCase()} using: ${JSON.stringify(formData)}`,
      });
      setResult(res.content || res.response || "Generated content will appear here.");
    } catch {
      setResult("AI service is currently unavailable. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <AgentLayout title="AI Assistant" subtitle="AI-powered tools to boost your productivity">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {AI_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => { setSelectedTool(tool); setFormData({}); setResult(""); }}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selectedTool.id === tool.id
                  ? "border-[#C9A227] bg-[#C9A227]/5 shadow-sm"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center text-white text-lg`}>{tool.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#0A2647] text-sm">{tool.title}</h4>
                  <p className="text-xs text-slate-500 truncate">{tool.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 ${selectedTool.color} rounded-lg flex items-center justify-center text-white text-lg`}>{selectedTool.icon}</div>
              <div>
                <h3 className="font-bold text-[#0A2647]">{selectedTool.title}</h3>
                <p className="text-sm text-slate-500">{selectedTool.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {selectedTool.inputs.map((input) => (
                <div key={input.field} className={input.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{input.label}</label>
                  {input.type === "select" ? (
                    <select
                      value={formData[input.field] || ""}
                      onChange={(e) => updateField(input.field, e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm"
                    >
                      <option value="">Select...</option>
                      {input.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : input.type === "textarea" ? (
                    <textarea
                      value={formData[input.field] || ""}
                      onChange={(e) => updateField(input.field, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm resize-none"
                      placeholder={input.placeholder}
                    />
                  ) : (
                    <input
                      type={input.type}
                      value={formData[input.field] || ""}
                      onChange={(e) => updateField(input.field, e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] outline-none text-sm"
                      placeholder={input.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-2.5 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0d3366] transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Generating...
                </>
              ) : "Generate"}
            </button>
          </div>

          {result && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0A2647]">Generated Content</h3>
                <button onClick={() => navigator.clipboard.writeText(result)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition">
                  Copy to Clipboard
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{result}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
