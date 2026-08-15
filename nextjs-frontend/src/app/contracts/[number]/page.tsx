"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";
import SignaturePad from "@/components/SignaturePad";
import { apiGet, apiPost } from "@/lib/api";

/**
 * Strip scripts, event handlers and javascript: URLs from contract markup.
 * DOMPurify needs a DOM, so on the server we fall back to a conservative
 * regex pass — the same split the blog viewer already uses.
 */
function sanitizeContractHtml(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\son\w+=["'][^"']*["']/gi, "")
      .replace(/href=["']javascript:[^"']*["']/gi, 'href="#"');
  }
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

interface Contract {
  id: number;
  contract_number: string;
  template_name: string;
  template_html?: string;
  client_details?: Record<string, string>;
  status: string;
  signed_at?: string;
  expires_at?: string;
}

export default function ContractSignPage() {
  const params = useParams();
  const contractNumber = params.number as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<Contract>(`/contracts/${contractNumber}`);
        setContract(data);
        if (data.status === "signed") setSigned(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load contract.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    if (contractNumber) load();
  }, [contractNumber]);

  const handleSign = async (signatureBase64: string) => {
    setSigning(true);
    setError("");
    try {
      await apiPost(`/contracts/${contractNumber}/sign`, { signature_base64: signatureBase64 });
      setSigned(true);
      setContract((c) => c ? { ...c, status: "signed" } : c);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign contract.";
      setError(msg);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 shadow-card max-w-md text-center">
          <h1 className="font-heading text-xl font-bold text-navy mb-2">Contract Not Found</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href="/" className="px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-600 transition-colors inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-navy to-navy-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold text-sm font-semibold mb-2">Contract #{contractNumber}</p>
          <h1 className="font-heading text-3xl font-bold text-white">{contract?.template_name || "Service Contract"}</h1>
          <p className="text-navy-200 mt-2">
            Status: <span className={`font-semibold ${signed ? "text-green-400" : "text-gold"}`}>
              {signed ? "Signed" : contract?.status === "expired" ? "Expired" : "Awaiting Signature"}
            </span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Contract Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card">
          <h2 className="font-heading text-xl font-bold text-navy mb-6">Contract Terms</h2>
          {contract?.template_html ? (
            <div
              className="prose prose-slate max-w-none"
              /* Sanitized before render: template_html arrives from the API and
                 is rendered on a page reached by contract number, so it must not
                 be trusted verbatim. */
              dangerouslySetInnerHTML={{ __html: sanitizeContractHtml(contract.template_html) }}
            />
          ) : (
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>This agreement is entered into between Domestic Real Estate (&quot;Company&quot;) and the undersigned client (&quot;Client&quot;) for the provision of real estate services as outlined in the service request.</p>
              <p>The Company agrees to provide professional real estate services including but not limited to property search, market analysis, negotiation assistance, and transaction management.</p>
              <p>The Client agrees to cooperate with the Company&apos;s agents, provide accurate information, and adhere to the agreed-upon timeline and payment terms.</p>
              <p>This contract is subject to the terms outlined in the service request #{contract?.contract_number} and any additional terms agreed upon by both parties.</p>
            </div>
          )}
        </div>

        {/* Signature Section */}
        {!signed ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card">
            <h2 className="font-heading text-xl font-bold text-navy mb-2">Your Signature</h2>
            <p className="text-slate-500 text-sm mb-6">Draw your signature below to sign this contract electronically.</p>
            <SignaturePad width={600} height={200} onSign={handleSign} disabled={signing} />
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            {signing && (
              <div className="flex items-center gap-3 mt-4 p-4 bg-gold-50 rounded-xl">
                <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                <span className="text-sm text-navy font-medium">Submitting signature...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-navy mb-2">Contract Signed!</h2>
            <p className="text-slate-500 mb-6">This contract has been electronically signed and is now legally binding.</p>
            <Link href="/" className="px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-600 transition-colors inline-block">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
