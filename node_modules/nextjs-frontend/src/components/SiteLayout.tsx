"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

// These three render nothing until a scroll/timer/mouseleave event fires, so
// deferring them off the initial bundle (and their framer-motion dependency)
// has no visual effect — same behavior, smaller first-load JS on every page.
const ExitPopup = dynamic(() => import("@/components/ExitPopup"), { ssr: false });
const StickyCTA = dynamic(() => import("@/components/StickyCTA"), { ssr: false });
const BackToTop = dynamic(() => import("@/components/BackToTop"), { ssr: false });

const dashboardPrefixes = [
  "/admin",
  "/agent/dashboard",
  "/buyer/dashboard",
  "/seller/dashboard",
  "/broker/dashboard",
  "/investor/dashboard",
  "/staff/dashboard",
  "/lender/dashboard",
  "/title/dashboard",
  "/super-admin/dashboard",
  "/realtor/dashboard",
  "/dashboard",
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = dashboardPrefixes.some(
    (p) => pathname === p || (pathname && pathname.startsWith(p + "/"))
  );

  if (isDashboard) {
    return <>{children}</>;
  }

  const hasCustomChat =
    pathname === "/" ||
    pathname === "/buyers/first-time" ||
    (pathname && pathname.startsWith("/properties/") && pathname !== "/properties");

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      {!hasCustomChat && <ChatWidgetWrapper />}
      <ExitPopup />
      <StickyCTA />
      <BackToTop />
    </>
  );
}
