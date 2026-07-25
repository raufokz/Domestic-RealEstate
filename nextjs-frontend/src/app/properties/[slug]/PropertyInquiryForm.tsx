"use client";

import { useId, useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Props {
  propertyId: number;
  propertyTitle: string;
}

/**
 * Property viewing / inquiry form. Posts to POST /properties/{id}/inquiry,
 * which creates an Enquiry AND a CRM lead (LeadCaptureService). No silent
 * failure and no fake success — the UI reflects the real API result.
 */
export default function PropertyInquiryForm({ propertyId, propertyTitle }: Props) {
  const { success, notifyError } = useToast();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I'm interested in ${propertyTitle}. Please contact me to schedule a viewing.`,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiPost(`/properties/${propertyId}/inquiry`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
      });
      setDone(true);
      success("Your inquiry was sent. An agent will reach out shortly.");
    } catch (err) {
      notifyError(err, "We couldn't send your inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center" role="status">
        <div aria-hidden="true" className="text-4xl mb-3">✅</div>
        <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-2">Inquiry Sent</h3>
        <p className="font-body text-gray-600 text-sm">
          Thanks for your interest in {propertyTitle}. A member of our team will contact you soon.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-4 py-3 font-body min-h-[48px] text-base focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8" noValidate>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor={nameId} className="block font-body text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id={nameId}
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Jane Doe"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor={emailId} className="block font-body text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="jane@example.com"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor={phoneId} className="block font-body text-sm font-medium text-gray-700 mb-2">
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id={phoneId}
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Best number to reach you"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={messageId} className="block font-body text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            id={messageId}
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className={`${inputCls} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0A2647] text-white font-heading font-semibold py-3.5 min-h-[48px] rounded-lg hover:bg-[#0A2647]/90 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
        >
          {submitting ? "Sending…" : "Send Inquiry"}
        </button>
        <p className="text-xs text-gray-400 text-center">
          By submitting, you agree to our{" "}
          <a href="/privacy" className="underline hover:text-[#0A2647]">Privacy Policy</a>. We&apos;ll only use your
          details to respond to this inquiry.
        </p>
      </div>
    </form>
  );
}
