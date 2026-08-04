"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  /** Visual size preset */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Dark background variant (inverts text; img stays the same) */
  dark?: boolean;
  /** Extra wrapper classes */
  className?: string;
  /** Wrap in a link (default: false) */
  href?: string;
}

/**
 * Domestic Real Estate logo.
 *
 * Size map  →  img height (Tailwind):
 *   xs  → h-7   (28px)  – tiny sidebar collapsed
 *   sm  → h-9   (36px)  – compact nav
 *   md  → h-11  (44px)  – dashboard sidebars
 *   lg  → h-12  (48px)  – main site header  ← was "lg=h-20" (too big)
 *   xl  → h-14  (56px)  – footer brand block ← was "xl=h-24" (too big)
 */
const HEIGHT: Record<NonNullable<LogoProps["size"]>, string> = {
  xs: "h-7",
  sm: "h-9",
  md: "h-11",
  lg: "h-12",
  xl: "h-14",
};

export default function Logo({
  size = "md",
  dark = false,
  className = "",
  href,
}: LogoProps) {
  const h = HEIGHT[size];

  const img = (
    /* flex + items-center keeps the image vertically centred inside any flex parent */
    <span className={`inline-flex items-center flex-shrink-0 ${className}`}>
      <Image
        src="/Domestic-logo.png"
        alt="Domestic Real Estate"
        width={220}
        height={56}
        className={`${h} w-auto object-contain select-none ${dark ? "brightness-0 invert" : ""}`}
        style={{ maxWidth: "220px" }}
        draggable={false}
        priority
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="Domestic Real Estate – home">
        {img}
      </Link>
    );
  }

  return img;
}
