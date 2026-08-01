import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHero, FeaturesSection, CTASection } from "@/components/ui/PageTemplate";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Newsletter",
  description: "Subscribe to our newsletter for exclusive market insights, new property alerts, and real estate investment tips.",
  path: "/newsletter",
  keywords: ["real estate newsletter", "market insights", "property alerts", "investment tips"],
});

const features = [
  { icon: "email", title: "Weekly Market Updates", description: "Get the latest market trends, price movements, and inventory updates delivered to your inbox every week." },
  { icon: "tech", title: "Expert Insights", description: "Exclusive articles and tips from our top agents on buying, selling, and investing strategies." },
  { icon: "leads", title: "Exclusive Listings", description: "Be the first to know about new properties, coming-soon listings, and off-market opportunities." },
  { icon: "events", title: "Educational Content", description: "In-depth guides, market reports, and resources to help you make smarter real estate decisions." },
  { icon: "social", title: "Special Offers", description: "Subscriber-only promotions, event invitations, and partnerships with home service providers." },
  { icon: "construction", title: "Neighborhood Spotlights", description: "Discover new neighborhoods, local businesses, and community insights in your target areas." },
];

export default function NewsletterPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Newsletter" title="Stay Informed" subtitle="Join our community of readers who get expert real estate insights delivered weekly." />

      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterForm />
        </div>
      </section>

      <FeaturesSection
        title="What You'll Get"
        subtitle="High-quality content designed to help you make informed real estate decisions."
        features={features}
        columns={3}
      />
      <CTASection
        title="Have Questions?"
        subtitle="Our team is always happy to help with any real estate questions you may have."
        primaryAction={{ label: "Contact Us", href: "/contact" }}
        secondaryAction={{ label: "Explore Our Blog", href: "/blog" }}
      />
    </main>
  );
}
