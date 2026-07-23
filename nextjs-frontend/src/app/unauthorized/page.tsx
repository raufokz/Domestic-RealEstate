import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Access Denied",
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#0A2647] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <Logo size="xl" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#0A2647] mb-3">
            Access Denied
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            You don&apos;t have permission to access this page. Please sign in
            with an authorized account or contact support if you believe this is
            an error.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 bg-[#0A2647] hover:bg-[#0d3366] text-white py-3 rounded-lg font-semibold transition text-center"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-semibold transition text-center"
            >
              Go Home
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-xs">
            Need help?{" "}
            <a
              href="mailto:info@domesticrealestate.us"
              className="text-[#C9A227] hover:text-[#b8911f] font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
