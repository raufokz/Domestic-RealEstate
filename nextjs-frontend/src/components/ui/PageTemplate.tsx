import type { Metadata } from 'next';
import Link from 'next/link';
import ChatWidgetWrapper from '@/components/ai/ChatWidgetWrapper';

interface PageHeroProps {
  badge: string;
  title: string;
  subtitle: string;
  bg?: 'navy' | 'burgundy' | 'gold' | 'dark';
}

export function PageHero({ badge, title, subtitle, bg = 'navy' }: PageHeroProps) {
  const bgColors = {
    navy: 'bg-[#0A2647]',
    burgundy: 'bg-[#8B1E3F]',
    gold: 'bg-gradient-to-br from-[#0A2647] to-[#0d3366]',
    dark: 'bg-[#051324]',
  };
  return (
    <section className={`relative ${bgColors[bg]} text-white py-24 md:py-32`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase mb-4">{badge}</p>
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">{title}</h1>
        <p className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  href?: string;
}

interface FeaturesSectionProps {
  title: string;
  subtitle?: string;
  features: FeatureCard[];
  columns?: 2 | 3 | 4;
}

export function renderIcon(iconName: string) {
  const icons: Record<string, React.ReactNode> = {
    leads: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tech: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    brand: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    growth: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    shield: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    globe: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    distressed: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    foreclosure: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    rental: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-3.418-4.418A3 3 0 1112.582 7H13a2 2 0 012 2v3.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 01-1.414 0L3.293 16.12a1 1 0 010-1.414l6.414-6.414A1 1 0 0110.414 8h3.172v.005z" />
      </svg>
    ),
    construction: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
      </svg>
    ),
    multifamily: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    land: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    mls: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10M9 21V9a1 1 0 011-1h4a1 1 0 011 1v12" />
      </svg>
    ),
    social: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l8.163-4.081M8.684 13.258l8.163 4.081m-8.163-4.081a3 3 0 110-3.354m0 3.354a3 3 0 010-3.354m12 0a3 3 0 110-3.354M19 12a3 3 0 110 6 3 3 0 010-6z" />
      </svg>
    ),
    video: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    email: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    search: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    events: (
      <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  };
  return icons[iconName] || <span className="text-xl">{iconName}</span>;
}

export function FeaturesSection({ title, subtitle, features, columns = 3 }: FeaturesSectionProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3';
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">{title}</h2>
          {subtitle && <p className="font-body text-gray-600 max-w-xl mx-auto">{subtitle}</p>}
        </div>
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow group">
              <div className="w-12 h-12 bg-[#0A2647]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#C9A227]/20 transition-colors">
                {renderIcon(f.icon)}
              </div>
              <h3 className="font-heading text-lg font-bold text-[#0A2647] mb-3">{f.title}</h3>
              <p className="font-body text-gray-600 text-sm leading-relaxed">{f.description}</p>
              {f.href && (
                <Link href={f.href} className="inline-flex items-center gap-1 text-[#C9A227] font-heading font-semibold text-sm mt-4 hover:gap-2 transition-all">
                  Learn More <span>→</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  bg?: 'navy' | 'burgundy';
}

export function CTASection({ title, subtitle, primaryAction, secondaryAction, bg = 'navy' }: CTASectionProps) {
  return (
    <section className={`py-20 md:py-24 ${bg === 'burgundy' ? 'bg-[#8B1E3F]' : 'bg-[#0A2647]'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="font-body text-white/80 text-lg mb-10 max-w-2xl mx-auto">{subtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={primaryAction.href} className="bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors">
            {primaryAction.label}
          </Link>
          {secondaryAction && (
            <Link href={secondaryAction.href} className="border border-white/30 text-white font-heading font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

interface StatItem {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats: StatItem[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="py-16 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647]">{s.value}</p>
              <p className="font-body text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
}

interface TestimonialsSectionProps {
  title?: string;
  testimonials: TestimonialItem[];
}

export function TestimonialsSection({ title = 'What Our Clients Say', testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-20 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-5 h-5 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="font-body text-gray-600 italic mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-heading font-semibold text-[#0A2647]">{t.name}</p>
                <p className="font-body text-gray-500 text-sm">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
}

export function FAQSection({ title = 'Frequently Asked Questions', faqs }: FAQSectionProps) {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">{title}</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-heading font-medium text-[#0A2647] hover:bg-gray-50 transition-colors">
                <span className="pr-4">{faq.question}</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5">
                <p className="font-body text-gray-600 leading-relaxed text-sm">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-8">{title}</h2>
        <div className="prose prose-lg max-w-none font-body text-gray-700 leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}
