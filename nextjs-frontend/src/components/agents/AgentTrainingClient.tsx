"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

interface TrainingTrack {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Masterclass" | "Certification";
  duration: string;
  modulesCount: number;
  description: string;
  highlights: string[];
}

const tracks: TrainingTrack[] = [
  {
    id: "t1",
    title: "30-Day New Agent Fast Track Sprint",
    level: "Beginner",
    duration: "4 Weeks · 12 Hours",
    modulesCount: 8,
    description: "Foundational onboarding covering CRM setup, MLS compliance, open house execution, and contract basics.",
    highlights: ["CRM & Lead Routing Setup", "High-Converting Open Houses", "Purchase Contract Walkthrough"],
  },
  {
    id: "t2",
    title: "Luxury Listing Acquisition & Presentation",
    level: "Masterclass",
    duration: "2 Weeks · 8 Hours",
    modulesCount: 6,
    description: "Learn how to pitch high-net-worth sellers, deliver luxury CMA reports, and negotiate listing commissions.",
    highlights: ["High-Net-Worth Seller Psychology", "Custom Listing Deck Customization", "Handling Commission Objections"],
  },
  {
    id: "t3",
    title: "AI Prospecting & Targeted Social Ad Secrets",
    level: "Intermediate",
    duration: "1 Week · 5 Hours",
    modulesCount: 4,
    description: "Leverage AI caption generators, Meta/Google retargeting ads, and automated lead nurturing sequences.",
    highlights: ["AI Copywriting & Video Scripts", "Facebook & Instagram Ad Setup", "Automated SMS/Email Drips"],
  },
  {
    id: "t4",
    title: "High-Stakes Contract & Negotiation Mastery",
    level: "Certification",
    duration: "3 Weeks · 10 Hours",
    modulesCount: 7,
    description: "Master multiple-offer situations, escalation clauses, repair request counter-offers, and contingency removals.",
    highlights: ["Multiple Offer Escalations", "Inspection & Repair Negotiations", "Closing Escrow Protection"],
  },
];

const upcomingWebinars = [
  {
    date: "Aug 27, 2026",
    time: "2:00 PM EST",
    title: "Winning Sellers in High-Interest-Rate Markets",
    speaker: "Marcus Sterling — Top 1% Managing Broker",
  },
  {
    date: "Sep 03, 2026",
    time: "1:00 PM EST",
    title: "Automating 50+ Monthly Leads with AI Chat Widgets",
    speaker: "Elena Vance — Tech & Lead Gen Director",
  },
  {
    date: "Sep 10, 2026",
    time: "3:00 PM EST",
    title: "Luxury Waterfront Property Valuation & Marketing",
    speaker: "David Thorne — $100M+ Producer",
  },
];

export default function AgentTrainingClient() {
  const { success } = useToast();
  const [registeredWebinar, setRegisteredWebinar] = useState<string | null>(null);

  const handleRegister = (title: string) => {
    setRegisteredWebinar(title);
    success(`Registered for "${title}". Check your calendar!`, "Webinar Reserved");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A2647] font-body flex flex-col justify-between">
      <div>
        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-[#07162C] via-[#0A2647] to-[#07162C] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#C9A227]/30 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
            <span className="bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
              🎓 Agent Success Academy
            </span>
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-white">
              Masterclass Real Estate <span className="text-[#C9A227]">Training</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-body">
              Sharpen your listing skills, master AI lead generation, and earn continuing education credits with top-producing brokers.
            </p>
          </div>
        </section>

        {/* STATS HIGHLIGHT */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-[#0A2647] font-mono">100%</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase">On-Demand Access</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#C9A227] font-mono">24/7</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Mentorship Support</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#0A2647] font-mono">CE Accredited</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase">License Credits</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600 font-mono">$0 Fee</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase">For Partner Agents</p>
            </div>
          </div>
        </section>

        {/* CURRICULUM TRACKS */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="font-heading text-3xl font-bold text-[#0A2647]">Structured Learning Pathways</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-body">
              Whether you are a newly licensed agent or an established top producer, our courses are engineered to increase your closing rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#0A2647] text-[#C9A227] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                      {track.level}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-bold">{track.duration}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-[#0A2647]">{track.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed">{track.description}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Takeaways:</p>
                    {track.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="text-[#C9A227]">✓</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/agents/apply"
                  className="w-full bg-slate-100 hover:bg-[#0A2647] hover:text-[#C9A227] text-[#0A2647] font-heading font-bold text-xs py-3 rounded-xl transition-all text-center block uppercase tracking-wider"
                >
                  Enroll via Agent Portal →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE WEBINARS SCHEDULE */}
        <section className="bg-white py-16 border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                🔴 Live Masterclasses
              </span>
              <h2 className="font-heading text-3xl font-bold text-[#0A2647]">Upcoming Live Webinars</h2>
              <p className="text-xs sm:text-sm text-slate-500">Interactive Q&amp;A sessions with luxury brokers and industry leaders.</p>
            </div>

            <div className="space-y-4">
              {upcomingWebinars.map((webinar, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-xs font-mono font-bold text-[#C9A227]">
                      <span>📅 {webinar.date}</span>
                      <span>⏰ {webinar.time}</span>
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-[#0A2647]">{webinar.title}</h4>
                    <p className="text-xs text-slate-500">Host: {webinar.speaker}</p>
                  </div>

                  <button
                    onClick={() => handleRegister(webinar.title)}
                    disabled={registeredWebinar === webinar.title}
                    className={`px-5 py-2.5 rounded-xl font-heading font-bold text-xs transition-all cursor-pointer ${
                      registeredWebinar === webinar.title
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-[#0A2647] hover:bg-[#07162C] text-white shadow-md"
                    }`}
                  >
                    {registeredWebinar === webinar.title ? "✓ Reserved Spot" : "Register Free"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-16 bg-gradient-to-r from-[#0A2647] via-[#07162C] to-[#0A2647] text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              Ready to Access Full Training &amp; Mentorship?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-body max-w-2xl mx-auto">
              Join Domestic Real Estate today and pair with a 1-on-1 broker mentor.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/agents/apply"
                className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-black text-xs sm:text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all uppercase tracking-wider"
              >
                Apply for Academy Membership →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ChatWidgetWrapper context="agent" leadType="agent" />
    </div>
  );
}
