"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function EmailVerificationNoticePage() {
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
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
            Verification Required
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-blue-600"
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
            Verify Your Email Address
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Thanks for creating an account! We&apos;ve sent a verification link to
            your email address. Please click the link in the email to activate
            your account.
          </p>

          {resent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
              Verification email sent! Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
                  Resend to a different email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={resending}
                className="w-full bg-[#0A2647] hover:bg-[#0d3366] text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200">
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-[#0A2647] font-medium transition"
            >
              Already verified? Sign in
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
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
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
