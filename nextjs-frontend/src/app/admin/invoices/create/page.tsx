"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface Client {
  id: number;
  name: string;
  email: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const EMPTY_ITEM: InvoiceItem = { description: "", quantity: 1, rate: 0, amount: 0 };

export default function CreateInvoicePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);
  const [taxRate, setTaxRate] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<"draft" | "sent" | null>(null);
  const [savedResult, setSavedResult] = useState<{ success: boolean; invoice_number?: string; error?: string } | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setClientsLoading(true);
    try {
      const data = await apiGet<Client[]>("/admin/users");
      setClients(Array.isArray(data) ? data : []);
    } catch {
      /* silent */
    }
    setClientsLoading(false);
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    setItems((prev) => {
      const updated = [...prev];
      if (field === "quantity" || field === "rate") {
        updated[index] = { ...updated[index], [field]: Number(value) || 0 };
        updated[index].amount = updated[index].quantity * updated[index].rate;
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveInvoice(status: "draft" | "sent") {
    setSaving(true);
    setSavingAction(status);
    setSavedResult(null);
    try {
      const data = await apiPost<{ id: number; invoice_number: string }>("/admin/invoices", {
        user_id: selectedClient,
        items: items.map((i) => ({ description: i.description, quantity: i.quantity, rate: i.rate })),
        tax_rate: taxRate,
        due_at: dueDate || null,
        notes,
      });

      // Creation always lands as a draft — "Send Invoice" follows up with the
      // real Payoneer-send endpoint rather than duplicating that logic here.
      if (status === "sent") {
        await apiPost(`/admin/invoices/${data.id}/send`);
      }

      setSavedResult({ success: true, invoice_number: data.invoice_number });
    } catch (e: any) {
      setSavedResult({ success: false, error: e?.message || "Failed to save invoice" });
    }
    setSaving(false);
    setSavingAction(null);
  }

  function formatMoney(n: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  }

  return (
    <AdminLayout title="Create Invoice">
      {savedResult?.success ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <div className="text-4xl mb-4">{"\u2705"}</div>
          <h2 className="text-xl font-bold text-[#0A2647] mb-2">Invoice Created</h2>
          <p className="text-slate-500 mb-4">
            Invoice <strong>{savedResult.invoice_number}</strong> has been created successfully.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/admin/invoices" className="px-4 py-2 text-sm font-semibold text-[#0A2647] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              View All Invoices
            </a>
            <button onClick={() => { setSavedResult(null); setItems([{ ...EMPTY_ITEM }]); setSelectedClient(""); setTaxRate(0); setDueDate(""); setNotes(""); }} className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors">
              Create Another
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700">
            <h3 className="font-semibold text-sm text-[#0A2647] flex items-center gap-2 mb-2">
              <span>💡</span> How to Create & Issue Invoices
            </h3>
            <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
              <li><strong>Client:</strong> Select an active user or client from your account database.</li>
              <li><strong>Line Items:</strong> Add billing items with descriptions, quantities, and unit rates.</li>
              <li><strong>Draft vs Send:</strong> Save as <em>Draft</em> to review later, or click <em>Send Invoice</em> to dispatch via email.</li>
            </ul>
          </div>

          {/* Client Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-[#0A2647] mb-4">Client</h3>
            {clientsLoading ? (
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0A2647]">Invoice Items</h3>
              <button onClick={addItem} className="text-sm font-semibold text-[#C9A227] hover:text-[#b8911f] transition-colors">
                + Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left pb-2 font-semibold text-slate-600">Description</th>
                    <th className="text-left pb-2 font-semibold text-slate-600 w-24">Qty</th>
                    <th className="text-left pb-2 font-semibold text-slate-600 w-32">Rate ($)</th>
                    <th className="text-left pb-2 font-semibold text-slate-600 w-32">Amount</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2 pr-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(i, "description", e.target.value)}
                          placeholder="Item description"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227]"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227]"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(i, "rate", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227]"
                        />
                      </td>
                      <td className="py-2 pr-3 px-3 py-2 font-semibold text-[#0A2647]">
                        {formatMoney(item.amount)}
                      </td>
                      <td className="py-2">
                        {items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 transition-colors text-lg">
                            {"\u2715"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals + Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Totals */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-[#0A2647] mb-4">Totals</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-[#0A2647]">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">Tax Rate (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] text-right"
                  />
                  <span className="text-sm text-slate-500">= {formatMoney(taxAmount)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-[#0A2647]">Total</span>
                  <span className="text-lg font-bold text-[#0A2647]">{formatMoney(total)}</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-[#0A2647] mb-4">Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional notes for the invoice..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-600 mb-1">Payment Method</p>
                  <p className="text-sm font-semibold text-[#0A2647]">Payoneer</p>
                </div>
              </div>
            </div>
          </div>

          {savedResult?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{savedResult.error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => saveInvoice("draft")}
              disabled={saving || !selectedClient}
              className="px-6 py-2.5 text-sm font-semibold text-[#0A2647] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {saving && savingAction === "draft" ? "Saving..." : "Save as Draft"}
            </button>
            <button
              onClick={() => saveInvoice("sent")}
              disabled={saving || !selectedClient}
              className="px-6 py-2.5 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
            >
              {saving && savingAction === "sent" ? "Sending..." : "Send Invoice"}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
