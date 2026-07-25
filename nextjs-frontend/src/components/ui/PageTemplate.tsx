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
                <span className="text-2xl">{f.icon}</span>
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
