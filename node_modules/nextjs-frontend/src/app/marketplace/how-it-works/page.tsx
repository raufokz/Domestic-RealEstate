"use client";

import Link from "next/link";

const STEPS = [
  {
    icon: "🕵️",
    title: "1. Browse available leads",
    text: "Every lead is listed with a public summary — category, location, budget range, and the price to unlock it. No personal contact details are shown until you own the lead.",
  },
  {
    icon: "⏱️",
    title: "2. Reserve it in one click",
    text: "Click Unlock Lead and it is reserved for you for 3 minutes. Reservations are first-come, first-served and atomic — two buyers can never grab the same lead at the same time.",
  },
  {
    icon: "💳",
    title: "3. Pay to unlock",
    text: "Submit your payment. Because purchases are invoiced and confirmed manually, your chosen lead is held for 48 hours while our team verifies your payment.",
  },
  {
    icon: "✅",
    title: "4. Get the full details",
    text: "Once your payment is confirmed, the lead is marked Sold and you get full contact information — name, email, phone, location, and any notes — permanently.",
  },
];

const FAQS = [
  {
    q: "How is payment handled?",
    a: "Payments are currently manual and invoice-based. After you initiate a purchase, one of our admins verifies your payment and confirms the sale. There is no automated card payment yet.",
  },
  {
    q: "What happens if my reservation expires?",
    a: "If you reserve a lead but do not start payment within 3 minutes, the lead is released back to the marketplace for other buyers.",
  },
  {
    q: "Can I cancel after reserving?",
    a: "Yes. You can cancel and release the lead before submitting payment — it goes straight back to the marketplace.",
  },
  {
    q: "What if I don't get the lead?",
    a: "You only pay for leads you successfully purchase. If a lead is already taken, you will not be charged and can simply pick another.",
  },
  {
    q: "Who can buy leads?",
    a: "Any registered user can browse and buy leads on the marketplace.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-[#0A2647] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9A227] mb-3">
            Pay-Per-Lead Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            Buy exclusive real estate leads in three clicks
          </h1>
          <p className="text-white/70 mt-4 max-w-2xl mx-auto">
            First-come, first-served. Reserve a lead, pay to unlock it, and receive full
            contact details — no subscription, no minimums.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/marketplace"
              className="bg-[#C9A227] text-[#0A2647] font-bold px-8 py-3.5 rounded-xl hover:bg-[#b8911f] transition"
            >
              Browse Marketplace
            </Link>
            <Link
              href="/marketplace/purchased"
              className="border border-white/25 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition"
            >
              My Purchased Leads
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2647] text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STEPS.map((step) => (
            <div key={step.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="font-bold text-[#0A2647] mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing note */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="text-3xl mb-3">💡</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A2647] mb-3">Transparent, one-off pricing</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm">
            Each lead shows its exact price before you reserve it. What you see is what you pay —
            no hidden fees, no monthly commitment. The lead is yours permanently once your
            payment is confirmed.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2647] text-center mb-8">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 open:bg-white">
              <summary className="font-semibold text-[#0A2647] cursor-pointer list-none flex justify-between items-center">
                {faq.q}
                <span className="text-[#C9A227] group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="text-sm text-slate-600 mt-3">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/marketplace"
            className="inline-block bg-[#0A2647] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#07162C] transition"
          >
            Start Buying Leads
          </Link>
        </div>
      </section>
    </div>
  );
}
