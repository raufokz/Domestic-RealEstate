"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useToast } from "@/components/Toast";

interface MarketplaceAdminLead {
  id: number;
  lead_number: string;
  full_name?: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  location: string | null;
  state: string | null;
  city: string | null;
  marketplace_title: string | null;
  marketplace_category: string | null;
  marketplace_price: string | null;
  marketplace_status: string;
  listed_at: string | null;
  reserved_by: number | null;
  sold_to: number | null;
  sold_at: string | null;
  created_at: string;
  reserved_by_user?: { name?: string; email?: string } | null;
  sold_to_user?: { name?: string; email?: string } | null;
  active_purchase?: {
    id: number;
    user_id: number;
    user_name?: string;
    user_email?: string;
    status: string;
    amount: number;
    purchased_at: string | null;
  } | null;
}

interface PurchaseRecord {
  id: number;
  lead_id: number;
  user_id: number;
  amount: string;
  status: "pending" | "paid" | "refunded" | "cancelled";
  notes: string | null;
  created_at: string;
  lead?: { marketplace_title: string; lead_number: string };
  user?: { name: string; email: string };
}

interface PaymentLog {
  id: number;
  purchase_id: number | null;
  lead_id: number;
  user_id: number;
  payment_gateway: string;
  gateway_transaction_id: string | null;
  amount: string;
  currency: string;
  status: string;
  error_message: string | null;
  created_at: string;
  lead?: { marketplace_title: string; lead_number: string };
  user?: { name: string; email: string };
}

interface PplUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  ppl_eligible: boolean;
  ppl_access_enabled: boolean;
}

