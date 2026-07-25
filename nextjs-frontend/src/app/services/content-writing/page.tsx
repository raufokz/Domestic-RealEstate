"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { apiPost } from "@/lib/api";

const SERVICE_SLUG = "content-writing";
const SERVICE_NAME = "Content Writing & Copywriting";

const benefits = [
  {
    title: "SEO Content",
    description:
      "Keyword-optimized articles and pages that rank on search engines while providing genuine value to your readers.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    title: "Blog Posts",
    description:
      "Engaging, well-researched blog content that establishes thought leadership and drives consistent organic traffic.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "Email Copy",
    description:
      "Compelling email sequences that nurture leads, drive engagement, and convert subscribers into loyal customers.",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    title: "Property Descriptions",
    description:
      "Captivating real estate listings that highlight key features and create emotional connections with potential buyers.",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Research",
    description:
      "In-depth research into your industry, audience, competitors, and keywords to inform every piece of content.",
  },
  {
    step: 2,
    title: "Writing",
    description:
      "Expert writers craft compelling, on-brand content that speaks directly to your target audience.",
  },
  {
    step: 3,
    title: "Editing",
    description:
      "Rigorous editing for grammar, clarity, SEO optimization, and brand voice consistency.",
  },
  {
    step: 4,
    title: "Publishing",
    description:
      "Content formatted, optimized, and delivered ready for publication on your chosen platforms.",
  },
];

const faqs = [
  {
    question: "What types of content do you create?",
    answer:
      "We create blog articles, website copy, email campaigns, social media content, property descriptions, whitepapers, case studies, product descriptions, and more. Our writers adapt to any format your business needs.",
  },
  {
    question: "Do your writers specialize in specific industries?",
    answer:
      "Yes, we have writers with expertise in real estate, technology, healthcare, finance, hospitality, and more. We match you with a writer who understands your industry and audience.",
  },
  {
    question: "How do you ensure content is SEO-optimized?",
    answer:
      "Every piece of content is optimized for target keywords, includes proper heading structures, meta descriptions, internal linking, and follows current SEO best practices without sacrificing readability.",
  },
  {
    question: "Can you match our brand voice?",
    answer:
      "Absolutely. We take time to understand your brand personality, tone, and style. Many of our clients tell us our content is indistinguishable from their in-house writing.",
  },
];

export default function ContentWritingPage() {
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
            Content That <span className="text-[#C9A227]">Captivates and Converts</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
            Strategic words that drive traffic, engage audiences, and turn readers into customers across every touchpoint.
          </p>
          <a
            href="#quote"
            className="mt-8 inline-block bg-[#C9A227] text-[#0A2647] font-semibold px-8 py-4 rounded-lg hover:bg-[#b8911f] transition-colors"
          >
            Request a Quote
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2647] text-center mb-4">
            Why Choose Our {SERVICE_NAME}?
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Words matter. We make every one count for your business.
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
            Tell us about your content needs and we&apos;ll craft a custom plan.
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
                placeholder="Tell us about your content goals, target audience, and topics..."
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
