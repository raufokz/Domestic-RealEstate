"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";

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

const AGENT_SERVICES_TEMPLATES = [
  {
    category: "Core Services",
    items: [
      "Executive Virtual Assistant",
      "Email Management",
      "Calendar Management",
      "CRM Management",
      "MLS & Property Listings",
      "Data Entry & Research",
      "Excel & Google Sheets",
      "Cold Calling",
      "Lead Generation",
      "Social Media Management",
    ],
  },
  {
    category: "Web & Tech",
    items: [
      "Real Estate Website Development",
      "Website Updates & Maintenance",
      "Landing Pages",
      "WordPress Development",
      "Automation & Workflows",
      "Technical Support",
    ],
  },
  {
    category: "Marketing",
    items: [
      "SEO",
      "Graphic Design (Canva)",
      "Content Creation",
      "YouTube Management",
      "Pinterest Marketing",
    ],
  },
  {
    category: "AI & Productivity",
    items: [
      "AI Tools Integration",
      "Reports & Analytics",
      "Database Management",
    ],
  },
];

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "";
  const initialPlan = searchParams.get("plan") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const { notifyError, success } = useToast();

  const [form, setForm] = useState({
    role: initialRole,
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
    services_needed: [] as string[],
    monthly_budget: "",
    preferred_leads: [] as string[],
    service_areas_zipcodes: "",
    pricing_plan: initialPlan || "Free Partner",
  });

  useEffect(() => {
    if (initialRole) {
      setForm((prev) => ({ 
        ...prev, 
        role: initialRole,
        pricing_plan: initialPlan || prev.pricing_plan 
      }));
      setStep(2);
    }
  }, [initialRole, initialPlan]);

  const handleQuickDemoRegister = (role = "buyer") => {
    setForm({
      role: role,
      firstName: "Alex",
      lastName: "Morgan",
      email: `alex.morgan.${Date.now().toString().slice(-4)}@example.com`,
      phone: "+1 (555) 234-5678",
      password: "Password123!",
      confirmPassword: "Password123!",
      licenseNumber: "RE-987654",
      brokerage: "Apex Real Estate Corp",
      budgetMin: "250000",
      budgetMax: "750000",
      services_needed: ["Lead Generation", "AI Assistant"],
      monthly_budget: "$1,000 - $2,500",
      preferred_leads: ["Sellers", "Buyers"],
      service_areas_zipcodes: "33139, 33140",
      pricing_plan: role === "agent" || role === "broker" ? "Elite Exclusive Specialist" : "Free Partner",
    });
    setStep(2);
  };

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCheckbox = (field: "services_needed" | "preferred_leads", value: string) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      const updated = arr.includes(value)
        ? arr.filter((x) => x !== value)
        : [...arr, value];
      return { ...prev, [field]: updated };
    });
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
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const payload = {
        ...form,
        name: fullName || "Valued User",
        password_confirmation: form.confirmPassword,
      };
      await apiPost("/auth/register", payload);
      success("Account created! Verification instructions sent.", "Registration Successful");
      setRegistered(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(msg);
      notifyError(err, "Registration failed");
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
            {["Choose Role", "Account Setup", "Preferences"].map((label, i) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > i + 1
                      ? "bg-[#C9A227] text-[#0A2647] scale-110 shadow-lg shadow-[#C9A227]/20"
                      : step === i + 1
                      ? "bg-white text-[#0A2647] ring-4 ring-white/20 scale-110"
                      : "bg-[#0c2e56] text-slate-400 border border-[#143d6c]"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span
                  className={`ml-2.5 text-xs font-heading font-bold uppercase tracking-wider hidden sm:inline transition-colors duration-300 ${
                    step >= i + 1 ? "text-white" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div
                    className={`w-10 sm:w-16 h-0.5 mx-3 transition-colors duration-500 rounded-full ${
                      step > i + 1 ? "bg-[#C9A227]" : "bg-slate-700"
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0A2647]">
                  Select Your Role
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Choose the role that best describes you or use 1-click test fill
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoRegister("buyer")}
                className="px-3.5 py-2 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300 text-amber-950 font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-fill Test User
              </button>
            </div>
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {ROLES.map((role) => {
                 const isSelected = form.role === role.id;
                 return (
                   <button
                     key={role.id}
                     type="button"
                     onClick={() => updateForm("role", role.id)}
                     className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative group flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-md ${
                       isSelected
                         ? "border-[#C9A227] bg-white shadow-md shadow-[#C9A227]/5 ring-2 ring-[#C9A227]/20"
                         : "border-slate-205 bg-white hover:border-slate-350"
                     }`}
                   >
                     {isSelected && (
                       <span className="absolute top-4 right-4 bg-[#C9A227] text-[#0A2647] w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                         ✓
                       </span>
                     )}
                     <div>
                       <div
                         className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                           isSelected
                             ? "bg-[#C9A227]/15 text-[#C9A227]"
                             : "bg-slate-50 text-slate-400 group-hover:bg-[#0A2647]/5 group-hover:text-[#0A2647]"
                         }`}
                       >
                         {role.icon}
                       </div>
                       <h3 className="font-heading font-extrabold text-base text-[#0A2647]">
                         {role.title}
                       </h3>
                       <p className="text-slate-400 font-semibold text-xs leading-relaxed mt-2.5">
                         {role.description}
                       </p>
                     </div>
                   </button>
                 );
               })}
             </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#0A2647] mb-2">
              Setup Your Account
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Create your secure login credentials to access the portal
            </p>
            <div className="bg-white rounded-3xl border border-slate-205/60 p-8 space-y-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-heading font-extrabold text-[#0A2647] uppercase tracking-wide mb-2">
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
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#C9A227]/15 focus:border-[#C9A227] outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-heading font-extrabold text-[#0A2647] uppercase tracking-wide mb-2">
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
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#C9A227]/15 focus:border-[#C9A227] outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-heading font-extrabold text-[#0A2647] uppercase tracking-wide mb-2">
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
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#C9A227]/15 focus:border-[#C9A227] outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-extrabold text-[#0A2647] uppercase tracking-wide mb-2">
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
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#C9A227]/15 focus:border-[#C9A227] outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-heading font-extrabold text-[#0A2647] uppercase tracking-wide mb-2">
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
                    placeholder="Create secure password"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#C9A227]/15 focus:border-[#C9A227] outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-heading font-extrabold text-[#0A2647] uppercase tracking-wide mb-2">
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
                    placeholder="Verify password choice"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#C9A227]/15 focus:border-[#C9A227] outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {form.password &&
                form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p className="text-rose-500 text-xs font-bold font-heading">
                    ⚠️ Passwords do not match
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
                    <label className="block text-sm font-semibold text-[#0A2647] mb-3 font-heading uppercase tracking-wide">
                      Select Your Preferred Agent Plan
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {[
                        {
                          name: "Free Partner",
                          price: "$0",
                          period: "forever",
                          icon: "🌱",
                          description: "Basic profile directory listing & claim up to 3 properties.",
                          features: ["Standard Agent Directory Listing", "Claim up to 3 listings", "Receive general requests"]
                        },
                        {
                          name: "Zip Code Specialist",
                          price: "$99",
                          period: "month",
                          icon: "★",
                          description: "Get spotlighted at the top of local property searches.",
                          features: ["Map Search Spotlight Banner", "★ Preferred Partner Badge", "Zipcode Lead Forwarding", "SMS Lead Alerts"]
                        },
                        {
                          name: "Elite Exclusive Specialist",
                          price: "$149",
                          period: "month",
                          icon: "👑",
                          popular: true,
                          description: "100% exclusive Zip Code ownership. No competitors allowed.",
                          features: ["Locks out 1 Zip Code exclusively", "Priority Search Spotlight ranking", "Google Search schema integration", "24/7 Priority Support"]
                        },
                        {
                          name: "Brokerage Partner",
                          price: "$299",
                          period: "month",
                          icon: "🏢",
                          description: "Own multiple zip codes and rotating team spotlights.",
                          features: ["Spotlight for 5 Zip Codes", "Rotates team profiles on properties", "Co-branded office landers", "Custom CRM webhook integration"]
                        }
                      ].map((plan) => {
                        const isSelected = form.pricing_plan === plan.name;
                        return (
                          <div
                            key={plan.name}
                            onClick={() => updateForm("pricing_plan", plan.name)}
                            className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between hover:shadow-md ${
                              isSelected
                                ? "border-[#C9A227] bg-[#C9A227]/5 shadow-lg scale-[1.01]"
                                : "border-slate-200 bg-white hover:border-slate-350"
                            }`}
                          >
                            {plan.popular && (
                              <span className="absolute -top-2.5 right-6 bg-[#C9A227] text-[#0A2647] text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                Most Popular
                              </span>
                            )}
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{plan.icon}</span>
                                <h4 className="font-heading font-extrabold text-sm text-[#0A2647]">{plan.name}</h4>
                              </div>
                              <p className="text-slate-450 text-[11px] font-semibold leading-relaxed mb-3">{plan.description}</p>
                              
                              <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-2xl font-black text-[#0A2647]">{plan.price}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">/ {plan.period}</span>
                              </div>

                              <ul className="space-y-1.5 text-[10px] text-slate-600 font-bold border-t border-slate-100 pt-3">
                                {plan.features.map((feat) => (
                                  <li key={feat} className="flex items-center gap-1.5">
                                    <span className="text-[#C9A227]">✓</span> {feat}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div
                              className={`w-full py-2 text-[11px] text-center rounded-xl font-heading font-bold transition-all ${
                                isSelected
                                  ? "bg-[#0A2647] text-white shadow-sm"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              }`}
                            >
                              {isSelected ? "Plan Selected ✓" : "Select Plan"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 font-bold text-[#0A2647]">
                      Covering Zip Codes
                    </label>
                    <input
                      type="text"
                      value={form.service_areas_zipcodes}
                      onChange={(e) => updateForm("service_areas_zipcodes", e.target.value)}
                      placeholder="e.g. 33139, 33140, 33101 (comma-separated)"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">We will routing local leads matching these zipcodes to your account.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 font-bold text-[#0A2647]">
                      Monthly Marketing Budget
                    </label>
                    <select
                      value={form.monthly_budget}
                      onChange={(e) => updateForm("monthly_budget", e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition text-slate-800 bg-white"
                    >
                      <option value="">Select budget range...</option>
                      <option value="Under $500/mo">Under $500/mo</option>
                      <option value="$500 - $1,000/mo">$500 - $1,000/mo</option>
                      <option value="$1,000 - $2,500/mo">$1,000 - $2,500/mo</option>
                      <option value="$2,500 - $5,000/mo">$2,500 - $5,000/mo</option>
                      <option value="$5,000+/mo">$5,000+/mo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A2647] mb-3 font-heading uppercase tracking-wide">
                      Services Needed (Select all that apply)
                    </label>
                    <div className="space-y-4">
                      {AGENT_SERVICES_TEMPLATES.map((group) => (
                        <div key={group.category} className="bg-slate-50 p-4 rounded-2xl border border-slate-100/85">
                          <h4 className="text-xs font-bold text-[#C9A227] uppercase tracking-wider mb-2.5">
                            {group.category}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.items.map((svc) => {
                              const isChecked = form.services_needed?.includes(svc);
                              return (
                                <label key={svc} className={`flex items-center gap-2.5 px-3 py-2 border rounded-xl cursor-pointer select-none transition-all ${isChecked ? 'bg-[#0A2647] text-white border-[#0A2647] shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCheckbox("services_needed", svc)}
                                    className="w-4 h-4 text-[#C9A227] focus:ring-[#C9A227] border-slate-350 rounded"
                                  />
                                  <span className="text-[11px] font-semibold">{svc}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-bold text-[#0A2647]">
                      Preferred Lead Types
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Motivated Sellers", "First-Time Buyers", "Off-Market Investment Comps", "Hard Money/Refinance client"].map((lead) => {
                        const isChecked = form.preferred_leads?.includes(lead);
                        return (
                          <label key={lead} className={`flex items-center gap-2.5 px-4 py-3 border rounded-xl cursor-pointer select-none transition-all ${isChecked ? 'bg-[#0A2647]/5 border-[#0A2647]' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheckbox("preferred_leads", lead)}
                              className="w-4 h-4 text-[#C9A227] focus:ring-[#C9A227] border-slate-300 rounded"
                            />
                            <span className="text-xs font-semibold text-slate-700">{lead}</span>
                          </label>
                        );
                      })}
                    </div>
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
          {step < 3 ? (
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
              className="bg-[#C9A227] text-[#0A2647] px-8 py-3 rounded-lg font-bold hover:bg-[#b8911f] transition disabled:opacity-50"
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-heading text-[#0A2647] font-bold text-lg">Loading Registration Portal...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
