"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface MortgageData {
  applications: Array<{
    id: number;
    lender: string;
    amount: string;
    rate: string;
    status: string;
    date: string;
    monthlyPayment: string;
  }>;
}

const EMPTY_APP_FORM = { lender_name: "", amount: "", rate: "", status: "applied" };

export default function BuyerMortgagePage() {
  const [data, setData] = useState<MortgageData>({ applications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAppForm, setShowAppForm] = useState(false);
  const [appForm, setAppForm] = useState(EMPTY_APP_FORM);
  const [savingApp, setSavingApp] = useState(false);
  const { success, notifyError } = useToast();

  const [loanAmount, setLoanAmount] = useState("400000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [termYears, setTermYears] = useState("30");
  const [downPayment, setDownPayment] = useState("80000");

  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<MortgageData>("/buyer/mortgage");
      setData(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your mortgage applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogApplication(e: React.FormEvent) {
    e.preventDefault();
    setSavingApp(true);
    try {
      await apiPost("/buyer/mortgage", {
        lender_name: appForm.lender_name,
        amount: Number(appForm.amount),
        rate: appForm.rate ? Number(appForm.rate) : undefined,
        status: appForm.status,
        monthly_payment: monthlyPayment > 0 ? Math.round(monthlyPayment * 100) / 100 : undefined,
      });
      success("Application logged.");
      setShowAppForm(false);
      setAppForm(EMPTY_APP_FORM);
      fetchData();
    } catch (e) {
      notifyError(e, "Could not log this application.");
    } finally {
      setSavingApp(false);
    }
  }

  useEffect(() => {
    const principal = parseFloat(loanAmount) - parseFloat(downPayment || "0");
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseInt(termYears) * 12;

    if (principal > 0 && monthlyRate > 0 && numPayments > 0) {
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      const total = payment * numPayments;
      setMonthlyPayment(payment);
      setTotalInterest(total - principal);
      setTotalCost(total);
    } else {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalCost(0);
    }
  }, [loanAmount, interestRate, termYears, downPayment]);

  return (
    <BuyerLayout title="Mortgage" subtitle="Calculate payments and track your mortgage applications.">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
            <button onClick={fetchData} className="ml-3 underline font-semibold">Retry</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-[#0A2647] mb-5">Mortgage Calculator</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">Loan Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-[#C9A227]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 block mb-1.5">Interest Rate (%)</label>
                      <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-[#C9A227]" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 block mb-1.5">Term (years)</label>
                      <select value={termYears} onChange={(e) => setTermYears(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-[#C9A227]">
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="30">30 years</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">Down Payment</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-[#C9A227]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-[#0A2647] mb-5">Results</h2>
                <div className="space-y-5">
                  <div className="p-4 bg-[#0A2647]/5 rounded-xl text-center">
                    <p className="text-sm text-slate-500">Monthly Payment</p>
                    <p className="text-4xl font-bold text-[#0A2647] mt-1">
                      ${monthlyPayment > 0 ? monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500">Total Interest</p>
                      <p className="text-xl font-bold text-[#8B1E3F] mt-1">
                        ${totalInterest > 0 ? totalInterest.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500">Total Cost</p>
                      <p className="text-xl font-bold text-[#0A2647] mt-1">
                        ${totalCost > 0 ? totalCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0A2647]">My Mortgage Applications</h2>
                <button onClick={() => setShowAppForm((v) => !v)} className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
                  {showAppForm ? "Cancel" : "+ Log Application"}
                </button>
              </div>

              {showAppForm && (
                <form onSubmit={handleLogApplication} className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600 block mb-1">Lender Name *</label>
                    <input required value={appForm.lender_name} onChange={(e) => setAppForm((f) => ({ ...f, lender_name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Amount *</label>
                    <input required type="number" value={appForm.amount} onChange={(e) => setAppForm((f) => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Rate (%)</label>
                    <input type="number" step="0.01" value={appForm.rate} onChange={(e) => setAppForm((f) => ({ ...f, rate: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Status</label>
                    <select value={appForm.status} onChange={(e) => setAppForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
                      <option value="applied">Applied</option>
                      <option value="pre_approved">Pre-Approved</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <button type="submit" disabled={savingApp} className="bg-[#0A2647] text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                      {savingApp ? "Saving..." : "Save Application"}
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Lender</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Rate</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Monthly</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{app.lender}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{app.amount}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{app.rate}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-[#0A2647]">{app.monthlyPayment}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              app.status === "Pre-Approved" ? "bg-green-100 text-green-700" :
                              app.status === "Approved" ? "bg-blue-100 text-blue-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">{app.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.applications.length === 0 && (
                  <div className="p-8 text-center text-slate-400">No mortgage applications logged yet.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </BuyerLayout>
  );
}
