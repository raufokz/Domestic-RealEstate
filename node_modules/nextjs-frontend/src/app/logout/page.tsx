"use client";

import { useEffect } from "react";
import Logo from "@/components/Logo";

export default function LogoutPage() {
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A2647] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <Logo size="lg" />
          </div>

          <div className="mb-6">
            <svg
              className="w-12 h-12 text-[#C9A227] mx-auto animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#0A2647] mb-2">
            Signing you out...
          </h1>
          <p className="text-slate-500 text-sm">
            You are being securely logged out. You&apos;ll be redirected to the
            sign in page shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
