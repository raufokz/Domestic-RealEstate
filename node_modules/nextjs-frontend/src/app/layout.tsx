import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import SiteLayout from "@/components/SiteLayout";
import ExtensionCleanup from "@/components/ExtensionCleanup";

import { ToastProvider } from "@/components/Toast";
import SkipToContent from "@/components/SkipToContent";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Domestic Real Estate | Your Key to Home",
    template: "%s | Domestic Real Estate",
  },
  description:
    "The premium AI-powered real estate platform for buying, selling, and investing in properties across the US & Canada. Find your dream home with intelligent search, market analytics, and expert agent guidance.",
  keywords: [
    "real estate",
    "domestic properties",
    "buy home",
    "sell property",
    "real estate investment",
    "property search",
    "AI real estate",
    "premium homes",
    "residential properties",
    "commercial real estate",
    "home valuation",
    "real estate agent",
    "property listing",
    "first time home buyer",
  ],
  authors: [{ name: "Domestic Real Estate" }],
  creator: "Domestic Real Estate",
  publisher: "Domestic Real Estate",
  metadataBase: new URL("https://domesticrealestate.us"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://domesticrealestate.us",
    siteName: "Domestic Real Estate",
    title: "Domestic Real Estate | Your Key to Home",
    description:
      "The premium AI-powered real estate platform. Buy, sell, and invest in properties across the US & Canada with intelligent search and expert guidance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Domestic Real Estate — Your Key to Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Domestic Real Estate | Your Key to Home",
    description:
      "The premium AI-powered real estate platform. Buy, sell, and invest in properties across the US & Canada.",
    images: ["/og-image.png"],
    creator: "@domesticrealestate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon-re.ico",
    shortcut: "/favicon-re.ico",
    apple: "/Domestic-logo.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "qbZTuhuvcr5vDJ_QcIlUwv2wiFIdyYJCOPSpaW3OTWE",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Domestic Real Estate",
  alternateName: "DomesticRE",
  url: "https://domesticrealestate.us",
  logo: "https://domesticrealestate.us/Domestic-logo.png",
  description:
    "The premium AI-powered real estate platform for buying, selling, and investing in properties across the US & Canada.",
  email: "info@domesticrealestate.us",
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
  },
  sameAs: [
    "https://facebook.com/domesticrealestate",
    "https://twitter.com/domesticrealestate",
    "https://linkedin.com/company/domesticrealestate",
    "https://instagram.com/domesticrealestate",
  ],
  priceRange: "$$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var o=new MutationObserver(function(m){m.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType===1){n.removeAttribute('bis_skin_checked');n.removeAttribute('bis_cpl');n.removeAttribute('bis_mode');n.querySelectorAll&&n.querySelectorAll('[bis_skin_checked],[bis_cpl],[bis_mode]').forEach(function(el){el.removeAttribute('bis_skin_checked');el.removeAttribute('bis_cpl');el.removeAttribute('bis_mode')})}})})});o.observe(document.documentElement,{childList:true,subtree:true})})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="font-body antialiased min-h-screen bg-white text-navy" suppressHydrationWarning>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xtbl7q2jw8");
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2WFG3NGHF9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2WFG3NGHF9');
          `}
        </Script>
        <ExtensionCleanup />
        <ToastProvider>
          <SkipToContent />
          <SiteLayout>{children}</SiteLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
