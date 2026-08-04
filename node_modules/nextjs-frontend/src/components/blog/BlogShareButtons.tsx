"use client";

import { useState } from "react";

export default function BlogShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Share on X",
      icon: "𝕏",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Share on Facebook",
      icon: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Share on LinkedIn",
      icon: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Share via Email",
      icon: "✉",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fall through, link stays visible for manual copy.
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" aria-label="Share this article">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Share</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          title={link.label}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-[#0A2647] text-sm font-bold hover:bg-[#0A2647] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
        >
          {link.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        title="Copy link"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-[#0A2647] text-sm hover:bg-[#0A2647] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
      >
        {copied ? "✓" : "🔗"}
      </button>
      {copied && <span className="text-xs text-emerald-600 font-medium">Link copied!</span>}
    </div>
  );
}
