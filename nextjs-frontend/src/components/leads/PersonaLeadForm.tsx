"use client";

import React, { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";

export type Persona = "buyer" | "seller" | "investor" | "realtor";

/**
 * Inline lead capture for the four audience landing pages.
 *
 * These pages previously had no form at all — every call to action sent the
 * visitor to /contact, /register or /properties, so converting meant leaving
 * the page that had just persuaded them. That extra hop is where the buyer,
 * seller, investor and realtor leads were being lost.
 *
 * Only name and email are required (matching LeadController::capture), because
 * every extra required field costs completions. The one persona-specific field
 * is optional and exists so the lead arrives with enough context to act on.
 */
interface PersonaCopy {
  heading: string;
  blurb: string;
  extraLabel: string;
  extraPlaceholder: string;
  /** Which capture field the extra input maps to. */
  extraField: "location" | "timeline" | "motivation";
  cta: string;
  success: string;
}

const COPY: Record<Persona, PersonaCopy> = {
  buyer: {
    heading: "Tell us what you are looking for",
    blurb:
      "An agent who works your area will get back to you with listings that match — usually the same day.",
    extraLabel: "Where are you looking?",
    extraPlaceholder: "e.g. Austin, TX or 78701",
    extraField: "location",
    cta: "Get matched with listings",
    success: "Thanks — an agent will be in touch with listings that fit.",
  },
  seller: {
    heading: "Find out what your home is worth",
    blurb:
      "Get a valuation prepared by a local agent from real comparable sales, not an automated estimate.",
    extraLabel: "Property address",
    extraPlaceholder: "e.g. 12 Oak Street, Austin, TX",
    extraField: "location",
    cta: "Request my valuation",
    success: "Thanks — we will prepare your valuation and follow up shortly.",
  },
  investor: {
    heading: "Get investment opportunities sent to you",
    blurb:
      "Tell us your criteria and an investment specialist will send deals that fit your numbers.",
    extraLabel: "What are you looking to buy?",
    extraPlaceholder: "e.g. multi-family in Dallas under $1M",
    extraField: "motivation",
    cta: "Send me deals",
    success: "Thanks — an investment specialist will reach out with matching deals.",
  },
  realtor: {
    heading: "Grow your pipeline with us",
    blurb:
      "Tell us about your business and we will show you what lead flow looks like in your area.",
    extraLabel: "Which areas do you serve?",
    extraPlaceholder: "e.g. Houston + Sugar Land",
    extraField: "location",
    cta: "Show me lead flow",
    success: "Thanks — we will be in touch about coverage in your area.",
  },
};

const FIELD =
  "w-full min-h-[48px] px-3 rounded-lg border border-slate-300 bg-white text-[16px] sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-colors";
const LABEL = "block text-sm font-medium text-slate-700 mb-1.5";

export default function PersonaLeadForm({
  persona,
  source,
  className = "",
}: {
  persona: Persona;
  /** Where the lead came from, so attribution survives into the CRM. */
  source?: string;
  className?: string;
}) {
  const copy = COPY[persona];
  const [form, setForm] = useState({ name: "", email: "", phone: "", extra: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      if (status === "error") setStatus("idle");
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) {
      setStatus("error");
      setMessage("Please add your name and email so we can reach you.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const [first, ...rest] = name.split(/\s+/);
      await apiPost("/leads/capture", {
        first_name: first,
        last_name: rest.join(" ") || null,
        email,
        phone: form.phone.trim() || null,
        type: persona,
        source: source || persona + "_landing_page",
        [copy.extraField]: form.extra.trim() || null,
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof ApiError
          ? err.message
          : "We could not send that just now. Please try again in a moment."
      );
    }
  };

  if (status === "done") {
    return (
      <div
        role="status"
        className={"rounded-2xl border border-emerald-300 bg-emerald-50 p-6 sm:p-8 text-center " + className}
      >
        <p className="font-heading text-lg font-bold text-emerald-900">You are all set</p>
        <p className="mt-2 font-body text-sm text-emerald-800">{copy.success}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={"rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm " + className}
    >
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#0A2647]">{copy.heading}</h2>
      <p className="mt-1.5 font-body text-sm text-slate-600">{copy.blurb}</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={persona + "-name"} className={LABEL}>
            Your name
            <span className="sr-only"> (required)</span>
            <span aria-hidden="true" className="text-[#C9A227]"> *</span>
          </label>
          <input
            id={persona + "-name"}
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={set("name")}
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor={persona + "-email"} className={LABEL}>
            Email
            <span className="sr-only"> (required)</span>
            <span aria-hidden="true" className="text-[#C9A227]"> *</span>
          </label>
          <input
            id={persona + "-email"}
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor={persona + "-phone"} className={LABEL}>
            Phone <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id={persona + "-phone"}
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set("phone")}
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor={persona + "-extra"} className={LABEL}>
            {copy.extraLabel} <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id={persona + "-extra"}
            type="text"
            value={form.extra}
            onChange={set("extra")}
            placeholder={copy.extraPlaceholder}
            className={FIELD}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-5 w-full sm:w-auto min-h-[48px] px-7 rounded-lg bg-[#C9A227] text-[#07162C] font-bold text-sm hover:bg-[#B59123] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
      >
        {status === "submitting" ? "Sending..." : copy.cta}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={
          "mt-2.5 min-h-[20px] text-sm " + (status === "error" ? "text-red-600" : "text-slate-500")
        }
      >
        {message}
      </p>

      <p className="mt-1 font-body text-xs text-slate-400">
        We will only use your details to respond to this request.
      </p>
    </form>
  );
}
