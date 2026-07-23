"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { apiPost } from "@/lib/api";

const SERVICE_SLUG = "web-development";
const SERVICE_NAME = "Web Development";

const benefits = [
  {
    title: "Responsive Design",
    description:
      "Websites that look stunning and function flawlessly on every device — from desktops to smartphones.",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    title: "Fast Loading",
    description:
      "Optimized performance with lazy loading, CDN integration, and code splitting for sub-second load times.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "SEO-Friendly",
    description:
      "Built with clean code, proper semantics, and technical SEO best practices to help you rank from day one.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    title: "Custom Features",
    description:
      "From booking systems to CRM integrations, we build the exact functionality your business needs.",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Planning",
    description:
      "We map out your site architecture, user journeys, and technical requirements before a line of code is written.",
  },
  {
    step: 2,
    title: "Design",
    description:
      "Our designers create wireframes and visual mockups that align with your brand and delight your users.",
  },
  {
    step: 3,
    title: "Development",
    description:
      "Clean, maintainable code built on modern frameworks with rigorous quality assurance throughout.",
  },
  {
    step: 4,
    title: "Launch",
    description:
      "We handle deployment, performance optimization, and provide ongoing support to keep your site running smoothly.",
  },
];

const faqs = [
  {
    question: "How long does it take to build a website?",
    answer:
      "Timelines vary based on complexity. A typical business website takes 4–8 weeks, while custom web applications may take 3–6 months. We provide a detailed timeline during our initial consultation.",
  },
  {
    question: "What technology stack do you use?",
    answer:
      "We work with modern stacks including Next.js, React, Node.js, and headless CMS platforms. The technology choice depends on your specific needs and scalability requirements.",
  },
  {
    question: "Do you provide website hosting?",
    answer:
      "Yes, we offer managed hosting solutions and can also deploy to your preferred hosting provider. We ensure optimal performance and security regardless of the hosting environment.",
  },
  {
    question: "Will I be able to update the website myself?",
    answer:
      "Absolutely. We build with user-friendly CMS platforms and provide training so your team can manage content updates independently.",
  },
];

export default function WebDevelopmentPage() {
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
            Build Your Digital Presence with <span className="text-[#C9A227]">Custom Web Solutions</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
            From stunning websites to powerful web applications, we craft digital experiences that drive results and scale with your business.
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
            We build websites that don&apos;t just look great — they perform.
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
            Tell us about your project and we&apos;ll get back to you with a tailored proposal.
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
                placeholder="Tell us about your goals, challenges, and expectations..."
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
