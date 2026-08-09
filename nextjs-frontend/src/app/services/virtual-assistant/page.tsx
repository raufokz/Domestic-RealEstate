"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { apiPost } from "@/lib/api";
import { AGENT_PLAN_TIERS } from "@/lib/agentPlans";

const SERVICE_SLUG = "virtual-assistant";
const SERVICE_NAME = "Virtual Assistant Services";

const benefits = [
  {
    title: "Administrative Support",
    description:
      "Professional handling of emails, calendars, travel bookings, and day-to-day administrative tasks so you can focus on growth.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    title: "Lead Management",
    description:
      "Systematic follow-up, CRM management, and lead nurturing to ensure no opportunity falls through the cracks.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    title: "Scheduling",
    description:
      "Efficient calendar management, meeting coordination, and appointment scheduling across time zones.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Data Entry & Research",
    description:
      "Accurate data management, market research, and competitive analysis to support informed business decisions.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Assessment",
    description:
      "We evaluate your business needs, workflows, and priorities to identify the ideal support structure.",
  },
  {
    step: 2,
    title: "Matching",
    description:
      "Our vetting process pairs you with a skilled virtual assistant who fits your industry and work style.",
  },
  {
    step: 3,
    title: "Training",
    description:
      "Your VA is trained on your specific tools, processes, and brand voice for seamless integration.",
  },
  {
    step: 4,
    title: "Support",
    description:
      "Ongoing oversight, performance monitoring, and replacement guarantees ensure consistent quality.",
  },
];

const faqs = [
  {
    question: "What tasks can a virtual assistant handle?",
    answer:
      "Our VAs handle email management, calendar scheduling, social media, data entry, research, customer support, bookkeeping, and much more. They adapt to your specific business needs.",
  },
  {
    question: "How many hours can I get per week?",
    answer:
      "We offer flexible packages from 10 to 40+ hours per week. You can scale up or down based on your needs with 30 days notice.",
  },
  {
    question: "What time zones do your VAs work in?",
    answer:
      "Our virtual assistants are available across multiple time zones, including US, UK, and APAC hours. We match you with a VA whose schedule aligns with yours.",
  },
  {
    question: "How do you ensure quality and reliability?",
    answer:
      "Every VA undergoes rigorous screening, skills testing, and ongoing performance reviews. We provide a dedicated account manager and free replacement if needed.",
  },
];

export default function VirtualAssistantPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    service_type: SERVICE_SLUG,
    project_description: "",
    timeline: "",
    budget_range: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.project_description.trim())
      newErrors.project_description = "Please describe your project";
    if (!form.timeline) newErrors.timeline = "Please select a timeline";
    if (!form.budget_range) newErrors.budget_range = "Please select a budget range";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiPost("/service-requests", form);
      setSubmitted(true);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A2647] via-[#0d3a6e] to-[#0A2647]">
        <div className="text-center px-6">
          <Logo />
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-lg mx-auto border border-white/20">
            <div className="w-20 h-20 bg-[#C9A227] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
            <p className="text-gray-300 text-lg">
              Your {SERVICE_NAME} request has been submitted. Our team will reach out within 24 hours to discuss your project.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0A2647] via-[#0d3a6e] to-[#8B1E3F] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="flex items-center gap-4 mb-8">
            <Logo />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
            Focus on What Matters — <span className="text-[#C9A227]">We Handle the Rest</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
            Professional virtual assistants who seamlessly integrate into your team and take your productivity to the next level.
          </p>
          <a
            href="#quote"
            className="mt-8 inline-block bg-[#C9A227] text-[#0A2647] font-semibold px-8 py-4 rounded-lg hover:bg-[#b8911f] transition-colors"
          >
            Request a Quote
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2647] text-center mb-4">
            Plans Starting At
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Pick the services you need from our full catalog — your exact monthly rate is confirmed once we review your request.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AGENT_PLAN_TIERS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 text-left flex flex-col justify-between ${
                  plan.popular ? "border-[#C9A227] shadow-lg ring-2 ring-[#C9A227]/20" : "border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{plan.icon}</span>
                    <h3 className="font-bold text-[#0A2647]">{plan.name}</h3>
                    {plan.popular && (
                      <span className="ml-auto bg-[#C9A227] text-[#0A2647] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Popular</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{plan.tagline}</p>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">from</span>
                    <span className="text-2xl font-extrabold text-[#0A2647]">${plan.annualTotalPrice.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">/ year</span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-600 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-[#C9A227]">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#quote"
                  className="block text-center py-2.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-[#0A2647] text-[#0A2647] hover:text-white transition-colors"
                >
                  Request This Plan
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2647] text-center mb-4">
            Why Choose Our {SERVICE_NAME}?
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Our VAs are trained professionals who become an extension of your team.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-[#C9A227]"
              >
                <div className="w-12 h-12 bg-[#0A2647] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A2647] mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2647] text-center mb-16">
            Our Proven 4-Step Process
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-[#0A2647] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#C9A227] text-xl font-bold">{step.step}</span>
                </div>
                {i < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-[#C9A227]/30" />
                )}
                <h3 className="text-xl font-bold text-[#0A2647] mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2647] text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center"
                >
                  <span className="font-semibold text-[#0A2647]">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-[#C9A227] transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote" className="py-20 bg-gradient-to-br from-[#0A2647] to-[#0d3a6e]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Request a Quote
          </h2>
          <p className="text-gray-300 text-center mb-12">
            Tell us about your needs and we&apos;ll find the perfect virtual assistant for your business.
          </p>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#0A2647] mb-2">Full Name *</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A2647] mb-2">Email Address *</label>
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none`}
                  placeholder="john@company.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            <input type="hidden" value={form.service_type} />
            <div className="mt-6">
              <label className="block text-sm font-medium text-[#0A2647] mb-2">Project Description *</label>
              <textarea
                value={form.project_description}
                onChange={(e) => setForm({ ...form, project_description: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${errors.project_description ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none resize-none`}
                placeholder="Tell us about the tasks you need help with and your business..."
              />
              {errors.project_description && (
                <p className="text-red-500 text-sm mt-1">{errors.project_description}</p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-[#0A2647] mb-2">Timeline *</label>
                <select
                  value={form.timeline}
                  onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.timeline ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none bg-white`}
                >
                  <option value="">Select timeline</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2-3 months">2-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                  <option value="Flexible">Flexible</option>
                </select>
                {errors.timeline && <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A2647] mb-2">Budget Range *</label>
                <select
                  value={form.budget_range}
                  onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.budget_range ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none bg-white`}
                >
                  <option value="">Select budget range</option>
                  <option value="Under $1,000">Under $1,000</option>
                  <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                  <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                  <option value="$50,000+">$50,000+</option>
                  <option value="Discuss later">Discuss later</option>
                </select>
                {errors.budget_range && (
                  <p className="text-red-500 text-sm mt-1">{errors.budget_range}</p>
                )}
              </div>
            </div>
            {errors.submit && (
              <p className="text-red-500 text-sm mt-4">{errors.submit}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full bg-[#C9A227] text-[#0A2647] font-semibold py-4 rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
