"use client";

import { useEffect } from "react";
import { incrementBlogView } from "@/lib/blog";

/** Fires the view-count increment once per mount — kept as a tiny client leaf so the post page itself can stay a server component. */
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    incrementBlogView(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}
