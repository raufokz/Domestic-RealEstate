"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { FunnelShell, TapOption, FunnelHeading, FunnelContinueButton } from "@/components/funnel/FunnelShell";
import Turnstile from "@/components/Turnstile";
import { saveFunnelDraft, loadFunnelDraft, clearFunnelDraft, CONSENT_TEXT, CONSENT_VERSION } from "@/lib/funnel";

const STRATEGIES = [
  { value: "rental-income", label: "Rental income" },
  { value: "fix-and-flip", label: "Fix & flip" },
  { value: "multi-family", label: "Multi-family" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "not-sure", label: "Not sure yet" },
];
const BUDGETS = [
  { value: "0-150000", label: "Under $150K" },
  { value: "150000-350000", label: "$150K – $350K" },
  { value: "350000-750000", label: "$350K – $750K" },
  { value: "750000-", label: "$750K+" },
];
const FINANCING = [
  { value: "cash", label: "Cash" },
  { value: "financing", label: "Financing" },
];
const EXPERIENCE = [
  { value: "first", label: "This is my first investment" },
  { value: "expanding", label: "I'm expanding my portfolio" },
];

const TOTAL_STEPS = 6;

export default function InvestFunnelPage() {
  const { notifyError } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [market, setMarket] = useState("");
  const [strategy, setStrategy] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [financing, setFinancing] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    const draft = loadFunnelDraft("invest");
    if (draft) {
      setStep(draft.step);
      setToken(draft.token || null);
      const a = draft.answers;
      if (a.market) setMarket(a.market as string);
      if (a.strategy) setStrategy(a.strategy as string);
      if (a.name) setName(a.name as string);
      if (a.phone) setPhone(a.phone as string);
      if (a.email) setEmail(a.email as string);
      if (a.budget) setBudget(a.budget as string);
      if (a.financing) setFinancing(a.financing as string);
      if (a.experience) setExperience(a.experience as string);
    }
  }, []);

  useEffect(() => {
    saveFunnelDraft("invest", {
      step, token: token || undefined,
      answers: { market, strategy, name, phone, email, budget, financing, experience },
    });
  }, [step, token, market, strategy, name, phone, email, budget, financing, experience]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submitCheckpoint = async () => {
    setLoading(true);
    try {
      const res = await apiPost<{ data: { token: string } }>("/funnel/invest/checkpoint", {
        name, phone, email: email || undefined, location: market || undefined, timeline: strategy || undefined,
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
      await apiPost("/funnel/invest/complete", {
        token,
        budget_min: budgetMin ? Number(budgetMin) : undefined,
        budget_max: budgetMax ? Number(budgetMax) : undefined,
        financing: financing || undefined,
        motivation: experience || undefined,
      });
      clearFunnelDraft("invest");
      next();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FunnelShell badge="Invest" step={Math.min(step, TOTAL_STEPS)} totalSteps={TOTAL_STEPS} onBack={step > 1 && step <= TOTAL_STEPS ? back : undefined}>
      {step === 1 && (
        <>
          <FunnelHeading title="Where do you want to invest?" subtitle="City, ZIP, or market." />
          <input
            id="invest-market" name="market" type="text" autoComplete="address-level2"
            value={market} onChange={(e) => setMarket(e.target.value)}
            placeholder="e.g. Dallas, TX"
            className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227] mb-6"
          />
          <FunnelContinueButton onClick={next} disabled={!market.trim()} />
        </>
      )}

      {step === 2 && (
        <>
          <FunnelHeading title="What's your strategy?" />
          <div className="space-y-3 mb-6">
            {STRATEGIES.map((s) => (
              <TapOption key={s.value} label={s.label} selected={strategy === s.value} onClick={() => setStrategy(s.value)} />
            ))}
          </div>
          <FunnelContinueButton onClick={next} disabled={!strategy} />
        </>
      )}

      {step === 3 && (
        <>
          <FunnelHeading title="How should a specialist reach you?" />
          <div className="space-y-3 mb-4">
            <input id="invest-name" name="name" type="text" autoComplete="name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227]" />
            <input id="invest-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-[#C9A227]" />
            <input id="invest-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)}
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
          <FunnelHeading title="Investment budget" />
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
          <FunnelHeading title="Cash or financing?" />
          <div className="space-y-3 mb-6">
            {FINANCING.map((f) => (
              <TapOption key={f.value} label={f.label} selected={financing === f.value} onClick={() => setFinancing(f.value)} />
            ))}
          </div>
          <FunnelContinueButton onClick={next} disabled={!financing} />
        </>
      )}

      {step === 6 && (
        <>
          <FunnelHeading title="First investment or expanding a portfolio?" />
          <div className="space-y-3 mb-6">
            {EXPERIENCE.map((e) => (
              <TapOption key={e.value} label={e.label} selected={experience === e.value} onClick={() => setExperience(e.value)} />
            ))}
          </div>
          <FunnelContinueButton onClick={submitComplete} disabled={!experience} loading={loading} label="Show Me Opportunities" />
        </>
      )}

      {step > TOTAL_STEPS && <ThankYou name={name} />}
    </FunnelShell>
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
        An investment specialist will reach out — usually within a few hours — with opportunities matching your criteria.
      </p>
      <Link href="/properties" className="inline-block bg-[#0A2647] text-white font-heading font-semibold px-8 py-3 rounded-xl hover:bg-[#0A2647]/90 transition-colors">
        Browse Properties Now
      </Link>
    </div>
  );
}
