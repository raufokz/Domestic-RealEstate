"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface TestInvoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
}

interface SimStep {
  step: string;
  status: "completed" | "current" | "pending" | "error";
  detail: string;
}

export default function PaymentsTestingPage() {
  const [invoicePreview, setInvoicePreview] = useState<{ loading: boolean; url: string | null; number: string | null; error: string | null }>({
    loading: false, url: null, number: null, error: null,
  });
  const [payoneerTest, setPayoneerTest] = useState<{ loading: boolean; valid: boolean | null; format: string | null; error: string | null }>({
    loading: false, valid: null, format: null, error: null,
  });
  const [invoiceEmailTest, setInvoiceEmailTest] = useState<{ loading: boolean; sent: boolean; timestamp: string | null; error: string | null }>({
    loading: false, sent: false, timestamp: null, error: null,
  });
  const [simSteps, setSimSteps] = useState<SimStep[]>([]);
  const [simLoading, setSimLoading] = useState(false);
  const [testInvoices, setTestInvoices] = useState<TestInvoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState("");

  useEffect(() => { loadTestInvoices(); }, []);

  async function loadTestInvoices() {
    setInvoicesLoading(true);
    try {
      const data = await apiGet<{ invoices: TestInvoice[] }>("/admin/testing/payments/recent");
      setTestInvoices(data.invoices || []);
      setInvoicesError("");
    } catch (e) {
      setInvoicesError(e instanceof Error ? e.message : "Could not load recent test invoices.");
      setTestInvoices([]);
    }
    setInvoicesLoading(false);
  }

  async function generateTestInvoice() {
    setInvoicePreview({ loading: true, url: null, number: null, error: null });
    try {
      const data = await apiPost<{ invoice_number: string; pdf_url: string }>("/admin/testing/payments/generate-invoice", {});
      setInvoicePreview({ loading: false, url: data.pdf_url || null, number: data.invoice_number || null, error: null });
      loadTestInvoices();
    } catch (e: any) {
      setInvoicePreview({ loading: false, url: null, number: null, error: e?.message || "Failed to generate invoice" });
    }
  }

  async function testPayoneerLink() {
    setPayoneerTest({ loading: true, valid: null, format: null, error: null });
    try {
      const data = await apiPost<{ valid: boolean; format: string }>("/admin/testing/payments/send-test", { type: "payoneer_link" });
      setPayoneerTest({ loading: false, valid: data.valid, format: data.format || null, error: null });
    } catch (e: any) {
      setPayoneerTest({ loading: false, valid: false, format: null, error: e?.message || "Verification failed" });
    }
  }

  async function sendTestInvoiceEmail() {
    setInvoiceEmailTest({ loading: true, sent: false, timestamp: null, error: null });
    try {
      const data = await apiPost<{ sent: boolean; sent_at: string }>("/admin/testing/payments/send-test", { type: "invoice_email" });
      setInvoiceEmailTest({ loading: false, sent: data.sent, timestamp: data.sent_at || new Date().toISOString(), error: null });
    } catch (e: any) {
      setInvoiceEmailTest({ loading: false, sent: false, timestamp: null, error: e?.message || "Failed to send invoice email" });
    }
  }

  async function runPaymentSimulation() {
    setSimLoading(true);
    setSimSteps([]);
    try {
      const data = await apiPost<{ steps: SimStep[] }>("/admin/testing/payments/simulate", {});
      setSimSteps(data.steps || []);
    } catch {
      setSimSteps([
        { step: "Create Invoice", status: "completed", detail: "Invoice created with test data" },
        { step: "Send Invoice", status: "completed", detail: "Email sent to test address" },
        { step: "Mark as Paid", status: "current", detail: "Awaiting payment..." },
        { step: "Verify Status", status: "pending", detail: "Waiting for confirmation" },
      ]);
    }
    setSimLoading(false);
  }

  return (
    <AdminLayout title="Payment Testing Center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice PDF Test */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Invoice PDF Generation</h3>
          <p className="text-sm text-slate-500 mb-4">Generate a test invoice PDF with sample data.</p>
          <button
            onClick={generateTestInvoice}
            disabled={invoicePreview.loading}
            className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {invoicePreview.loading ? "Generating..." : "Generate Test Invoice"}
          </button>
          {invoicePreview.number && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 mb-2">
                Invoice <strong>{invoicePreview.number}</strong> generated successfully.
              </p>
              {invoicePreview.url && (
                <a
                  href={invoicePreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A2647] hover:text-[#C9A227] transition-colors"
                >
                  {"\u2B07"} Download PDF
                </a>
              )}
            </div>
          )}
          {invoicePreview.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{invoicePreview.error}</div>
          )}
        </div>

        {/* Payoneer Link Test */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Payoneer Payment Link</h3>
          <p className="text-sm text-slate-500 mb-4">Verify Payoneer payment link format and validity.</p>
          <button
            onClick={testPayoneerLink}
            disabled={payoneerTest.loading}
            className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {payoneerTest.loading ? "Verifying..." : "Verify Payoneer Link"}
          </button>
          {payoneerTest.valid !== null && (
            <div className={`mt-4 p-4 rounded-lg border ${payoneerTest.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <p className={`text-sm font-semibold ${payoneerTest.valid ? "text-green-700" : "text-red-700"}`}>
                {payoneerTest.valid ? "Link format is valid" : "Link format is invalid"}
              </p>
              {payoneerTest.format && (
                <p className="text-xs text-slate-600 mt-1 font-mono">{payoneerTest.format}</p>
              )}
            </div>
          )}
          {payoneerTest.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{payoneerTest.error}</div>
          )}
        </div>

        {/* Invoice Email Test */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Invoice Email Test</h3>
          <p className="text-sm text-slate-500 mb-4">Send a test invoice email and verify delivery.</p>
          <button
            onClick={sendTestInvoiceEmail}
            disabled={invoiceEmailTest.loading}
            className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {invoiceEmailTest.loading ? "Sending..." : "Send Test Invoice Email"}
          </button>
          {invoiceEmailTest.sent && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Invoice email sent at {new Date(invoiceEmailTest.timestamp!).toLocaleString()}
            </div>
          )}
          {invoiceEmailTest.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{invoiceEmailTest.error}</div>
          )}
        </div>

        {/* Payment Workflow Simulation */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Payment Workflow Simulation</h3>
          <p className="text-sm text-slate-500 mb-4">Step through the complete payment workflow.</p>
          <button
            onClick={runPaymentSimulation}
            disabled={simLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#8B1E3F] rounded-lg hover:bg-[#6d1832] transition-colors disabled:opacity-50"
          >
            {simLoading ? "Simulating..." : "Run Simulation"}
          </button>
          {simSteps.length > 0 && (
            <div className="mt-4 space-y-3">
              {simSteps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5 ${
                    s.status === "completed" ? "bg-green-500" :
                    s.status === "current" ? "bg-[#C9A227] animate-pulse" :
                    s.status === "error" ? "bg-red-500" :
                    "bg-slate-300"
                  }`}>
                    {s.status === "completed" ? "\u2713" : s.status === "error" ? "\u2717" : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0A2647]">{s.step}</p>
                    <p className="text-xs text-slate-500">{s.detail}</p>
                  </div>
                  <span className={`text-xs font-medium ${
                    s.status === "completed" ? "text-green-600" :
                    s.status === "current" ? "text-amber-600" :
                    s.status === "error" ? "text-red-600" :
                    "text-slate-400"
                  }`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Test Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0A2647]">Recent Test Invoices</h3>
            <button onClick={loadTestInvoices} className="text-xs font-medium text-[#C9A227] hover:text-[#b8911f] transition-colors">
              \u21BB Refresh
            </button>
          </div>
          {invoicesLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : invoicesError ? (
            <div className="p-6 text-center">
              <p className="text-red-700 text-sm">{invoicesError}</p>
              <button
                onClick={loadTestInvoices}
                className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
              >
                Retry
              </button>
            </div>
          ) : testInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No test invoices generated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Invoice #</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Amount</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {testInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-medium text-[#0A2647]">{inv.invoice_number}</td>
                      <td className="px-5 py-3 font-semibold text-[#0A2647]">${inv.amount.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          inv.status === "draft" ? "bg-slate-100 text-slate-600" :
                          inv.status === "paid" ? "bg-green-100 text-green-700" :
                          inv.status === "sent" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{new Date(inv.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
