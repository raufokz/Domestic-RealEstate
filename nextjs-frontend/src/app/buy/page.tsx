"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { FunnelShell, TapOption, FunnelHeading, FunnelContinueButton } from "@/components/funnel/FunnelShell";
import Turnstile from "@/components/Turnstile";
import { saveFunnelDraft, loadFunnelDraft, clearFunnelDraft, CONSENT_TEXT, CONSENT_VERSION } from "@/lib/funnel";

const TIMELINES = [
  { value: "asap", label: "ASAP" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "just-exploring", label: "Just exploring" },
];
const BUDGETS = [
  { value: "0-400000", label: "Under $400K" },
  { value: "400000-600000", label: "$400K – $600K" },
  { value: "600000-1000000", label: "$600K – $1M" },
  { value: "1000000-", label: "$1M+" },
];
const PROPERTY_TYPES = ["Single Family", "Condo / Townhouse", "Multi-Family", "Land"];
const FINANCING = [
  { value: "pre-approved", label: "Pre-approved" },
  { value: "not-yet", label: "Not yet" },
  { value: "cash", label: "Paying cash" },
];

const TOTAL_STEPS = 7;

export default function BuyFunnelPage() {
  const { notifyError } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [location, setLocation] = useState("");
  const [timeline, setTimeline] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [financing, setFinancing] = useState("");

  // Restore draft on mount (back-navigation / accidental refresh survival).
  useEffect(() => {
    const draft = loadFunnelDraft("buy");
    if (draft) {
      setStep(draft.step);
      setToken(draft.token || null);
      const a = draft.answers;
      if (a.location) setLocation(a.location as string);
      if (a.timeline) setTimeline(a.timeline as string);
      if (a.name) setName(a.name as string);
      if (a.phone) setPhone(a.phone as string);
      if (a.email) setEmail(a.email as string);
      if (a.budget) setBudget(a.budget as string);
      if (a.propertyType) setPropertyType(a.propertyType as string);
      if (a.bedrooms) setBedrooms(a.bedrooms as number);
      if (a.bathrooms) setBathrooms(a.bathrooms as number);
      if (a.financing) setFinancing(a.financing as string);
    }
  }, []);

  useEffect(() => {
    saveFunnelDraft("buy", {
      step, token: token || undefined,
      answers: { location, timeline, name, phone, email, budget, propertyType, bedrooms, bathrooms, financing },
    });
  }, [step, token, location, timeline, name, phone, email, budget, propertyType, bedrooms, bathrooms, financing]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submitCheckpoint = async () => {
    setLoading(true);
    try {
      const res = await apiPost<{ data: { token: string } }>("/funnel/buy/checkpoint", {
        name, phone, email: email || undefined, location: location || undefined, timeline: timeline || undefined,
        consent_text: CONSENT_TEXT, consent_version: CONSENT_VERSION,
        turnstile_token: turnstileToken || undefined,
      });
      setToken(res.data.token);
      next();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitComplete = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [budgetMin, budgetMax] = budget.split("-");
      await apiPost("/funnel/buy/complete", {
        token,
        budget_min: budgetMin ? Number(budgetMin) : undefined,
        budget_max: budgetMax ? Number(budgetMax) : undefined,
        property_type: propertyType || undefined,
        bedrooms: bedrooms || undefined,
        bathrooms: bathrooms || undefined,
        financing: financing || undefined,
        pre_approved: financing === "pre-approved",
      });
      clearFunnelDraft("buy");
      next();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FunnelShell badge="Find Homes" step={Math.min(step, TOTAL_STEPS)} totalSteps={TOTAL_STEPS} onBack={step > 1 && step <= TOTAL_STEPS ? back : undefined}>
      {step === 1 && (
        <>
          <FunnelHeading title="Where are you looking?" subtitle="City, ZIP, or neighborhood." />
          <input
            id="buy-location" name="location" type="text" autoComplete="address-level2"
            value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Austin, TX or 78701"
            className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227] mb-6"
          />
          <FunnelContinueButton onClick={next} disabled={!location.trim()} />
        </>
      )}

      {step === 2 && (
        <>
          <FunnelHeading title="When do you want to move?" />
          <div className="space-y-3 mb-6">
            {TIMELINES.map((t) => (
              <TapOption key={t.value} label={t.label} selected={timeline === t.value} onClick={() => setTimeline(t.value)} />
            ))}
          </div>
          <FunnelContinueButton onClick={next} disabled={!timeline} />
        </>
      )}

      {step === 3 && (
        <>
          <FunnelHeading title="How should an agent reach you?" />
          <div className="space-y-3 mb-4">
            <input id="buy-name" name="name" type="text" autoComplete="name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227]" />
            <input id="buy-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227]" />
            <input id="buy-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227]" />
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            By continuing, you agree that a licensed real estate professional may contact you by phone, text, or email about your request. Consent is not a condition of any purchase.{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link> · <Link href="/terms" className="underline">Terms</Link>
          </p>
          <Turnstile onVerify={setTurnstileToken} className="flex justify-center mb-4" />
          <FunnelContinueButton onClick={submitCheckpoint} disabled={!name.trim() || !phone.trim()} loading={loading} />
        </>
      )}

      {step === 4 && (
        <>
          <FunnelHeading title="What's your budget?" />
          <div className="space-y-3 mb-6">
            {BUDGETS.map((b) => (
              <TapOption key={b.value} label={b.label} selected={budget === b.value} onClick={() => setBudget(b.value)} />
            ))}
          </div>
          <FunnelContinueButton onClick={next} disabled={!budget} />
        </>
      )}

      {step === 5 && (
        <>
          <FunnelHeading title="Property type" />
          <div className="space-y-3 mb-6">
            {PROPERTY_TYPES.map((pt) => (
              <TapOption key={pt} label={pt} selected={propertyType === pt} onClick={() => setPropertyType(pt)} />
            ))}
          </div>
          <FunnelContinueButton onClick={next} disabled={!propertyType} />
        </>
      )}

      {step === 6 && (
        <>
          <FunnelHeading title="Beds &amp; baths" />
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Stepper label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
            <Stepper label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
          </div>
          <FunnelContinueButton onClick={next} />
        </>
      )}

      {step === 7 && (
        <>
          <FunnelHeading title="Pre-approved for a mortgage?" />
          <div className="space-y-3 mb-6">
            {FINANCING.map((f) => (
              <TapOption key={f.value} label={f.label} selected={financing === f.value} onClick={() => setFinancing(f.value)} />
            ))}
          </div>
          <FunnelContinueButton onClick={submitComplete} disabled={!financing} loading={loading} label="Find My Matches" />
        </>
      )}

      {step > TOTAL_STEPS && (
        <ThankYou name={name} />
      )}
    </FunnelShell>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 rounded-full bg-slate-100 text-[#0A2647] font-bold text-lg">−</button>
        <span className="text-2xl font-black text-[#0A2647] w-8">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-full bg-slate-100 text-[#0A2647] font-bold text-lg">+</button>
      </div>
    </div>
  );
}

function ThankYou({ name }: { name: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">✓</span>
      </div>
      <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-3">Thanks{name ? `, ${name.split(" ")[0]}` : ""}!</h2>
      <p className="text-slate-500 mb-8">
        A local buyer specialist will reach out — usually within a few hours — with homes matching what you told us.
      </p>
      <Link href="/properties" className="inline-block bg-[#0A2647] text-white font-heading font-semibold px-8 py-3 rounded-xl hover:bg-[#0A2647]/90 transition-colors">
        Browse Homes Now
      </Link>
    </div>
  );
}
