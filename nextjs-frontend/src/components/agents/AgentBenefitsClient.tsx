"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export default function AgentBenefitsClient() {
  // Calculator State
  const [salesCount, setSalesCount] = useState(12);
  const [avgPrice, setAvgPrice] = useState(650000);
  const [commissionRate, setCommissionRate] = useState(2.5); // %
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations
  const grossVolume = salesCount * avgPrice;
  const grossCommission = grossVolume * (commissionRate / 100);
  
  // Domestic 90/10 with $16,000 cap
  const domesticBrokerCut = Math.min(grossCommission * 0.10, 16000);
  const domesticTakeHome = grossCommission - domesticBrokerCut;

  // Traditional 70/30 with no cap
  const traditionalTakeHome = grossCommission * 0.70;
  const annualSavings = domesticTakeHome - traditionalTakeHome;

  const benefitsList = [
    {
      icon: "💎",
      title: "90/10 Commission Split",
      badge: "Industry Leading",
      description: "Keep 90% of your earned commission right from day one, capped at $16,000 annually. After capping, earn 100% net take-home.",
    },
    {
      icon: "🤖",
      title: "AI-Powered CRM & Lead Engine",
      badge: "Exclusive Tech",
      description: "Automated seller lead scoring, automated SMS/email follow-ups, and instant AI buyer-property matching built into your personalized dashboard.",
    },
    {
      icon: "⚡",
      title: "Zero Monthly Desk Fees",
      badge: "$0 Monthly",
      description: "No mandatory monthly tech fees, no desk fees, no franchise royalties. Keep your operational overhead minimal.",
    },
    {
      icon: "🎯",
      title: "Targeted Territory Zip Codes",
      badge: "Verified Leads",
      description: "Exclusive routing of buyer and seller leads in your local markets direct from our high-ranking search portals.",
    },
    {
      icon: "📢",
      title: "Automated Marketing & Media",
      badge: "Instant Collateral",
      description: "One-click digital flyers, social media ad templates, automated listing landing pages, and luxury video templates.",
    },
    {
      icon: "🎓",
      title: "1-on-1 Broker Mentorship",
      badge: "Top 1% Guidance",
      description: "Direct access to senior managing brokers for luxury deal structuring, high-stakes contract reviews, and client negotiations.",
    },
  ];

  const faqs = [
    {
      q: "What is the commission split structure at Domestic Real Estate?",
      a: "We offer an industry-leading 90/10 commission split with a low annual cap of $16,000. Once you reach your cap, you earn 100% of your commission for the remainder of your anniversary year.",
    },
    {
      q: "Are there any hidden desk fees or monthly software subscriptions?",
      a: "None whatsoever. Domestic Real Estate provides full access to our CRM, AI assistant, landing page builders, and transaction management platform with zero monthly fees.",
    },
    {
      q: "How are leads assigned to agents?",
      a: "Leads captured via our AI chat widgets, property inquiry forms, and targeted SEO city pages are automatically qualified and routed directly to preferred agents based on zip code and property category.",
    },
    {
      q: "Can I bring my existing team or branding?",
      a: "Yes! We encourage agent team growth and co-branding. You can feature your custom logo, team name, and personal domain alongside Domestic Real Estate brokerage oversight.",
    },
    {
      q: "How fast are commission checks disbursed?",
      a: "We support instant direct deposit disbursements upon closing escrow verification, ensuring you get paid within 24 hours of closing.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A2647] font-body flex flex-col justify-between">
      <div>
        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-[#07162C] via-[#0A2647] to-[#07162C] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#C9A227]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto space-y-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              ⭐ Agent Partner Growth Program
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto">
              Keep More Commission. <br />
              <span className="text-[#C9A227]">Close More Deals.</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-lg font-body leading-relaxed max-w-2xl mx-auto">
              Upgrade your real estate career with 90/10 splits, zero monthly fees, and automated AI lead generation built to scale your production.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/agents/apply"
                className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-black text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
              >
                Apply for Agent Membership →
              </Link>
              <Link
                href="/agents/training"
                className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-sm px-8 py-4 rounded-xl border border-white/20 transition-all"
              >
                Explore Training Academy
              </Link>
            </div>
          </div>
        </section>

        {/* INTERACTIVE COMMISSION CALCULATOR */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-8">
            <div className="text-center space-y-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Real-Time Earnings Calculator
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#0A2647]">
                See How Much More You Earn With Domestic
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Compare your current brokerage split against our 90/10 capped program.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <label className="text-slate-700">Closed Sales Per Year</label>
                    <span className="text-[#0A2647] font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg">{salesCount} Deals</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={50}
                    step={1}
                    value={salesCount}
                    onChange={(e) => setSalesCount(Number(e.target.value))}
                    className="w-full accent-[#C9A227] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <label className="text-slate-700">Average Sale Price</label>
                    <span className="text-[#0A2647] font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg">${avgPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={200000}
                    max={3000000}
                    step={25000}
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(Number(e.target.value))}
                    className="w-full accent-[#C9A227] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <label className="text-slate-700">Average Commission Side Rate (%)</label>
                    <span className="text-[#0A2647] font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg">{commissionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={1.5}
                    max={3.5}
                    step={0.1}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full accent-[#C9A227] cursor-pointer"
                  />
                </div>
              </div>

              {/* Output Stats Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#07162C] to-[#0A2647] text-white p-6 sm:p-8 rounded-2xl border border-[#C9A227]/40 shadow-xl space-y-5 text-center">
                <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Gross Commission Income (GCI)</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  ${Math.round(grossCommission).toLocaleString()}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-left">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Traditional 70/30</span>
                    <span className="text-sm font-bold text-slate-300 font-mono">${Math.round(traditionalTakeHome).toLocaleString()}</span>
                  </div>
                  <div className="bg-[#C9A227]/20 border border-[#C9A227]/50 p-3 rounded-xl">
                    <span className="text-[10px] text-[#C9A227] font-bold block">Domestic 90/10 (Capped)</span>
                    <span className="text-sm font-extrabold text-white font-mono">${Math.round(domesticTakeHome).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl">
                  <p className="text-xs text-emerald-300 font-bold uppercase">Estimated Extra Annual Revenue</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    +${Math.round(annualSavings).toLocaleString()} / yr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE BENEFITS GRID */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0A2647]">
              Built to Empower <span className="text-[#C9A227]">High-Producing Agents</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-body">
              Everything you need to streamline client management, listing promotions, and contract execution under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefitsList.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{item.icon}</span>
                    <span className="bg-[#0A2647]/10 text-[#0A2647] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-[#0A2647]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="bg-white py-16 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-3xl font-bold text-[#0A2647]">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-slate-500">Everything you need to know about joining our team.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left bg-slate-50 hover:bg-slate-100 flex justify-between items-center font-heading font-bold text-sm text-[#0A2647]"
                    >
                      <span>{faq.q}</span>
                      <span className="text-[#C9A227] text-lg font-mono">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="p-5 bg-white text-xs sm:text-sm text-slate-600 font-body leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="py-16 bg-gradient-to-r from-[#0A2647] via-[#07162C] to-[#0A2647] text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              Ready to Accelerate Your Real Estate Business?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-body max-w-2xl mx-auto">
              Join Domestic Real Estate today. Applications take less than 3 minutes to complete.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/agents/apply"
                className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-xs sm:text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all uppercase tracking-wider"
              >
                Submit Agent Application Now →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ChatWidgetWrapper context="agent" leadType="agent" />
    </div>
  );
}
