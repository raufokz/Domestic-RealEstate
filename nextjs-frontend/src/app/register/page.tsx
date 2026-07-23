"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const ROLES = [
  {
    id: "buyer",
    title: "Buyer",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    description: "Find your dream home",
  },
  {
    id: "seller",
    title: "Seller",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Sell your property fast",
  },
  {
    id: "agent",
    title: "Agent",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    description: "Grow your client base",
  },
  {
    id: "broker",
    title: "Broker",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: "Manage your brokerage",
  },
  {
    id: "investor",
    title: "Investor",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    description: "Maximize your ROI",
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const [form, setForm] = useState({
    role: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    brokerage: "",
    budgetMin: "",
    budgetMax: "",
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return form.role !== "";
    if (step === 2)
      return (
        form.firstName &&
        form.lastName &&
        form.email &&
        form.phone &&
        form.password &&
        form.confirmPassword &&
        form.password === form.confirmPassword
      );
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const { apiPost } = await import("@/lib/api");
      await apiPost("/auth/register", form);
      setRegistered(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 19l6.75 4.5M21 19l-6.75 4.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0A2647] mb-3">
            Check Your Email
          </h2>
          <p className="text-slate-500 mb-8">
            We&apos;ve sent a verification link to <strong>{form.email}</strong>.
            Please check your inbox and click the link to verify your account.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#0A2647] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0d3366] transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0A2647] py-6">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <Logo size="sm" />
            <span className="text-white font-bold text-lg">
              Domestic Real Estate
            </span>
          </Link>

          <div className="flex items-center justify-between mb-4">
            {["Role", "Personal Info", "Details", "Verify"].map((label, i) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > i + 1
                      ? "bg-[#C9A227] text-[#0A2647]"
                      : step === i + 1
                      ? "bg-white text-[#0A2647]"
                      : "bg-slate-600 text-slate-300"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span
                  className={`ml-2 text-sm hidden sm:inline ${
                    step >= i + 1 ? "text-white" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
                {i < 3 && (
                  <div
                    className={`w-12 sm:w-20 h-0.5 mx-3 ${
                      step > i + 1 ? "bg-[#C9A227]" : "bg-slate-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-[#0A2647] mb-2">
              Select Your Role
            </h2>
            <p className="text-slate-500 mb-8">
              Choose the role that best describes you
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => updateForm("role", role.id)}
                  className={`p-6 rounded-xl border-2 text-left transition hover:shadow-lg ${
                    form.role === role.id
                      ? "border-[#C9A227] bg-[#C9A227]/5 shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`mb-3 ${
                      form.role === role.id
                        ? "text-[#C9A227]"
                        : "text-slate-400"
                    }`}
                  >
                    {role.icon}
                  </div>
                  <h3 className="font-bold text-[#0A2647] text-lg">
                    {role.title}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {role.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-[#0A2647] mb-2">
              Personal Information
            </h2>
            <p className="text-slate-500 mb-8">
              Tell us about yourself
            </p>
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="reg-first-name"
                    name="first_name"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="reg-last-name"
                    name="last_name"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="reg-phone"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    id="reg-password"
                    name="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="reg-confirm"
                    name="confirm_password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateForm("confirmPassword", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                  />
                </div>
              </div>
              {form.password &&
                form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    Passwords do not match
                  </p>
                )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-[#0A2647] mb-2">
              {form.role === "agent" || form.role === "broker"
                ? "Professional Information"
                : form.role === "buyer" || form.role === "investor"
                ? "Preferences"
                : "Additional Details"}
            </h2>
            <p className="text-slate-500 mb-8">
              Help us personalize your experience
            </p>
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-5">
              {(form.role === "agent" || form.role === "broker") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={form.licenseNumber}
                      onChange={(e) =>
                        updateForm("licenseNumber", e.target.value)
                      }
                      placeholder="e.g. RE-123456"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Brokerage Name
                    </label>
                    <input
                      type="text"
                      autoComplete="organization"
                      value={form.brokerage}
                      onChange={(e) => updateForm("brokerage", e.target.value)}
                      placeholder="e.g. Premium Properties Inc."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                    />
                  </div>
                </>
              )}
              {(form.role === "buyer" || form.role === "investor") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Budget Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={form.budgetMin}
                        onChange={(e) =>
                          updateForm("budgetMin", e.target.value)
                        }
                        placeholder="Min ($)"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                      />
                      <input
                        type="number"
                        value={form.budgetMax}
                        onChange={(e) =>
                          updateForm("budgetMax", e.target.value)
                        }
                        placeholder="Max ($)"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                      />
                    </div>
                  </div>
                </>
              )}
              {form.role === "seller" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Property Address (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter property address"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep((s) => s - 1)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              step === 1
                ? "invisible"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            Back
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="bg-[#0A2647] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0d3366] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#C9A227] text-[#0A2647] px-8 py-3 rounded-lg font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          )}
        </div>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#C9A227] hover:text-[#b8911f] font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
