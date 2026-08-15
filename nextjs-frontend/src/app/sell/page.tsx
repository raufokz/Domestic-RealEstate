"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { FunnelShell, TapOption, FunnelHeading, FunnelContinueButton } from "@/components/funnel/FunnelShell";
import Turnstile from "@/components/Turnstile";
import { saveFunnelDraft, loadFunnelDraft, clearFunnelDraft, CONSENT_TEXT, CONSENT_VERSION } from "@/lib/funnel";

const GOALS = [
  { value: "sell-soon", label: "Sell soon" },
  { value: "sell-few-months", label: "Sell in a few months" },
  { value: "not-sure", label: "Not sure yet" },
  { value: "just-value", label: "Just want to know its value" },
];
const PROPERTY_TYPES = ["Single Family", "Condo / Townhouse", "Multi-Family", "Land"];
const CONDITIONS = ["Move-in ready", "Needs minor work", "Needs major work"];
const OCCUPANCY = [
  { value: "living-there", label: "Yes, I live there" },
  { value: "rented", label: "It's rented out" },
  { value: "vacant", label: "It's vacant" },
];

const TOTAL_STEPS = 7;

export default function SellFunnelPage() {
  const { notifyError } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [address, setAddress] = useState("");
  const [goal, setGoal] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [condition, setCondition] = useState("");
  const [occupancy, setOccupancy] = useState("");

  useEffect(() => {
    const draft = loadFunnelDraft("sell");
    if (draft) {
      setStep(draft.step);
      setToken(draft.token || null);
      const a = draft.answers;
      if (a.address) setAddress(a.address as string);
      if (a.goal) setGoal(a.goal as string);
      if (a.name) setName(a.name as string);
      if (a.phone) setPhone(a.phone as string);
      if (a.email) setEmail(a.email as string);
      if (a.propertyType) setPropertyType(a.propertyType as string);
      if (a.bedrooms) setBedrooms(a.bedrooms as number);
      if (a.bathrooms) setBathrooms(a.bathrooms as number);
      if (a.condition) setCondition(a.condition as string);
      if (a.occupancy) setOccupancy(a.occupancy as string);
    }
  }, []);

  useEffect(() => {
    saveFunnelDraft("sell", {
      step, token: token || undefined,
      answers: { address, goal, name, phone, email, propertyType, bedrooms, bathrooms, condition, occupancy },
    });
  }, [step, token, address, goal, name, phone, email, propertyType, bedrooms, bathrooms, condition, occupancy]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submitCheckpoint = async () => {
    setLoading(true);
    try {
      const res = await apiPost<{ data: { token: string } }>("/funnel/sell/checkpoint", {
        name, phone, email: email || undefined, location: address || undefined, timeline: goal || undefined,
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
      await apiPost("/funnel/sell/complete", {
        token,
        property_type: propertyType || undefined,
        bedrooms: bedrooms || undefined,
        bathrooms: bathrooms || undefined,
        condition: condition || undefined,
        occupancy: occupancy || undefined,
      });
      clearFunnelDraft("sell");
      next();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FunnelShell badge="Sell Your Home" step={Math.min(step, TOTAL_STEPS)} totalSteps={TOTAL_STEPS} onBack={step > 1 && step <= TOTAL_STEPS ? back : undefined}>
      {step === 1 && (
        <>
          <FunnelHeading title="What's the property address?" />
          <input
            id="sell-address" name="address" type="text" autoComplete="street-address"
            value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Austin, TX"
            className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227] mb-6"
          />
          <FunnelContinueButton onClick={next} disabled={!address.trim()} />
        </>
      )}

      {step === 2 && (
        <>
          <FunnelHeading title="What do you want to do?" />
          <div className="space-y-3 mb-6">
            {GOALS.map((g) => (
              <TapOption key={g.value} label={g.label} selected={goal === g.value} onClick={() => setGoal(g.value)} />
            ))}
          </div>
          <FunnelContinueButton onClick={next} disabled={!goal} />
        </>
      )}

      {step === 3 && (
        <>
          <FunnelHeading title="How should an agent reach you?" />
          <div className="space-y-3 mb-4">
            <input id="sell-name" name="name" type="text" autoComplete="name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227]" />
            <input id="sell-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227]" />
            <input id="sell-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)}
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
          <FunnelHeading title="Property type" />
          <div className="space-y-3 mb-6">
            {PROPERTY_TYPES.map((pt) => (
              <TapOption key={pt} label={pt} selected={propertyType === pt} onClick={() => setPropertyType(pt)} />
            ))}
          </div>
          <FunnelContinueButton onClick={next} disabled={!propertyType} />
        </>
      )}

      {step === 5 && (
        <>
          <FunnelHeading title="Beds &amp; baths" />
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Stepper label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
            <Stepper label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
          </div>
          <FunnelContinueButton onClick={next} />
        </>
      )}

      {step === 6 && (
        <>
          <FunnelHeading title="Condition" />
          <div className="space-y-3 mb-6">
            {CONDITIONS.map((c) => (
              <TapOption key={c} label={c} selected={condition === c} onClick={() => setCondition(c)} />
            ))}
          </div>
          <FunnelContinueButton onClick={next} disabled={!condition} />
        </>
      )}

      {step === 7 && (
        <>
          <FunnelHeading title="Are you currently living there?" />
          <div className="space-y-3 mb-6">
            {OCCUPANCY.map((o) => (
              <TapOption key={o.value} label={o.label} selected={occupancy === o.value} onClick={() => setOccupancy(o.value)} />
            ))}
          </div>
          <FunnelContinueButton onClick={submitComplete} disabled={!occupancy} loading={loading} label="Get My Home Value" />
        </>
      )}

      {step > TOTAL_STEPS && <ThankYou name={name} />}
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
        A local listing specialist will reach out — usually within 24 hours — with your home&apos;s value and next steps.
      </p>
      <Link href="/" className="inline-block bg-[#0A2647] text-white font-heading font-semibold px-8 py-3 rounded-xl hover:bg-[#0A2647]/90 transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