interface AnalyticsData {
  kpis: {
    total_leads: number;
    available_leads: number;
    reserved_leads: number;
    sold_leads: number;
    total_revenue: number;
    conversion_rate: number;
  };
  top_categories: { marketplace_category: string; total_count: number; sold_count: number }[];
  top_buyers: { user_id: number; purchases_count: number; total_spent: number; user?: { name: string; email: string } }[];
  monthly_reports: { month: string; revenue: number; count: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface CandidateLead {
  id: number;
  lead_number: string;
  full_name?: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  marketplace_status?: string;
}

const CATEGORIES = ["Buyer", "Seller", "Investor", "Wholesale", "Refinance", "Rental", "Other"];
const LEAD_TYPES = ["buyer", "seller", "investor", "realtor", "vendor"];

export default function AdminMarketplacePage() {
  const { success, notifyError } = useToast();
  const [activeTab, setActiveTab] = useState<"leads" | "purchases" | "payment_logs" | "users" | "analytics">("leads");

  // Sub-data fetches
  const { data: leadsData, loading: leadsLoading, refetch: refetchLeads } = useFetch<PaginatedResponse<MarketplaceAdminLead>>("/admin/marketplace?per_page=50");
  const { data: purchasesData, loading: purchasesLoading, refetch: refetchPurchases } = useFetch<PaginatedResponse<PurchaseRecord>>("/admin/marketplace/purchases?per_page=50");
  const { data: logsData, loading: logsLoading, refetch: refetchLogs } = useFetch<PaginatedResponse<PaymentLog>>("/admin/marketplace/payment-logs?per_page=50");
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useFetch<PaginatedResponse<PplUser>>("/admin/marketplace/users?per_page=50");
  const { data: analyticsData, loading: analyticsLoading, refetch: refetchAnalytics } = useFetch<AnalyticsData>("/admin/marketplace/analytics");
  const { data: candidatesData } = useFetch<PaginatedResponse<CandidateLead>>("/admin/leads?per_page=100");

  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState<MarketplaceAdminLead | null>(null);
  const [busy, setBusy] = useState(false);

  const leads = leadsData?.data || [];
  const purchases = purchasesData?.data || [];
  const logs = logsData?.data || [];
  const usersList = usersData?.data || [];
  const candidates = candidatesData?.data || [];

  async function action(path: string, message: string, reloadType: "leads" | "purchases" | "users" = "leads") {
    if (busy) return;
    setBusy(true);
    try {
      await apiPost(path);
      success(message);
      if (reloadType === "leads") refetchLeads();
      if (reloadType === "purchases") { refetchPurchases(); refetchLeads(); }
      if (reloadType === "users") refetchUsers();
      refetchAnalytics();
    } catch (e) {
      notifyError(e, "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePermission(userId: number, field: "ppl_eligible" | "ppl_access_enabled", currentValue: boolean) {
    if (busy) return;
    setBusy(true);
    try {
      await apiPost(`/admin/marketplace/users/${userId}/permissions`, { [field]: !currentValue });
      success("User permissions updated.");
      refetchUsers();
    } catch (e) {
      notifyError(e, "Failed to update user permission.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout title="Pay-Per-Lead Marketplace Hub">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
          <TabButton active={activeTab === "leads"} label="🏷️ Leads Directory" onClick={() => setActiveTab("leads")} />
          <TabButton active={activeTab === "purchases"} label="💳 Purchases & Refunds" onClick={() => setActiveTab("purchases")} />
          <TabButton active={activeTab === "payment_logs"} label="📜 Payment Audit Logs" onClick={() => setActiveTab("payment_logs")} />
          <TabButton active={activeTab === "users"} label="👥 User Permissions" onClick={() => setActiveTab("users")} />
          <TabButton active={activeTab === "analytics"} label="📊 Analytics & Revenue" onClick={() => setActiveTab("analytics")} />
        </div>

        {/* Tab 1: Leads Directory */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#0A2647]">Marketplace Listings</h2>
              <button
                onClick={() => setCreateOpen(true)}
                className="bg-[#C9A227] text-[#0A2647] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#b8911f] transition shadow-sm"
              >
                + Create &amp; Schedule Lead
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {leadsLoading ? (
                <div className="p-8 text-center text-slate-400">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="p-10 text-center text-slate-500">No marketplace leads found.</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Lead</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Buyer / Reserver</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#0A2647]">{lead.marketplace_title || lead.lead_number}</p>
                          <p className="text-xs text-slate-400">{lead.lead_number} · {lead.location || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#0A2647]">${Number(lead.marketplace_price).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            lead.marketplace_status === "available" ? "bg-emerald-100 text-emerald-800" :
                            lead.marketplace_status === "reserved" ? "bg-amber-100 text-amber-800" :
                            lead.marketplace_status === "sold" ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            {lead.marketplace_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {lead.sold_to_user?.name || lead.reserved_by_user?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                          {lead.marketplace_status === "none" && (
                            <button
                              onClick={() => action(`/admin/marketplace/leads/${lead.id}/publish`, "Lead published.")}
                              className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg"
                            >
                              Publish
                            </button>
                          )}
                          {lead.marketplace_status === "available" && (
                            <>
                              <button
                                onClick={() => setAssignOpen(lead)}
                                className="text-xs font-bold text-[#0A2647] bg-slate-100 px-3 py-1.5 rounded-lg"
                              >
                                Manual Assign
                              </button>
                              <button
                                onClick={() => action(`/admin/marketplace/leads/${lead.id}/unpublish`, "Lead unpublished.")}
                                className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg"
                              >
                                Unpublish
                              </button>
                            </>
                          )}
                          {lead.marketplace_status === "sold" && (
                            <button
                              onClick={() => action(`/admin/marketplace/leads/${lead.id}/relist`, "Lead re-listed.")}
                              className="text-xs font-bold text-[#C9A227] bg-amber-50 px-3 py-1.5 rounded-lg"
                            >
                              Relist
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Purchases & Refunds */}
        {activeTab === "purchases" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h2 className="font-bold text-[#0A2647]">Purchase &amp; Order Management</h2>
            </div>
            {purchasesLoading ? (
              <div className="p-8 text-center text-slate-400">Loading purchases...</div>
            ) : purchases.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No purchase records available.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.id}</td>
                      <td className="px-4 py-3 font-semibold text-[#0A2647]">{p.user?.name || `User #${p.user_id}`}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{p.lead?.marketplace_title || p.lead?.lead_number}</td>
                      <td className="px-4 py-3 font-bold text-[#0A2647]">${Number(p.amount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          p.status === "paid" ? "bg-emerald-100 text-emerald-800" :
                          p.status === "pending" ? "bg-amber-100 text-amber-800" :
                          p.status === "refunded" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => action(`/admin/marketplace/purchases/${p.id}/confirm`, "Payment confirmed.", "purchases")}
                              className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-lg"
                            >
                              Confirm Payment
                            </button>
                            <button
                              onClick={() => action(`/admin/marketplace/purchases/${p.id}/cancel`, "Purchase cancelled.", "purchases")}
                              className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {p.status === "paid" && (
                          <button
                            onClick={() => action(`/admin/marketplace/purchases/${p.id}/refund`, "Purchase refunded.", "purchases")}
                            className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg"
                          >
                            Refund Buyer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Payment Audit Logs */}
        {activeTab === "payment_logs" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h2 className="font-bold text-[#0A2647]">Payment Transaction Logs</h2>
            </div>
            {logsLoading ? (
              <div className="p-8 text-center text-slate-400">Loading audit logs...</div>
            ) : logs.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No payment transaction logs found.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold uppercase text-slate-400">Time</th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-slate-400">User</th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-slate-400">Gateway</th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-slate-400">Txn ID</th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-slate-400">Amount</th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-[#0A2647]">{log.user?.name || log.user_id}</td>
                      <td className="px-4 py-3 uppercase font-bold text-slate-600">{log.payment_gateway}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{log.gateway_transaction_id || "—"}</td>
                      <td className="px-4 py-3 font-bold text-[#0A2647]">${Number(log.amount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          log.status === "successful" ? "bg-emerald-100 text-emerald-800" :
                          log.status === "refunded" ? "bg-purple-100 text-purple-800" : "bg-red-100 text-red-800"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 4: User Permissions */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h2 className="font-bold text-[#0A2647]">PPL Program Access Controls</h2>
            </div>
            {usersLoading ? (
              <div className="p-8 text-center text-slate-400">Loading user accounts...</div>
            ) : usersList.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No users found.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">User</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">Role</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-400">PPL Eligible</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-400">PPL Access Enabled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#0A2647]">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs uppercase font-semibold text-slate-500">{u.role}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => togglePermission(u.id, "ppl_eligible", u.ppl_eligible)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                            u.ppl_eligible ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {u.ppl_eligible ? "Eligible" : "Ineligible"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => togglePermission(u.id, "ppl_access_enabled", u.ppl_access_enabled)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                            u.ppl_access_enabled ? "bg-emerald-600 text-white" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.ppl_access_enabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 5: Analytics Dashboard */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="p-8 text-center text-slate-400">Loading analytics data...</div>
            ) : !analyticsData ? (
              <div className="p-10 text-center text-slate-500">Analytics unavailable.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard label="Total Revenue" value={`$${analyticsData.kpis.total_revenue.toLocaleString()}`} tone="text-emerald-600" />
                  <KpiCard label="Total PPL Leads" value={analyticsData.kpis.total_leads} tone="text-[#0A2647]" />
                  <KpiCard label="Leads Sold" value={analyticsData.kpis.sold_leads} tone="text-purple-600" />
                  <KpiCard label="Conversion Rate" value={`${analyticsData.kpis.conversion_rate}%`} tone="text-amber-600" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Categories */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-[#0A2647] mb-4">Top Lead Categories</h3>
                    <div className="space-y-3">
                      {analyticsData.top_categories.map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                          <span className="font-semibold text-slate-700">{cat.marketplace_category || "Uncategorized"}</span>
                          <span className="text-xs font-bold text-slate-500">{cat.sold_count} sold / {cat.total_count} total</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Buyers */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-[#0A2647] mb-4">Top Lead Buyers</h3>
                    <div className="space-y-3">
                      {analyticsData.top_buyers.map((buyer, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                          <div>
                            <p className="font-semibold text-[#0A2647]">{buyer.user?.name || `User #${buyer.user_id}`}</p>
                            <p className="text-xs text-slate-400">{buyer.purchases_count} leads purchased</p>
                          </div>
                          <span className="font-extrabold text-emerald-600">${Number(buyer.total_spent).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {createOpen && (
        <CreateLeadModal
          candidates={candidates}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            refetchLeads();
            refetchAnalytics();
          }}
        />
      )}

      {/* Manual Assign Modal */}
      {assignOpen && (
        <ManualAssignModal
          lead={assignOpen}
          users={usersList}
          onClose={() => setAssignOpen(null)}
          onAssigned={() => {
            setAssignOpen(null);
            refetchLeads();
            refetchPurchases();
            refetchAnalytics();
          }}
        />
      )}
    </AdminLayout>
  );
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
        active ? "border-[#0A2647] text-[#0A2647]" : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}

function CreateLeadModal({
  candidates,
  onClose,
  onCreated,
}: {
  candidates: CandidateLead[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { success, notifyError } = useToast();
  const [busy, setBusy] = useState(false);
  const [useExisting, setUseExisting] = useState(false);
  const [form, setForm] = useState({
    lead_id: "",
    marketplace_title: "",
    marketplace_category: "Buyer",
    marketplace_description: "",
    marketplace_price: "",
    location: "",
    state: "",
    city: "",
    budget_min: "",
    budget_max: "",
    type: "buyer",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    notes: "",
    publish: true,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (busy) return;
    if (!form.marketplace_title.trim()) {
      notifyError(new Error("A marketplace title is required."), "Validation");
      return;
    }
    if (!form.marketplace_price || Number(form.marketplace_price) < 0) {
      notifyError(new Error("A valid price is required."), "Validation");
      return;
    }

    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        marketplace_title: form.marketplace_title.trim(),
        marketplace_category: form.marketplace_category || null,
        marketplace_description: form.marketplace_description.trim() || null,
        marketplace_price: Number(form.marketplace_price),
        location: form.location.trim() || null,
        state: form.state.trim() || null,
        city: form.city.trim() || null,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        type: form.type,
        publish: form.publish,
      };
      if (useExisting) {
        payload.lead_id = Number(form.lead_id);
      } else {
        payload.first_name = form.first_name.trim();
        payload.last_name = form.last_name.trim() || null;
        payload.email = form.email.trim();
        payload.phone = form.phone.trim() || null;
        payload.notes = form.notes.trim() || null;
      }
      await apiPost("/admin/marketplace/leads", payload);
      success("Marketplace lead created.");
      onCreated();
    } catch (e) {
      notifyError(e, "Could not create lead.");
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#0A2647]";
  const label = "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#0A2647]">Create Marketplace Lead</h3>
          <button onClick={onClose} className="text-slate-400 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={label}>Marketplace Title *</label>
            <input className={input} value={form.marketplace_title} onChange={(e) => set("marketplace_title", e.target.value)} placeholder="e.g. Qualified Buyer in Miami" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Category</label>
              <select className={input} value={form.marketplace_category} onChange={(e) => set("marketplace_category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Price ($) *</label>
              <input className={input} type="number" value={form.marketplace_price} onChange={(e) => set("marketplace_price", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>First Name *</label>
              <input className={input} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
            </div>
            <div>
              <label className={label}>Email *</label>
              <input className={input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea className={input} rows={3} value={form.marketplace_description} onChange={(e) => set("marketplace_description", e.target.value)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={submit} disabled={busy} className="px-5 py-2 text-sm font-bold bg-[#C9A227] text-[#0A2647] rounded-lg">
            {busy ? "Saving..." : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManualAssignModal({
  lead,
  users,
  onClose,
  onAssigned,
}: {
  lead: MarketplaceAdminLead;
  users: PplUser[];
  onClose: () => void;
  onAssigned: () => void;
}) {
  const { success, notifyError } = useToast();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!selectedUserId) return;
    setBusy(true);
    try {
      await apiPost(`/admin/marketplace/leads/${lead.id}/assign`, { user_id: Number(selectedUserId) });
      success("Lead manually assigned.");
      onAssigned();
    } catch (e) {
      notifyError(e, "Assignment failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#0A2647]">Manually Assign Lead</h3>
        <p className="text-xs text-slate-500">Assign "{lead.marketplace_title}" directly to a buyer account.</p>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Buyer</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Choose a user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={submit} disabled={busy || !selectedUserId} className="px-5 py-2 text-sm font-bold bg-[#0A2647] text-white rounded-lg">
            {busy ? "Assigning..." : "Assign Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}
