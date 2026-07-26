import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

const helpfulLinks = [
  { label: 'Browse Properties', href: '/properties' },
  { label: 'Home Valuation', href: '/sellers/home-valuation' },
  { label: 'Buyer Services', href: '/buyers' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Sitemap', href: '/sitemap' },
];

export default function NotFound() {
  return (
    <main className="bg-[#0A2647] min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-2xl">
        <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase mb-4">
          404 Error
        </p>
        <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6">
          Page Not Found
        </h1>
        <p className="font-body text-white/70 text-lg mb-10">
          The page you are looking for doesn&apos;t exist or has moved. Here are some helpful places
          to pick up where you left off.
        </p>

        <div className="flex justify-center mb-10">
          <Link
            href="/"
            className="inline-block bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Return to Home
          </Link>
        </div>

        <nav aria-label="Helpful links">
          <ul className="flex flex-wrap justify-center gap-3">
            {helpfulLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-block border border-white/25 text-white/90 text-sm px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
