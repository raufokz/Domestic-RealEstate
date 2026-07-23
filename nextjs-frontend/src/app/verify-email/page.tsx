"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const email =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("email") || ""
      : "";

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to resend verification email");
      }
      setResent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A2647] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <Logo size="xl" />
          </Link>
          <h1 className="text-3xl font-bold text-white">
            Verify Your Email
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-[#C9A227]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 19l6.75 4.5M21 19l-6.75 4.5"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-[#0A2647] mb-2">
            Check Your Inbox
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            We&apos;ve sent a verification link to
          </p>
          {email && (
            <p className="text-[#0A2647] font-semibold text-sm mb-6 bg-slate-50 rounded-lg px-4 py-2">
              {email}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {resent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
              Verification email resent! Check your inbox.
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full bg-[#0A2647] hover:bg-[#0d3366] text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-4">
            <p className="text-amber-700 text-xs">
              Didn&apos;t receive the email? Check your{" "}
              <strong>spam/junk folder</strong> or try a different email address.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
