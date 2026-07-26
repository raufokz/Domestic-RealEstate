"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { apiPost } from "@/lib/api";

const SERVICE_SLUG = "ecommerce";
const SERVICE_NAME = "E-Commerce Development";

const benefits = [
  {
    title: "Custom Storefront",
    description:
      "A uniquely designed online store that reflects your brand identity and provides an exceptional shopping experience.",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    title: "Payment Integration",
    description:
      "Seamless integration with Stripe, PayPal, Apple Pay, and regional payment gateways for frictionless checkout.",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    title: "Inventory Management",
    description:
      "Real-time stock tracking, automated reorder alerts, and multi-location inventory sync across all sales channels.",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    title: "SEO Optimization",
    description:
      "Built-in SEO features including optimized product pages, schema markup, and fast loading speeds to drive organic traffic.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Strategy",
    description:
      "We analyze your products, audience, and competition to build a conversion-focused e-commerce strategy.",
  },
  {
    step: 2,
    title: "Design",
    description:
      "Custom UI/UX design that guides visitors from browsing to checkout with minimal friction.",
  },
  {
    step: 3,
    title: "Development",
    description:
      "Robust, scalable e-commerce platform built with secure payment processing and inventory management.",
  },
  {
    step: 4,
    title: "Launch",
    description:
      "Thorough testing, performance optimization, and launch support to ensure a smooth go-live.",
  },
];

const faqs = [
  {
    question: "Which e-commerce platforms do you work with?",
    answer:
      "We build custom e-commerce solutions and work with platforms including Shopify, WooCommerce, Magento, and headless commerce solutions. We recommend the best fit based on your needs.",
  },
  {
    question: "Can you migrate my existing store to a new platform?",
    answer:
      "Yes, we handle complete store migrations including products, customers, orders, and SEO redirects. We ensure zero data loss and minimal downtime during the transition.",
  },
  {
    question: "Do you integrate with my existing tools?",
    answer:
      "We integrate with popular tools including ERP systems, CRM platforms, shipping providers, accounting software, and marketing automation tools.",
  },
  {
    question: "How do you handle security for online payments?",
    answer:
      "We implement PCI DSS compliant payment processing, SSL certificates, fraud detection, and regular security audits to protect your store and customer data.",
  },
];

export default function ECommercePage() {
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
            Launch Your Online Store with <span className="text-[#C9A227]">Confidence</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
            From concept to conversion — we build e-commerce experiences that turn browsers into loyal customers.
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
            We build stores that don&apos;t just look good — they generate revenue.
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
            Tell us about your online store and we&apos;ll get back to you with a tailored proposal.
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
                placeholder="Tell us about your products, target market, and goals..."
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
