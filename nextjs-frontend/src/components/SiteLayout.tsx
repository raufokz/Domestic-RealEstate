"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";
import ExitPopup from "@/components/ExitPopup";
import StickyCTA from "@/components/StickyCTA";
import BackToTop from "@/components/BackToTop";

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
      <main>{children}</main>
      <Footer />
      {!hasCustomChat && <ChatWidgetWrapper />}
      <ExitPopup />
      <StickyCTA />
      <BackToTop />
    </>
  );
}
