import type { Metadata } from 'next';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Get Started as a Wholesaler | Domestic Real Estate',
  description: 'Start wholesaling with Domestic Real Estate in 3 simple steps. Submit deals, connect with buyers, and close faster.',
};

export default function GetStartedPage() {
  const steps = [
    {
      step: '01',
      title: 'Create Your Account',
      description: 'Sign up for a free wholesaler account and get access to our deal submission platform and buyer network.',
    },
    {
      step: '02',
      title: 'Submit Your Deal',
      description: 'Enter property details including address, asking price, ARV, and repair estimates. Our team reviews within 24 hours.',
    },
    {
      step: '03',
      title: 'Connect & Close',
      description: 'We match your deal with pre-qualified buyers, facilitate showings, and handle the closing process from start to finish.',
    },
  ];

  return (
    <main>
      <PageHero
        badge="Get Started"
        title="Get Started as a Wholesaler"
        subtitle="Launch your wholesaling business with Domestic Real Estate in three straightforward steps."
      />
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0 w-16 h-16 bg-[#C9A227] rounded-2xl flex items-center justify-center">
                  <span className="font-heading text-2xl font-bold text-[#0A2647]">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-[#0A2647] mb-3">{s.title}</h3>
                  <p className="font-body text-gray-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection
        title="Ready to Start Wholesaling?"
        subtitle="Create your account today and submit your first deal in minutes."
        primaryAction={{ label: 'Create Account', href: '/wholesalers/get-started' }}
        secondaryAction={{ label: 'Submit a Deal', href: '/wholesalers/submit-deal' }}
      />
    </main>
  );
}
