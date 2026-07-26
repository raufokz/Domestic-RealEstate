"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  budget_min: string;
  budget_max: string;
  location: string;
  bedrooms: string;
  property_type: string;
  timeline: string;
  motivation: string;
  notes: string;
}

const defaultData: LeadFormData = {
  first_name: "", last_name: "", email: "", phone: "",
  budget_min: "", budget_max: "", location: "", bedrooms: "",
  property_type: "house", timeline: "", motivation: "", notes: "",
};

export default function MultiStepLeadForm({ source = "website_form", className = "" }: { source?: string; className?: string }) {
  const { success, notifyError } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<LeadFormData>(defaultData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof LeadFormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canProceed = () => {
    if (step === 1) return data.first_name.trim() && isValidEmail(data.email);
    if (step === 2) return data.location.trim();
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/leads/capture", {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        type: "buyer",
        source,
        budget_min: data.budget_min ? parseInt(data.budget_min) : null,
        budget_max: data.budget_max ? parseInt(data.budget_max) : null,
        location: data.location,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        property_type: data.property_type,
        timeline: data.timeline,
        motivation: data.motivation,
        notes: data.notes,
      });
      setSubmitted(true);
      success("Your request was saved. A specialist will follow up soon.");
    } catch (err) {
      notifyError(err, "Lead form is not working because we could not save your inquiry.");
      setError("Something went wrong. Please try again or email info@domesticrealestate.us.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">We&apos;ve received your information. A specialist will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 ${className}`}>
      {/* Progress */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= s ? 'bg-[#0A2647] text-white' : 'bg-gray-100 text-gray-400'
            }`}>{s}</div>
            {s < 3 && <div className={`flex-1 h-1 mx-2 rounded transition-colors ${step > s ? 'bg-[#0A2647]' : 'bg-gray-100'}`} />}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mb-6 text-xs text-gray-500">
        <span className={step === 1 ? 'text-[#0A2647] font-semibold' : ''}>Personal Info</span>
        <span className={step === 2 ? 'text-[#0A2647] font-semibold' : ''}>Preferences</span>
        <span className={step === 3 ? 'text-[#0A2647] font-semibold' : ''}>Timeline</span>
      </div>

      {/* Steps */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input type="text" autoComplete="given-name" value={data.first_name} onChange={(e) => updateField("first_name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" autoComplete="family-name" value={data.last_name} onChange={(e) => updateField("last_name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" autoComplete="email" value={data.email} onChange={(e) => updateField("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" autoComplete="tel" value={data.phone} onChange={(e) => updateField("phone", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
              <input type="number" value={data.budget_min} onChange={(e) => updateField("budget_min", e.target.value)} placeholder="$0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
              <input type="number" value={data.budget_max} onChange={(e) => updateField("budget_max", e.target.value)} placeholder="$500,000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location *</label>
            <input type="text" value={data.location} onChange={(e) => updateField("location", e.target.value)} placeholder="City, state, or ZIP"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select value={data.bedrooms} onChange={(e) => updateField("bedrooms", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select value={data.property_type} onChange={(e) => updateField("property_type", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
            <select value={data.timeline} onChange={(e) => updateField("timeline", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
              <option value="">Select timeline</option>
              <option value="immediately">Immediately</option>
              <option value="1-3_months">1-3 months</option>
              <option value="3-6_months">3-6 months</option>
              <option value="6-12_months">6-12 months</option>
              <option value="just_exploring">Just exploring</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivation</label>
            <select value={data.motivation} onChange={(e) => updateField("motivation", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent">
              <option value="">Select reason</option>
              <option value="first_time_buyer">First-time buyer</option>
              <option value="upgrading">Upgrading</option>
              <option value="downsizing">Downsizing</option>
              <option value="relocating">Relocating</option>
              <option value="investing">Investing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea value={data.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} placeholder="Tell us more about what you're looking for..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent resize-none" />
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)} disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-[#0A2647] text-white rounded-xl text-sm font-medium hover:bg-[#0c2f57] transition-colors disabled:opacity-50">
            Next Step
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="flex-1 px-6 py-3 bg-[#C9A227] text-white rounded-xl text-sm font-semibold hover:bg-[#b8911f] transition-colors disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}
