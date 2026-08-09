"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AGENT_PLAN_TIERS,
  ONE_TIME_PACKAGES,
  ENTERPRISE_PLAN,
  CUSTOM_PLAN_SERVICES,
  planPrice,
  type AgentPlanTier,
  type OneTimePackage,
} from "@/lib/agentPlans";
import { useToast } from "@/components/Toast";

function TiltCard({
  children,
  bgClass,
  borderColor,
}: {
  children: React.ReactNode;
  bgClass: string;
  borderColor: string;
}) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({ x: -y / 8, y: x / 8 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className="relative group w-full mb-6" style={{ perspective: "1000px" }}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: rotate.x, rotateY: rotate.y, scale: isHovered ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className={`relative w-full h-48 rounded-2xl p-5 shadow-premium hover:shadow-premium-xl transition-shadow overflow-hidden flex flex-col justify-between select-none cursor-pointer border ${borderColor} ${bgClass}`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -translate-x-[110%] group-hover:translate-x-[110%] transition-transform duration-1000 ease-out" />
        {children}
      </motion.div>
    </div>
  );
}

export default function PricingPage() {
  const [pricingType, setPricingType] = useState<"annual" | "one-time" | "custom">("annual");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedPlanForCal, setSelectedPlanForCal] = useState<string>("Starter");

  /* ROI Calculator States */
  const [calLeads, setCalLeads] = useState(40);
  const [calCommission, setCalCommission] = useState(7500);

  /* Custom Plan Builder States */
  const [customServices, setCustomServices] = useState<string[]>([
    "lead_gen",
    "social_mgr",
    "idx_web",
  ]);
  const [customBudget, setCustomBudget] = useState(1500);
  const [customBillingPref, setCustomBillingPref] = useState<"annual" | "one-time" | "quarterly">("annual");
  const [customZipcodes, setCustomZipcodes] = useState("33139, 33140");
  const [customTargetLeads, setCustomTargetLeads] = useState(30);
  const [customNotes, setCustomNotes] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [submittedCustomSuccess, setSubmittedCustomSuccess] = useState(false);

  const { success, notifyError } = useToast();

  useEffect(() => {
    document.title = "Annual & Custom Real Estate Agent Pricing | Domestic Real Estate";
  }, []);

  const planBackgrounds: Record<string, { bg: string; border: string; accentText: string; lightAccent: string }> = {
    Solo: {
      bg: "bg-gradient-to-br from-[#4a3224] via-[#7d4f30] to-[#2b1b11] text-[#ffdca3]",
      border: "border-[#7d4f30]/40",
      accentText: "text-[#c99a6b]",
      lightAccent: "#c99a6b",
    },
    Starter: {
      bg: "bg-gradient-to-br from-[#3f4a5c] via-[#5c6f89] to-[#252f40] text-[#eef2f7]",
      border: "border-[#7a8fa9]/40",
      accentText: "text-[#9cb5d4]",
      lightAccent: "#9cb5d4",
    },
    Professional: {
      bg: "bg-gradient-to-br from-[#937213] via-[#c9a227] to-[#4b3907] text-white",
      border: "border-[#c9a227]/40",
      accentText: "text-[#ffdca3]",
      lightAccent: "#ffdca3",
    },
    Elite: {
      bg: "bg-gradient-to-br from-[#1b2535] via-[#0b111e] to-[#040810] text-[#fff6d1]",
      border: "border-[#ffd700]/30 shadow-[0_0_20px_rgba(201,162,39,0.15)]",
      accentText: "text-[#ffd700] drop-shadow-[0_1px_4px_rgba(201,162,39,0.3)]",
      lightAccent: "#ffd700",
    },
  };

  const getPlanAnnualCostForCal = () => {
    const matched = AGENT_PLAN_TIERS.find((p) => p.name === selectedPlanForCal);
    if (!matched) return 0;
    return matched.annualTotalPrice;
  };

  const estDealsAnnually = Math.round(calLeads * 12 * 0.06);
  const estAnnualRevenue = estDealsAnnually * calCommission;
  const annualPlanCost = getPlanAnnualCostForCal();
  const netEarnings = estAnnualRevenue - annualPlanCost;
  const roiMultiplier = annualPlanCost > 0 ? (estAnnualRevenue / annualPlanCost).toFixed(1) : "0";

  // Calculate total estimated cost for Custom Builder
  const calculatedCustomEst = customServices.reduce((total, svcId) => {
    const item = CUSTOM_PLAN_SERVICES.find((s) => s.id === svcId);
    return total + (item ? item.priceEst : 0);
  }, 300);

  const toggleCustomService = (svcId: string) => {
    setCustomServices((prev) =>
      prev.includes(svcId) ? prev.filter((id) => id !== svcId) : [...prev, svcId]
    );
  };

  const handleCustomPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone) {
      notifyError(null, "Please fill in your name, email, and phone number.");
      return;
    }
    setIsSubmittingCustom(true);
    try {
      const selectedServiceNames = customServices
        .map((id) => CUSTOM_PLAN_SERVICES.find((s) => s.id === id)?.name)
        .filter(Boolean);

      const { apiPost } = await import("@/lib/api");
      await apiPost("/forms/contact", {
        first_name: contactName.split(" ")[0] || contactName,
        last_name: contactName.split(" ").slice(1).join(" ") || "Agent",
        email: contactEmail,
        phone: contactPhone,
        subject: `Custom Plan Request - Est. $${calculatedCustomEst}/mo`,
        message: `CUSTOM PLAN REQUEST DETAILS:\n- Billing Preference: ${customBillingPref}\n- Targeted Monthly Budget: $${customBudget}\n- Estimated Calculated Plan Cost: $${calculatedCustomEst}/mo\n- Target Monthly Leads: ${customTargetLeads}\n- Zipcodes: ${customZipcodes}\n- Services Selected (${selectedServiceNames.length}): ${selectedServiceNames.join(", ")}\n- Additional Notes: ${customNotes}`,
      });

      setSubmittedCustomSuccess(true);
      success("Your custom plan request has been submitted! Our team will reach out within 2 hours.", "Custom Plan Requested");
    } catch (err: unknown) {
      notifyError(err, "Failed to submit custom plan request.");
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const faqItems = [
    {
      q: "Why are plans billed annually or offered as one-time packages?",
      a: "Our dedicated Virtual Assistants and exclusive zip-code routing require guaranteed infrastructure commitment. Annual plans deliver maximal cost savings (20% off) and priority lead allocation, while One-Time packages allow agents to obtain single done-for-you systems with zero recurring obligation.",
    },
    {
      q: "How does the Custom Plan Builder work?",
      a: "The Custom Plan Builder allows you to choose exact services (e.g. Lead Gen + Social Media + Cold Calling), specify your target budget and zip codes, and request a bespoke pricing agreement built around your specific transaction velocity.",
    },
    {
      q: "What is included in the One-Time Setup Packages?",
      a: "One-Time packages include complete done-for-you deliverables: custom luxury website development, IDX MLS integration, verified regional leads allocation, and hands-on onboarding without monthly recurring subscription commitments.",
    },
    {
      q: "How do Dedicated Virtual Assistants work?",
      a: "Our Professional and Elite tiers allocate pre-screened real estate Virtual Assistants (VAs) directly to your brokerage pipeline. They handle listing coordinates, schedule calendar leads, perform CRM skip-tracing, and handle cold calls or social follow-ups.",
    },
    {
      q: "What is your lock-in policy for zip code leads?",
      a: "We route listing leads exclusively based on your selected service zip codes. Unlike shared directories, our Preferred Partner matching guarantees high-intent exclusivity routing so your custom leads aren't split with competing regional agents.",
    },
  ];

  return (
    <div className="bg-[#f8fafc] text-navy font-sans min-h-screen">
      {/* ── HEADER HERO SECTION ── */}
      <section className="relative py-24 bg-gradient-to-b from-[#0a2647] to-[#07162c] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9a227]/20 border border-[#c9a227]/30 text-[#c9a227] text-xs font-mono font-bold uppercase tracking-wider mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#c9a227] animate-pulse" />
            Preferred Agent Program
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-heading font-black tracking-tight text-white mb-6 leading-tight"
          >
            Flexible Plans Tailored To Your Needs <br />
            <span className="text-[#c9a227] bg-clip-text">Annual Tiers, One-Time Systems & Custom Packages</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Choose between full-year preferred partner subscriptions, one-time turnkey setup packages, or build your own custom service plan tailored to your specific budget and leads goals.
          </motion.p>

          {/* Pricing Model Switcher */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex flex-wrap justify-center items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-premium"
          >
            <button
              onClick={() => setPricingType("annual")}
              className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all duration-300 flex items-center gap-2 ${
                pricingType === "annual"
                  ? "bg-[#c9a227] text-[#0a2647] shadow-gold font-black scale-102"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>📅 Annual Plans</span>
              <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>

            <button
              onClick={() => setPricingType("one-time")}
              className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all duration-300 flex items-center gap-2 ${
                pricingType === "one-time"
                  ? "bg-[#c9a227] text-[#0a2647] shadow-gold font-black scale-102"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>⚡ One-Time Packages</span>
            </button>

            <button
              onClick={() => setPricingType("custom")}
              className={`px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all duration-300 flex items-center gap-2 ${
                pricingType === "custom"
                  ? "bg-[#c9a227] text-[#0a2647] shadow-gold font-black scale-102"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>🛠️ Build Custom Plan</span>
              <span className="bg-amber-500 text-[#0a2647] text-[9px] font-black px-2 py-0.5 rounded-full">
                Tailored
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT DISPLAY BASED ON PRICING TYPE ── */}
      <section className="py-20 max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <AnimatePresence mode="wait">
          {/* ANNUAL PLANS DISPLAY */}
          {pricingType === "annual" && (
            <motion.div
              key="annual-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {AGENT_PLAN_TIERS.map((plan, idx) => {
                  const isPopular = !!plan.popular;
                  const price = planPrice(plan, "annual");
                  const style = planBackgrounds[plan.name] || planBackgrounds.Solo;

                  return (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * idx }}
                      className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 bg-white ${
                        isPopular
                          ? "border-[#c9a227] shadow-premium-lg ring-4 ring-[#c9a227]/20 scale-103"
                          : "border-slate-200 hover:shadow-premium hover:border-[#0a2647]/30"
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-3.5 right-6 bg-[#c9a227] text-[#0a2647] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-gold-lg">
                          ★ Best Value
                        </span>
                      )}

                      <div>
                        <TiltCard bgClass={style.bg} borderColor={style.border}>
                          <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-mono font-bold tracking-widest opacity-80 uppercase">
                                Domestic Real Estate
                              </span>
                              <span className="text-[7px] font-mono tracking-wider opacity-60">
                                ANNUAL MEMBER PASS
                              </span>
                            </div>

                            <svg className="w-5 h-5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>

                          <div className="w-8 h-6 bg-gradient-to-r from-amber-200/90 to-amber-400 rounded-md relative shadow-sm border border-amber-300/40">
                            <div className="absolute inset-x-1.5 inset-y-1 border border-amber-800/20 rounded-sm" />
                            <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-amber-800/10" />
                            <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-amber-800/10" />
                          </div>

                          <div className="flex justify-between items-end w-full">
                            <div className="flex flex-col">
                              <span className="text-sm font-black tracking-normal uppercase font-heading">
                                {plan.name} Partner
                              </span>
                              <span className="text-[9px] font-mono tracking-wider opacity-70 flex items-center gap-1 mt-0.5">
                                ANNUAL EXCLUSIVE
                              </span>
                            </div>

                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                              <span className="text-xs font-black text-white">RE</span>
                            </div>
                          </div>
                        </TiltCard>

                        <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed min-h-[32px]">
                          {plan.tagline}
                        </p>

                        <div className="mb-6">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-black text-[#0a2647] font-heading tracking-tight">
                              ${plan.annualTotalPrice.toLocaleString()}
                            </span>
                            <span className="text-sm font-bold text-slate-600 font-mono">
                              / year
                            </span>
                          </div>

                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full">
                              💰 Paid Annually (Save 20%)
                            </span>
                          </div>
                        </div>

                        <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-extrabold text-[#0a2647] mb-6">
                          ⚡ Capacity: Up to {plan.cap ?? "Unlimited"} Services
                        </div>

                        <ul className="space-y-4 mb-8 text-xs font-semibold leading-relaxed text-slate-700">
                          {plan.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-3">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                                ✓
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        href={`/register?role=agent&plan=${encodeURIComponent(plan.name)}&billing=annual`}
                        className={`block w-full text-center py-4 rounded-xl text-xs font-extrabold transition-all ${
                          isPopular
                            ? "bg-[#0a2647] hover:bg-[#0c2e56] text-white shadow-premium"
                            : "bg-[#c9a227]/10 hover:bg-[#c9a227] hover:text-[#0a2647] text-[#0a2647] border border-[#c9a227]/30"
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ONE-TIME PACKAGES DISPLAY */}
          {pricingType === "one-time" && (
            <motion.div
              key="one-time-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-navy font-heading">
                  One-Time Setup & Turnkey Systems
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  No monthly recurring charges — pay once for done-for-you agent setup & lead bundles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {ONE_TIME_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-3xl border p-8 flex flex-col justify-between bg-white relative transition-all duration-300 hover:shadow-premium-lg ${
                      pkg.popular
                        ? "border-[#c9a227] ring-4 ring-[#c9a227]/20 shadow-premium"
                        : "border-slate-200"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3.5 right-6 bg-[#c9a227] text-[#0a2647] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-gold">
                        ★ Recommended System
                      </span>
                    )}

                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#0a2647]/5 text-[#0a2647] flex items-center justify-center text-2xl mb-4">
                        {pkg.icon}
                      </div>

                      <h4 className="text-xl font-heading font-extrabold text-[#0a2647] mb-2">
                        {pkg.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mb-6">
                        {pkg.tagline}
                      </p>

                      <div className="mb-6">
                        <span className="text-4xl font-black text-[#0a2647] font-heading">
                          ${pkg.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 block mt-1">
                          Single One-Time Payment (Zero Monthly Fees)
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-6 mb-8">
                        <span className="text-xs font-heading font-extrabold text-[#0a2647] uppercase tracking-wider block mb-4">
                          System Deliverables:
                        </span>
                        <ul className="space-y-3 text-xs font-semibold text-slate-700">
                          {pkg.deliverables.map((item) => (
                            <li key={item} className="flex items-start gap-2.5">
                              <span className="text-[#c9a227] font-bold">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Link
                      href={`/register?role=agent&plan=${encodeURIComponent(pkg.name)}&billing=one-time`}
                      className="block w-full text-center py-4 rounded-xl text-xs font-extrabold bg-[#0a2647] hover:bg-[#0c2e56] text-white shadow-premium transition"
                    >
                      {pkg.cta} →
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CUSTOM PLAN BUILDER DISPLAY */}
          {pricingType === "custom" && (
            <motion.div
              key="custom-builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-premium-xl"
            >
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-[#c9a227] text-xs font-mono font-bold uppercase tracking-widest bg-[#c9a227]/10 px-4 py-1.5 rounded-full">
                  Interactive Plan Builder
                </span>
                <h3 className="text-3xl font-heading font-black text-navy mt-4">
                  Configure Your Custom Real Estate Service Agreement
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                  Select the exact services, target zip codes, and budget parameters you need. We'll generate a custom plan tailored specifically to your brokerage.
                </p>
              </div>

              {submittedCustomSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center max-w-xl mx-auto">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    ✓
                  </div>
                  <h4 className="text-2xl font-bold text-emerald-950 mb-2">
                    Custom Plan Requested!
                  </h4>
                  <p className="text-sm text-emerald-800 mb-6">
                    Thank you! Our agent success team is reviewing your custom service choices. We will contact you at <strong>{contactEmail}</strong> within 2 business hours.
                  </p>
                  <button
                    onClick={() => setSubmittedCustomSuccess(false)}
                    className="bg-[#0a2647] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#0c2e56] transition"
                  >
                    Build Another Custom Plan
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomPlanSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Left Column: Form Controls */}
                  <div className="lg:col-span-7 space-y-8">
                    {/* 1. Select Services */}
                    <div>
                      <label className="block text-xs font-heading font-extrabold uppercase tracking-wide text-slate-700 mb-3">
                        1. Select Services Needed ({customServices.length} Selected)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CUSTOM_PLAN_SERVICES.map((svc) => {
                          const isSelected = customServices.includes(svc.id);
                          return (
                            <div
                              key={svc.id}
                              onClick={() => toggleCustomService(svc.id)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-[#0a2647] text-white border-[#0a2647] shadow-sm"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-[#c9a227] rounded"
                                />
                                <div>
                                  <span className="text-xs font-bold block">{svc.name}</span>
                                  <span className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                                    {svc.category}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-xs font-mono font-bold ${isSelected ? "text-[#c9a227]" : "text-slate-500"}`}>
                                +${svc.priceEst}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Budget & Billing Preference */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-heading font-extrabold uppercase tracking-wide text-slate-700 mb-2">
                          Target Budget: ${customBudget.toLocaleString()}
                        </label>
                        <input
                          type="range"
                          min="300"
                          max="5000"
                          step="100"
                          value={customBudget}
                          onChange={(e) => setCustomBudget(Number(e.target.value))}
                          className="w-full accent-[#c9a227] cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                          Slide to specify your target spending limit
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-heading font-extrabold uppercase tracking-wide text-slate-700 mb-2">
                          Payment Frequency
                        </label>
                        <select
                          value={customBillingPref}
                          onChange={(e) => setCustomBillingPref(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-[#c9a227]"
                        >
                          <option value="annual">Annual Commitment (20% Off)</option>
                          <option value="one-time">One-Time Project Setup</option>
                          <option value="quarterly">Quarterly Billing</option>
                        </select>
                      </div>
                    </div>

                    {/* 3. Zip Codes & Leads Goal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-heading font-extrabold uppercase tracking-wide text-slate-700 mb-2">
                          Target Service Zip Codes
                        </label>
                        <input
                          type="text"
                          value={customZipcodes}
                          onChange={(e) => setCustomZipcodes(e.target.value)}
                          placeholder="e.g. 33139, 33140, 90210"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-heading font-extrabold uppercase tracking-wide text-slate-700 mb-2">
                          Monthly Lead Goal: {customTargetLeads} Leads
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="150"
                          step="5"
                          value={customTargetLeads}
                          onChange={(e) => setCustomTargetLeads(Number(e.target.value))}
                          className="w-full accent-[#c9a227] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 4. Contact Information */}
                    <div className="border-t border-slate-200 pt-6 space-y-4">
                      <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#0a2647]">
                        Contact & Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Full Name *"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Email Address *"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number *"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Additional notes or custom requests (optional)..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Dynamic Cost & Summary Box */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-[#0a2647] text-white p-8 rounded-3xl border-2 border-[#c9a227] shadow-premium-xl">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-mono font-bold uppercase text-[#c9a227]">
                          Custom Plan Estimate
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold text-white">
                          {customBillingPref.toUpperCase()} TERMS
                        </span>
                      </div>

                      <div className="text-center py-6 border-y border-white/10 mb-6">
                        <span className="text-xs text-slate-300 font-bold block mb-1">
                          Calculated Estimated Plan Value
                        </span>
                        <span className="text-5xl font-black text-[#c9a227] font-mono tracking-tight">
                          ${(calculatedCustomEst * 12).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-300 font-mono block mt-1">/ year (or One-Time Agreement)</span>
                        <span className="text-xs text-slate-400 block mt-2">
                          Target Budget: ${customBudget.toLocaleString()} / year
                        </span>
                      </div>

                      <div className="space-y-3 text-xs mb-8">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                          Included Configuration:
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Selected Services:</span>
                          <span className="font-bold text-[#c9a227]">{customServices.length} Services</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Monthly Lead Goal:</span>
                          <span className="font-bold text-white">{customTargetLeads} Verified Leads</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Zipcodes Covered:</span>
                          <span className="font-bold text-white truncate max-w-[150px]">{customZipcodes || "None"}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingCustom}
                      className="w-full bg-[#c9a227] hover:bg-amber-400 font-black text-[#0a2647] py-4 rounded-xl text-xs uppercase tracking-wider transition shadow-gold-lg disabled:opacity-50"
                    >
                      {isSubmittingCustom ? "Submitting Custom Request..." : "Request Custom Plan Quote →"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ENTERPRISE CUSTOM TIER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-[#0a2647] to-[#07162c] border border-slate-700 shadow-premium-lg rounded-3xl p-8 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#c9a227]">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading">{ENTERPRISE_PLAN.name}</h3>
                  <p className="text-sm font-semibold text-[#c9a227]">{ENTERPRISE_PLAN.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-3xl">
                Bespoke CRM mapping, custom integrations, MLS webhooks, and unlimited Virtual Assistants (VA) team support. Built specifically for high-growth real estate institutions, teams, and nationwide brokerages.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ENTERPRISE_PLAN.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                    <span className="text-[#c9a227] text-sm">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <button
                onClick={() => setPricingType("custom")}
                className="w-full lg:w-auto bg-[#c9a227] hover:bg-amber-400 text-[#0a2647] font-black px-10 py-4.5 rounded-xl text-center text-sm shadow-gold transition-all"
              >
                {ENTERPRISE_PLAN.cta} →
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── COMMISSION ROI VALUE CALCULATOR ── */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#c9a227] text-xs font-mono font-bold uppercase tracking-widest bg-[#c9a227]/10 px-4 py-1.5 rounded-full">
              Interactive ROI Tool
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-navy mt-4">
              Calculate Your Preferred Agent Return on Investment
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2">
              Model your commissions pipeline and compare gross returns with the cost of your selected annual partnership subscription.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Input range controls */}
            <div className="lg:col-span-7 space-y-8 text-left bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <label className="block text-xs font-heading font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                  Select Target Annual Plan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {AGENT_PLAN_TIERS.map((plan) => (
                    <button
                      key={plan.name}
                      type="button"
                      onClick={() => setSelectedPlanForCal(plan.name)}
                      className={`py-3 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                        selectedPlanForCal === plan.name
                          ? "bg-[#0a2647] text-white border-[#0a2647] shadow-premium"
                          : "bg-white text-slate-700 border-slate-250 hover:bg-slate-100"
                      }`}
                    >
                      {plan.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                  <span>Monthly Local Leads Routed</span>
                  <span className="text-[#0a2647] font-mono text-sm bg-amber-100 px-2 py-0.5 rounded font-extrabold">
                    {calLeads} Leads / mo
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={calLeads}
                  onChange={(e) => setCalLeads(Number(e.target.value))}
                  className="w-full accent-[#c9a227] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                  <span>Average Commission Per Closed Escrow</span>
                  <span className="text-[#0a2647] font-mono text-sm bg-amber-100 px-2 py-0.5 rounded font-extrabold">
                    ${calCommission.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="500"
                  value={calCommission}
                  onChange={(e) => setCalCommission(Number(e.target.value))}
                  className="w-full accent-[#c9a227] cursor-pointer"
                />
              </div>
            </div>

            {/* Display calculation box */}
            <div className="lg:col-span-5 bg-[#0a2647] text-white p-8 rounded-3xl border-2 border-[#c9a227] text-center shadow-premium-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

              <span className="text-xs font-black uppercase tracking-wider text-[#c9a227]">
                Projected Annual Net Profit
              </span>
              <motion.div
                key={netEarnings}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl sm:text-5xl font-black text-[#c9a227] font-mono my-4 drop-shadow-[0_2px_8px_rgba(201,162,39,0.2)]"
              >
                ${netEarnings.toLocaleString()}
              </motion.div>

              <div className="space-y-3.5 text-xs text-left max-w-sm mx-auto p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Est. Deals Per Year (6% Conv):</span>
                  <span className="text-[#c9a227] font-bold">{estDealsAnnually} Deals</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Annual Plan Cost:</span>
                  <span className="text-red-400 font-bold">${annualPlanCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-slate-800 pt-2.5">
                  <span className="text-slate-400">ROI Multiplier:</span>
                  <span className="text-emerald-400 font-bold">{roiMultiplier}x Return</span>
                </div>
              </div>

              <Link
                href={`/register?role=agent&plan=${encodeURIComponent(selectedPlanForCal)}&billing=annual`}
                className="mt-8 block bg-[#c9a227] hover:bg-amber-400 font-black text-[#0a2647] py-4 rounded-xl text-sm transition shadow-gold-lg hover:scale-103"
              >
                Activate {selectedPlanForCal} Annual Plan →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DETAILED MATRIX FEATURE TABLE ── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#c9a227] text-xs font-mono font-bold uppercase tracking-widest bg-[#c9a227]/10 px-4 py-1.5 rounded-full">
            Detailed Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-navy mt-4">
            Compare Annual Plan Features & Capabilities
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2">
            Determine which capabilities align with your lead pipeline, virtual staff requirements, and brokerage support SLAs.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-premium">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0a2647] text-white">
                <th className="p-4 font-bold text-sm">Key Plan Feature</th>
                <th className="p-4 font-bold text-sm text-center">Solo</th>
                <th className="p-4 font-bold text-sm text-center bg-[#c9a227]/10 text-white border-x border-[#c9a227]/20">Starter</th>
                <th className="p-4 font-bold text-sm text-center">Professional</th>
                <th className="p-4 font-bold text-sm text-center">Elite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-700 bg-white">
              {[
                { label: "Done-for-You Services Cap", items: ["Pick 2 Services", "Pick 5 Services", "Pick 10 Services", "Unlimited Services"] },
                { label: "Service Categories", items: ["Any Categories", "Core & Web-Tech Only", "Any Categories", "Any Categories"] },
                { label: "Dedicated Virtual Assistant", items: ["-", "-", "Dedicated VA Allocated", "Dedicated Team + Manager"] },
                { label: "Agent Directory Listing", items: ["Standard Listing", "★ Preferred Badge", "VIP Directory Listing", "Featured Top Agency Listing"] },
                { label: "Zip Code Exclusivity locking", items: ["-", "Shared Zip Codes", "Locked Exclusives", "100% Exclusive Routes"] },
                { label: "CRM triggers & API Integrations", items: ["-", "-", "Basic Integration", "Advanced Automation Support"] },
                { label: "Support Response SLA Guarantee", items: ["48h Response SLA", "24h Response SLA", "4h Priority SLA", "1h Immediate SLA"] },
                { label: "MLS Data Syncing feeds", items: ["-", "-", "Manual Upload", "Automated Sync Included"] },
              ].map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50">
                  <td className="p-4 text-[#0a2647] font-bold">{row.label}</td>
                  {row.items.map((val, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-4 text-center ${
                        cIdx === 1 ? "bg-[#c9a227]/5 border-x border-[#c9a227]/10" : ""
                      }`}
                    >
                      {val === "-" ? (
                        <span className="text-slate-300 font-bold">-</span>
                      ) : (
                        <span className={val.includes("✓") || val.includes("★") || val.includes("Unlimited") ? "text-[#0a2647] font-black" : "text-slate-650"}>
                          {val}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ SCHEMAS ACCORDION ── */}
      <section className="py-24 bg-slate-100 border-t border-slate-250">
        <div className="max-w-4xl mx-auto px-6 text-left">
          <div className="text-center mb-16">
            <span className="text-[#c9a227] text-xs font-mono font-bold uppercase tracking-widest bg-[#c9a227]/10 px-4 py-1.5 rounded-full">
              Help & Support
            </span>
            <h2 className="text-3xl font-heading font-black text-navy mt-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-shadow">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-navy flex justify-between items-center cursor-pointer hover:text-[#c9a227] transition-colors"
                  >
                    <span className="text-sm sm:text-base font-heading font-extrabold">{faq.q}</span>
                    <span className="text-xl font-bold font-mono text-[#c9a227] ml-4">{isOpen ? "−" : "+"}</span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4 font-semibold"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
