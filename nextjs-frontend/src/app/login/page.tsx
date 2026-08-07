"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiPost, setToken } from "@/lib/api";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { notifyError, success } = useToast();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const safeReturnTo = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;

  const handleQuickFill = (role: "admin" | "agent" | "buyer") => {
    if (role === "admin") {
      setEmail("admin@domesticrealestate.us");
      setPassword("Admin@123456");
    } else if (role === "agent") {
      setEmail("agent@domesticrealestate.us");
      setPassword("Agent@123456");
    } else {
      setEmail("buyer@domesticrealestate.us");
      setPassword("Buyer@123456");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ user: { role: string; name?: string }; token: string }>("/auth/login", { email, password });
      setToken(res.token);
      success(`Welcome back! Logged in successfully.`, "Sign In Complete");
      const role = res.user.role;
      setTimeout(() => {
        if (safeReturnTo) {
          window.location.href = safeReturnTo;
        } else if (role === "super_admin" || role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = `/${role}/dashboard`;
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(msg);
      notifyError(err, "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A2647] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#C9A227] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="mx-auto mb-8 flex justify-center">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Domestic Real Estate
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Your trusted partner in finding the perfect property. Premium real
            estate services tailored to your needs.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-[#C9A227]">2,500+</p>
              <p className="text-slate-400 text-sm mt-1">Properties</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#C9A227]">850+</p>
              <p className="text-slate-400 text-sm mt-1">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#C9A227]">150+</p>
              <p className="text-slate-400 text-sm mt-1">Agents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Logo size="sm" />
            <span className="text-[#0A2647] font-bold text-lg">
              Domestic RE
            </span>
          </div>

          <h2 className="text-3xl font-bold text-[#0A2647]">Welcome back</h2>
          <p className="text-slate-500 mt-2 mb-6">
            {process.env.NODE_ENV !== "production"
              ? "Sign in to your account to continue or select a demo role below."
              : "Sign in to your account to continue."}
          </p>

          {/* Quick Fill Helper */}
          {process.env.NODE_ENV !== "production" && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Demo Autofill
                </span>
                <span className="text-[11px] text-amber-700">1-click test credentials</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin")}
                  className="py-1.5 px-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-950 font-semibold text-xs rounded-lg transition shadow-sm"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("agent")}
                  className="py-1.5 px-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-950 font-semibold text-xs rounded-lg transition shadow-sm"
                >
                  Agent
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("buyer")}
                  className="py-1.5 px-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-950 font-semibold text-xs rounded-lg transition shadow-sm"
                >
                  Buyer
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#C9A227] focus:ring-[#C9A227]"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#C9A227] hover:text-[#b8911f] font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2647] hover:bg-[#0d3366] text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-8 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#C9A227] hover:text-[#b8911f] font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

