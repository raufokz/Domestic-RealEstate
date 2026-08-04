import ContactFormWidget from "@/components/contact/ContactFormWidget";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, contactPageLd, breadcrumbLd } from "@/lib/seo";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export const metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the Domestic Real Estate team for support, partnerships, agent and brokerage inquiries, or press. Reach the right department by email and we'll respond quickly.",
  path: "/contact",
  keywords: [
    "contact domestic real estate",
    "real estate support",
    "agent partnership inquiry",
    "brokerage partnership",
    "real estate customer service",
  ],
});

interface Channel {
  name: string;
  purpose: string;
  email: string;
  icon: string;
}

const channels: Channel[] = [
  {
    name: "General Inquiries",
    purpose: "Questions about the platform, your account, or getting started.",
    email: "info@domesticrealestate.us",
    icon: "💬",
  },
  {
    name: "Administration & Partnerships",
    purpose: "Agent, brokerage, lender, and executive administration inquiries.",
    email: "admin@domesticrealestate.us",
    icon: "🤝",
  },
  {
    name: "Technical Support",
    purpose: "Help with tools, listings, imports, or platform support.",
    email: "info@domesticrealestate.us",
    icon: "🛠️",
  },
  {
    name: "Privacy & Compliance",
    purpose: "Data privacy inquiries, terms, and compliance requests.",
    email: "info@domesticrealestate.us",
    icon: "🔒",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <JsonLd
        data={[
          contactPageLd({ path: "/contact", email: "info@domesticrealestate.us" }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span aria-hidden="true" className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              We're here to help
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white">
            Contact Our Team
          </h1>
          <p className="mt-4 text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-body">
            Questions about buying, selling, investing, or partnering with us? Send a message and the right team will
            get back to you.
          </p>
        </div>
      </section>

      {/* Main Content Grid: Contact channels & form */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact channels */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[#C9A227] font-heading font-bold text-xs uppercase tracking-widest block mb-2">
                Reach the right team
              </span>
              <h2 className="font-heading text-3xl font-bold text-[#0A2647]">Contact Channels</h2>
              <p className="text-slate-600 text-sm mt-2 font-body">
                Prefer email? Message the department that fits your needs and we'll respond promptly during business
                hours (Mon–Fri, 9am–6pm ET).
              </p>
            </div>

            <ul className="space-y-4 font-body">
              {channels.map((c) => (
                <li
                  key={c.email}
                  className="bg-white border border-slate-200 p-5 rounded-2xl shadow-card hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-start gap-4">
                    <span aria-hidden="true" className="text-2xl leading-none mt-0.5">{c.icon}</span>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-base text-[#0A2647]">{c.name}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">{c.purpose}</p>
                      <a
                        href={`mailto:${c.email}`}
                        className="inline-block mt-2 text-sm font-semibold text-[#C9A227] underline break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded"
                      >
                        {c.email}
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Contact Widget */}
          <div className="lg:col-span-7">
            <ContactFormWidget />
          </div>
        </div>
      </section>
      <ChatWidgetWrapper context="contact" leadType="general" />
    </main>
  );
}
