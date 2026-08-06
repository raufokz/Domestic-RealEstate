"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";

interface Props {
  propertyId: number;
  propertyTitle: string;
}

const CONTINGENCY_OPTIONS = [
  { key: "inspection", label: "Inspection" },
  { key: "financing", label: "Financing" },
  { key: "appraisal", label: "Appraisal" },
];

/** Only role=buyer users can submit an offer — everyone else (including
 * logged-out visitors) sees a sign-in prompt instead of the form. */
export default function MakeOfferButton({ propertyId, propertyTitle }: Props) {
  const { user, loading } = useAuth();
  const { success, notifyError } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [amount, setAmount] = useState("");
  const [financingType, setFinancingType] = useState("conventional");
  const [contingencies, setContingencies] = useState<string[]>(["inspection", "financing"]);
  const [closingDate, setClosingDate] = useState("");
  const [message, setMessage] = useState("");

  function toggleContingency(key: string) {
    setContingencies((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      notifyError(null, "Enter a valid offer amount.");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/buyer/offers", {
        property_id: propertyId,
        amount: numericAmount,
        financing_type: financingType,
        contingencies,
        closing_date: closingDate || undefined,
        message: message.trim() || `I'd like to make an offer on ${propertyTitle}.`,
      });
      success("Your offer was submitted successfully.", "Offer Submitted");
      setSubmitted(true);
    } catch (err) {
      notifyError(err, "Could not submit your offer.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="block w-full bg-[#0A2647] hover:bg-[#0d3366] text-white font-heading text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all text-center"
      >
        Sign In to Make an Offer
      </Link>
    );
  }

  if (user.role !== "buyer") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full bg-[#C9A227] hover:bg-[#b8911f] text-[#0A2647] font-heading font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_12px_rgba(201,162,39,0.2)] hover:shadow-[0_4px_16px_rgba(201,162,39,0.3)] transition-all text-center border-b-2 border-amber-600 active:translate-y-[1px]"
      >
        Make an Offer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#0A2647] mb-2">Offer Submitted!</h3>
                <p className="text-sm text-slate-500 mb-6">The seller has been notified. You can track its status from your dashboard.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
                    Close
                  </button>
                  <Link href="/buyer/dashboard/offers" className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0d3366]">
                    View My Offers
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-bold text-[#0A2647]">Make an Offer</h3>
                  <p className="text-xs text-slate-500 mt-1">{propertyTitle}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Offer Amount ($)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Financing Type</label>
                    <select
                      value={financingType}
                      onChange={(e) => setFinancingType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="conventional">Conventional</option>
                      <option value="fha">FHA</option>
                      <option value="va">VA</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Contingencies</label>
                    <div className="flex flex-wrap gap-2">
                      {CONTINGENCY_OPTIONS.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => toggleContingency(c.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                            contingencies.includes(c.key) ? "bg-[#0A2647] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {c.label} {contingencies.includes(c.key) ? "✓" : "+"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Proposed Closing Date</label>
                    <input
                      type="date"
                      value={closingDate}
                      onChange={(e) => setClosingDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message (optional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder={`I'd like to make an offer on ${propertyTitle}.`}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setOpen(false)} disabled={submitting} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 disabled:opacity-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                      {submitting ? "Submitting..." : "Submit Offer"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
