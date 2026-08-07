"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Real partner/brokerage logo strip built from /public/companies-logos.
 * Replaces the former text-only "Featured In CBS/Forbes/…" bar.
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
    <section
      className="py-12 bg-[#07162C] text-white border-y border-[#C9A227]/30 relative overflow-hidden shadow-2xl"
      aria-label="Partner brokerages and teams"
    >
      {/* Background Gold Glow Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[120px] bg-[#C9A227]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="bg-[#C9A227] text-[#0A2647] text-[10px] font-black uppercase px-3 py-1 rounded-full font-mono tracking-wider shadow font-bold">
                Industry Network
              </span>
              <span className="text-xs font-bold text-slate-300">
                • 1,200+ Active Verified Brokerages
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
              Trusted by Top Brokerages & Teams Across North America
            </h3>
          </div>
        </div>

        {/* Infinite Marquee Logo Strip */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Gradient Edge Fade */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 z-10 pointer-events-none bg-gradient-to-r from-[#07162C] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 z-10 pointer-events-none bg-gradient-to-l from-[#07162C] to-transparent" />

          <div className="flex animate-marquee gap-8 py-2">
            {/* First list of logos */}
            <div className="flex shrink-0 items-center justify-around gap-8 min-w-full">
              {LOGOS.map((logo, idx) => (
                <div
                  key={`${logo.src}-1-${idx}`}
                  className="flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15 hover:bg-white/20 hover:border-[#C9A227]/60 shadow-lg transition-all duration-300"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    title={logo.alt}
                    className="h-9 sm:h-11 w-auto max-w-[120px] sm:max-w-[140px] object-contain brightness-125 opacity-90 hover:opacity-100 hover:scale-110 transition duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Second list of logos for smooth infinite marquee */}
            <div className="flex shrink-0 items-center justify-around gap-8 min-w-full" aria-hidden="true">
              {LOGOS.map((logo, idx) => (
                <div
                  key={`${logo.src}-2-${idx}`}
                  className="flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15 hover:bg-white/20 hover:border-[#C9A227]/60 shadow-lg transition-all duration-300"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    title={logo.alt}
                    className="h-9 sm:h-11 w-auto max-w-[120px] sm:max-w-[140px] object-contain brightness-125 opacity-90 hover:opacity-100 hover:scale-110 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Trust Metrics Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div>
            <span className="text-[#C9A227] font-black font-mono text-sm block">1,200+</span>
            <span className="text-slate-300 font-medium">Partner Brokerages</span>
          </div>
          <div>
            <span className="text-[#C9A227] font-black font-mono text-sm block">50 States</span>
            <span className="text-slate-300 font-medium">Nationwide Coverage</span>
          </div>
          <div>
            <span className="text-[#C9A227] font-black font-mono text-sm block">$4.8B+</span>
            <span className="text-slate-300 font-medium">Annual Deal Volume</span>
          </div>
          <div>
            <span className="text-[#C9A227] font-black font-mono text-sm block">99.8%</span>
            <span className="text-slate-300 font-medium">Verified Data Accuracy</span>
          </div>
        </div>

      </div>
    </section>
  );
}

