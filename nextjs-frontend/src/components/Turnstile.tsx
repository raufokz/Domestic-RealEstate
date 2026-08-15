"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

/**
 * Cloudflare Turnstile spam-protection widget. Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't configured — forms keep working
 * without a CAPTCHA step during rollout rather than breaking submission.
 */
export default function Turnstile({ onVerify, onExpire, className = "" }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerId = useId().replace(/:/g, "");
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!siteKey) return;

    const tryRender = () => {
      if (renderedRef.current || !window.turnstile) return;
      const el = document.getElementById(containerId);
      if (!el) return;
      widgetIdRef.current = window.turnstile.render(el, {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": onExpire,
      });
      renderedRef.current = true;
    };

    tryRender();
    const interval = setInterval(tryRender, 300);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, containerId]);

  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" async defer />
      <div id={containerId} className={className} />
    </>
  );
}
