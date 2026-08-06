"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Props {
  offerId: number;
  /** Who's making this counter — determines which endpoint gets called. */
  side: "buyer" | "seller";
  currentAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

/** Shared counter-offer modal used by both buyer and seller dashboards —
 * the only difference between the two is which respond endpoint it posts to. */
export default function CounterOfferModal({ offerId, side, currentAmount, onClose, onSuccess }: Props) {
  const { success, notifyError } = useToast();
  const [amount, setAmount] = useState(String(currentAmount));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      notifyError(null, "Enter a valid counter-offer amount.");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost(`/${side}/offers/${offerId}/respond`, {
        action: "counter",
        amount: numericAmount,
        message: message.trim() || undefined,
      });
      success("Counter-offer sent.", "Offers");
      onSuccess();
    } catch (err) {
      notifyError(err, "Could not send the counter-offer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#0A2647]">Send a Counter-Offer</h3>
          <p className="text-xs text-slate-500 mt-1">Current amount on the table: ${currentAmount.toLocaleString()}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Counter Amount ($)</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Add a note about your counter-offer..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
              {submitting ? "Sending..." : "Send Counter-Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
