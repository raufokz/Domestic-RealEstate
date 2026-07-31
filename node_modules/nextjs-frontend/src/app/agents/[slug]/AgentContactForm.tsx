"use client";

import { useId, useState } from "react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Props {
  agentId: number;
  agentFirstName: string;
}

/** Posts to POST /agents/{id}/contact, which creates a real Enquiry. */
export default function AgentContactForm({ agentId, agentFirstName }: Props) {
  const { success, notifyError } = useToast();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiPost(`/agents/${agentId}/contact`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
      });
      setDone(true);
      success("Your message was sent.");
    } catch (err) {
      notifyError(err, "We couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-4" role="status">
        <div aria-hidden="true" className="text-3xl mb-2">✅</div>
        <p className="font-body text-sm text-gray-600">
          Thanks — {agentFirstName} will be in touch soon.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:ring-2 focus:ring-[#C9A227] outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor={nameId} className="block font-body text-sm font-medium text-gray-700 mb-2">Your Name</label>
        <input id={nameId} type="text" required autoComplete="name" placeholder="John Doe" className={inputCls}
          value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label htmlFor={emailId} className="block font-body text-sm font-medium text-gray-700 mb-2">Email</label>
        <input id={emailId} type="email" required autoComplete="email" placeholder="john@example.com" className={inputCls}
          value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </div>
      <div>
        <label htmlFor={phoneId} className="block font-body text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input id={phoneId} type="tel" autoComplete="tel" placeholder="(310) 555-0199" className={inputCls}
          value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      </div>
      <div>
        <label htmlFor={messageId} className="block font-body text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea id={messageId} rows={4} required placeholder={`Hi ${agentFirstName}, I'm interested in...`} className={`${inputCls} resize-none`}
          value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#0A2647] text-white font-heading font-semibold py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
