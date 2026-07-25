import Image from "next/image";

/**
 * Real partner/brokerage logo strip built from /public/companies-logos.
 * Replaces the former text-only "Featured In CBS/Forbes/…" bar, which was an
 * unsubstantiated media claim. Every entry here is an actual asset on disk.
 *
 * ssss.png is deliberately excluded — it is a multi-variant design sheet of
 * the same Sheldon Coxford logo that SHELDON.png provides cleanly.
 */
const LOGOS: { src: string; alt: string; width: number; height: number }[] = [
  { src: "/companies-logos/BHHS-logo-150x150.png", alt: "Berkshire Hathaway HomeServices", width: 60, height: 60 },
  { src: "/companies-logos/sotheby-logo-150x150.png", alt: "Sotheby's International Realty", width: 60, height: 60 },
  { src: "/companies-logos/CB-realty-150x150.png", alt: "Coldwell Banker Realty", width: 60, height: 60 },
  { src: "/companies-logos/exp-realty-150x150.jpg", alt: "eXp Realty", width: 60, height: 60 },
  { src: "/companies-logos/BHG-logo-150x150.png", alt: "Better Homes and Gardens Real Estate", width: 60, height: 60 },
  { src: "/companies-logos/best-american-homes-150x150.jpg", alt: "Best American Homes", width: 60, height: 60 },
  { src: "/companies-logos/california-re-150x150.png", alt: "California Real Estate", width: 60, height: 60 },
  { src: "/companies-logos/ny-realty-150x150.png", alt: "New York Realty", width: 60, height: 60 },
  { src: "/companies-logos/Dallas-RE-150x150.png", alt: "Dallas Real Estate", width: 60, height: 60 },
  { src: "/companies-logos/Nevada-Re-e1742235865385-150x150.jpg", alt: "Nevada Real Estate", width: 60, height: 60 },
  { src: "/companies-logos/boca-real-estate-300x137.png", alt: "Boca Real Estate", width: 130, height: 60 },
  { src: "/companies-logos/rhodes-realty-150x150.png", alt: "Rhodes Realty", width: 60, height: 60 },
  { src: "/companies-logos/SS-realty-150x150.png", alt: "SS Realty", width: 60, height: 60 },
  { src: "/companies-logos/Zopfteam-silvia-300x189.png", alt: "Zopf Team Real Estate", width: 95, height: 60 },
  { src: "/companies-logos/SHELDON.png", alt: "Sheldon Coxford Vancouver Real Estate", width: 110, height: 60 },
];

export default function CompanyLogos() {
  return (
    <section className="py-10 bg-white border-y border-slate-200 overflow-hidden" aria-label="Partner brokerages and teams">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-slate-600 font-extrabold mb-6 px-4">
          Trusted by Brokerages &amp; Teams Across North America
        </p>
        <div className="relative w-full overflow-hidden">
          {/* Gradient Masks */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-marquee gap-16 py-2">
            {/* First list of logos */}
            <div className="flex shrink-0 items-center justify-around gap-16 min-w-full">
              {LOGOS.map((logo, idx) => (
                <div key={`${logo.src}-1-${idx}`} className="flex items-center">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    title={logo.alt}
                    className="h-10 sm:h-12 w-auto max-w-[120px] sm:max-w-[150px] object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-300"
                  />
                </div>
              ))}
            </div>
            
            {/* Second list of logos for infinite scrolling effect */}
            <div className="flex shrink-0 items-center justify-around gap-16 min-w-full" aria-hidden="true">
              {LOGOS.map((logo, idx) => (
                <div key={`${logo.src}-2-${idx}`} className="flex items-center">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    title={logo.alt}
                    className="h-10 sm:h-12 w-auto max-w-[120px] sm:max-w-[150px] object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
