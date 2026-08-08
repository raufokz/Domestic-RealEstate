import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lead Generation Service | Generate Quality Real Estate Leads',
  description: 'Generate high-quality real estate leads with AI-powered qualification, auto-assignment, and CRM integration. Boost your sales pipeline today.',
};

const FEATURES = [
  { title: 'AI Qualification', description: 'Our AI automatically scores and qualifies leads based on intent, budget, and timeline. Focus only on leads that are ready to convert.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { title: 'Auto-Assignment', description: 'Leads are automatically routed to the right agent based on location, specialization, and availability. Zero manual distribution needed.', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { title: 'CRM Integration', description: 'Seamlessly sync with your existing CRM. Lead data flows directly into your system with zero data entry or manual work.', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
  { title: 'Analytics', description: 'Track lead sources, conversion rates, agent performance, and ROI. Make data-driven decisions to optimize your lead generation strategy.', icon: 'M3 3v18h18M9 17V9m4 8V5m4 12v-4' },
];

const TIERS = [
  {
    name: 'Starter Annual',
    price: '$1,428',
    period: '/year',
    description: 'Perfect for solo agents (billed annually)',
    features: ['Up to 50 leads/month', 'AI lead qualification', 'Email notifications', 'Basic analytics', 'Email support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional Annual',
    price: '$2,868',
    period: '/year',
    description: 'For growing teams & brokerages (billed annually)',
    features: ['Up to 200 leads/month', 'AI lead qualification', 'Auto-assignment', 'CRM integration', 'Advanced analytics', 'Priority support', 'Custom landing pages'],
    cta: 'Select Annual Plan',
    popular: true,
  },
  {
    name: 'Enterprise / One-Time',
    price: 'Custom',
    period: '',
    description: 'One-time setup or custom bulk agreement',
    features: ['Unlimited leads', 'All Professional features', 'Dedicated account manager', 'Custom integrations', 'White-label options', 'API access', 'SLA guarantee', 'Custom reporting'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson', role: 'Broker, Johnson Realty', text: 'Our lead conversion rate increased by 40% in the first month. The AI qualification is incredibly accurate — we now spend time only on leads that matter.', rating: 5 },
  { name: 'Michael Chen', role: 'Team Leader, Chen Group', text: 'The auto-assignment feature alone saves us 15 hours per week. Leads go to the right agent instantly, and response times dropped from hours to minutes.', rating: 5 },
  { name: 'Emily Davis', role: 'Independent Agent', text: 'As a solo agent, this tool is game-changing. I get fewer leads but they are all qualified and ready to act. My close rate has doubled.', rating: 5 },
];

export default function LeadGenerationPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative bg-[#0A2647] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#C9A227] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-[#C9A227] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase mb-4">Lead Generation Service</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">Generate Quality Real Estate Leads</h1>
          <p className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Stop chasing cold leads. Our AI-powered system delivers qualified, ready-to-convert leads directly to your inbox.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-xl hover:bg-[#C9A227]/90 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            Start Free Trial
          </Link>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Powerful Lead Generation Features</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Everything you need to fill your pipeline with qualified leads.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow text-center">
                <div className="w-14 h-14 bg-[#C9A227]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-[#C9A227]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-[#0A2647] text-lg mb-3">{f.title}</h3>
                <p className="font-body text-gray-600 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Pricing Plans</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Choose the plan that fits your business. Upgrade or downgrade anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TIERS.map((tier, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 border-2 transition-shadow ${
                tier.popular
                  ? 'border-[#C9A227] shadow-lg relative'
                  : 'border-gray-100 hover:shadow-md'
              }`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#C9A227] text-[#0A2647] font-heading text-xs font-bold px-4 py-1.5 rounded-full">Most Popular</span>
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="font-heading text-4xl font-bold text-[#0A2647]">{tier.price}</span>
                  <span className="font-body text-gray-500 text-sm">{tier.period}</span>
                </div>
                <p className="font-body text-gray-500 text-sm mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#C9A227] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="font-body text-sm text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.cta === 'Contact Sales' ? '/contact' : '/register'}
                  className={`block text-center w-full font-heading font-semibold py-3 rounded-lg transition-colors ${
                    tier.popular
                      ? 'bg-[#C9A227] text-[#0A2647] hover:bg-[#C9A227]/90'
                      : 'bg-[#0A2647] text-white hover:bg-[#0A2647]/90'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="font-body text-gray-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-heading font-semibold text-[#0A2647] text-sm">{t.name}</p>
                  <p className="font-body text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0A2647]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Ready to Fill Your Pipeline?</h2>
          <p className="font-body text-white/70 text-lg mb-8 max-w-xl mx-auto">Start your free trial today. No credit card required. Cancel anytime.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-xl hover:bg-[#C9A227]/90 transition-colors">
            Start Free Trial
          </Link>
        </div>
      </section>
    </main>
  );
}
