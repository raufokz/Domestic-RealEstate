"use client";

import { useEffect } from "react";

export default function ExtensionCleanup() {
  useEffect(() => {
    // Clean up browser extension attributes that cause hydration mismatches
    const cleanupExtensionAttributes = () => {
      const extensionAttrs = [
        'bis_skin_checked',
        'bis_register',
        '__processed_74baf5bd-41ca-4f91-a6be-c45ab0b5078b__',
      ];
      
      extensionAttrs.forEach(attr => {
        document.querySelectorAll(`[${attr}]`).forEach(el => {
          el.removeAttribute(attr);
        });
      });

      // Fix script tags modified by extensions
      document.querySelectorAll('script[type="text/javascript"][data-dynamic-id]').forEach(script => {
        if (script.getAttribute('data-dynamic-id')?.includes('eppiocemhmnlbhjplcgkofciiegomcon')) {
          script.remove(); // Remove extension-injected scripts
        }
      });
    };

    // Run cleanup after hydration
    cleanupExtensionAttributes();

    // Also watch for future injections
    const observer = new MutationObserver(() => {
      cleanupExtensionAttributes();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['bis_skin_checked', 'bis_register', '__processed_74baf5bd-41ca-4f91-a6be-c45ab0b5078b__'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
