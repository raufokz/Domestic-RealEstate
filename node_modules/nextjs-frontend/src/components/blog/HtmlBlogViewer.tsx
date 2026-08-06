"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import "./html-blog-viewer.css";

export interface HtmlBlogViewerProps {
  content?: string | null;
  className?: string;
  enableLightbox?: boolean;
  showCodeCopy?: boolean;
}

const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "div",
  "span",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
  "picture",
  "figure",
  "figcaption",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "blockquote",
  "pre",
  "code",
  "iframe",
  "hr",
  "br",
  "mark",
  "sub",
  "sup",
  "del",
  "ins",
  "s",
  "summary",
  "details",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "class",
  "id",
  "align",
  "style",
  "loading",
  "frameborder",
  "allow",
  "allowfullscreen",
];

const TRUSTED_IFRAME_DOMAINS = [
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "vimeo.com",
  "player.vimeo.com",
];

function isTrustedIframeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr, "https://domesticrealestate.us");
    return TRUSTED_IFRAME_DOMAINS.some(
      (domain) => url.hostname === domain || url.hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Custom sanitizer & DOM post-processor:
 * 1. Sanitizes raw HTML using DOMPurify.
 * 2. Adds target="_blank" and rel="noopener noreferrer" to external links.
 * 3. Wraps <table> in responsive scrolling wrappers.
 * 4. Wraps trusted <iframe> embeds in 16:9 responsive containers.
 * 5. Adds loading="lazy" and decoding="async" to images.
 */
function sanitizeAndTransformHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  // 1. DOMPurify pass
  const clean = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ["target", "rel", "loading", "decoding"],
    ALLOW_DATA_ATTR: false,
  });

  if (typeof window === "undefined") {
    // Basic string-based regex transformations for SSR fallback
    return clean
      .replace(/<table([\s\S]*?)<\/table>/gi, '<div class="blog-viewer-table-wrapper"><table$1</table></div>')
      .replace(/<iframe([\s\S]*?)src=["']([^"']+)["']([\s\S]*?)<\/iframe>/gi, (match, before, src) => {
        if (isTrustedIframeUrl(src)) {
          return `<div class="blog-viewer-iframe-wrapper"><iframe${before}src="${src}" allowfullscreen></iframe></div>`;
        }
        return "";
      })
      .replace(/<a\s+([^>]*href=["'](https?:\/\/[^"']+)["'][^>]*)>/gi, (match, inner, url) => {
        if (!url.includes("domesticrealestate.us")) {
          let updated = match;
          if (!/rel=["']/.test(updated)) updated = updated.replace("<a ", '<a rel="noopener noreferrer" ');
          if (!/target=["']/.test(updated)) updated = updated.replace("<a ", '<a target="_blank" ');
          return updated;
        }
        return match;
      });
  }

  // 2. Client DOM parser for precision transformations
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, "text/html");

    // Process Links
    const links = doc.querySelectorAll("a");
    links.forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("http://") || href.startsWith("https://")) {
        try {
          const url = new URL(href);
          if (url.hostname !== window.location.hostname && !url.hostname.includes("domesticrealestate.us")) {
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener noreferrer");
          }
        } catch {
          // ignore invalid URLs
        }
      }
    });

    // Process Images
    const imgs = doc.querySelectorAll("img");
    imgs.forEach((img) => {
      if (!img.getAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      img.setAttribute("decoding", "async");
    });

    // Process iFrames
    const iframes = doc.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      const src = iframe.getAttribute("src") || "";
      if (!isTrustedIframeUrl(src)) {
        iframe.remove();
      } else {
        const parent = iframe.parentElement;
        if (!parent?.classList.contains("blog-viewer-iframe-wrapper")) {
          const wrapper = doc.createElement("div");
          wrapper.className = "blog-viewer-iframe-wrapper";
          iframe.parentNode?.insertBefore(wrapper, iframe);
          wrapper.appendChild(iframe);
        }
      }
    });

    // Process Tables
    const tables = doc.querySelectorAll("table");
    tables.forEach((table) => {
      const parent = table.parentElement;
      if (!parent?.classList.contains("blog-viewer-table-wrapper")) {
        const wrapper = doc.createElement("div");
        wrapper.className = "blog-viewer-table-wrapper";
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });

    return doc.body.innerHTML;
  } catch {
    return clean;
  }
}

export default function HtmlBlogViewer({
  content,
  className = "",
  enableLightbox = true,
  showCodeCopy = true,
}: HtmlBlogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Sanitize on content change
  const processedHtml = useMemo(() => sanitizeAndTransformHtml(content || ""), [content]);

  useEffect(() => {
    setSanitizedHtml(processedHtml);
  }, [processedHtml]);

  // Handle image lightbox clicks & code copy buttons post-render
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Attach Lightbox click handlers to images
    const images = el.querySelectorAll("img");
    const imageClickHandlers: Array<{ img: HTMLImageElement; handler: (e: MouseEvent) => void }> = [];

    if (enableLightbox) {
      images.forEach((img) => {
        const handler = (e: MouseEvent) => {
          e.preventDefault();
          setLightboxImg({
            src: img.src,
            alt: img.alt || img.getAttribute("title") || "Article image",
          });
        };
        img.addEventListener("click", handler);
        imageClickHandlers.push({ img, handler });
      });
    }

    // Attach copy buttons to <pre> code blocks
    const preBlocks = el.querySelectorAll("pre");
    preBlocks.forEach((pre, idx) => {
      // Check if wrapper already has button
      let parent = pre.parentElement;
      if (!parent?.classList.contains("blog-viewer-code-block-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "blog-viewer-code-block-wrapper";
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        if (showCodeCopy) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "blog-viewer-copy-btn";
          btn.innerText = copiedCodeIndex === idx ? "Copied!" : "Copy";
          btn.onclick = () => {
            const codeText = pre.innerText || pre.textContent || "";
            navigator.clipboard.writeText(codeText).then(() => {
              setCopiedCodeIndex(idx);
              btn.innerText = "Copied!";
              setTimeout(() => {
                setCopiedCodeIndex(null);
                btn.innerText = "Copy";
              }, 2000);
            });
          };
          wrapper.appendChild(btn);
        }
      }
    });

    return () => {
      imageClickHandlers.forEach(({ img, handler }) => {
        img.removeEventListener("click", handler);
      });
    };
  }, [sanitizedHtml, enableLightbox, showCodeCopy, copiedCodeIndex]);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxImg) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImg(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImg]);

  if (!content || !content.trim()) {
    return (
      <div className={`blog-viewer-wrapper ${className}`}>
        <p className="text-slate-400 italic text-sm py-4">No content to display.</p>
      </div>
    );
  }

  return (
    <div className={`blog-viewer-wrapper ${className}`}>
      <div
        ref={containerRef}
        className="blog-viewer-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />

      {/* Lightbox Modal */}
      {enableLightbox && lightboxImg && (
        <div
          className="blog-viewer-lightbox"
          onClick={() => setLightboxImg(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            className="blog-viewer-lightbox-close"
            onClick={() => setLightboxImg(null)}
            aria-label="Close modal"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg.src}
            alt={lightboxImg.alt}
            className="blog-viewer-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxImg.alt && (
            <p className="blog-viewer-lightbox-caption" onClick={(e) => e.stopPropagation()}>
              {lightboxImg.alt}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
