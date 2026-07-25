"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface LoginEntry {
  id: number;
  type: string;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean | number;
  failure_reason: string | null;
  created_at: string;
}

interface AssignedLead {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  type: string | null;
  status: string | null;
  score: number | null;
  created_at: string;
}

interface ActivityEntry {
  id: number;
  action: string;
  subject_type: string | null;
  subject_id: number | null;
  details: string | null;
  created_at: string;
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
  stats: { properties: number; leads_assigned: number; login_count: number };
  login_history: LoginEntry[];
  assigned_leads: AssignedLead[];
  activity: ActivityEntry[];
}

const TABS = ["Profile", "Activity", "Login History", "Assigned Leads"] as const;
type Tab = (typeof TABS)[number];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

function chip(v?: string | null) {
  return statusColors[(v ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-700";
}

function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { success, notifyError } = useToast();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", status: "" });

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet<{ data: UserDetail }>(`/admin/users/${id}`);
      const u = res?.data;
      setUser(u ?? null);
      if (u) {
        setForm({
          name: u.name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          role: u.role ?? "",
          status: u.status ?? "",
        });
      }
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Could not load this user. Please try again."
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchUser();
  }, [id, fetchUser]);

  async function saveProfile() {
    try {
      setSaving(true);
      await apiPut(`/admin/users/${id}`, form);
      success("User profile updated.");
      setEditing(false);
      await fetchUser();
    } catch (e) {
      // Keep the form open with the user's input intact so nothing is lost.
      notifyError(e, "Could not save this user. Please try again.", saveProfile);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="User Detail">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading user…</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout title="User Detail">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-700 font-medium">{error || "User not found."}</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={fetchUser}
              className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
            <Link
              href="/admin/users"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Detail">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-[#C9A227] rounded-full flex items-center justify-center text-[#0A2647] font-bold text-xl shrink-0">
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-[#0A2647]">{user.name}</h2>
              <span className={`px-2.5 py-1 text-xs rounded-full capitalize ${chip(user.status)}`}>
                {user.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {user.email}
              {user.phone ? ` · ${user.phone}` : ""}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
              <span>Role: <span className="font-medium text-gray-700 capitalize">{user.role}</span></span>
              <span>Joined: <span className="font-medium text-gray-700">{new Date(user.created_at).toLocaleDateString()}</span></span>
              <span>
                Last login:{" "}
                <span className="font-medium text-gray-700">
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never recorded"}
                </span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3360] transition-colors"
            >
              {editing ? "Cancel Edit" : "Edit Profile"}
            </button>
            <a
              href={`mailto:${user.email}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Send Email
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
          {[
            { label: "Properties", value: user.stats.properties },
            { label: "Leads Assigned", value: user.stats.leads_assigned },
            { label: "Sign-ins Recorded", value: user.stats.login_count },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-[#0A2647]">{s.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-[#C9A227] text-[#0A2647]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile */}
          {activeTab === "Profile" && (
            <div className="max-w-2xl space-y-6">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="u-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input id="u-name" name="name" type="text" autoComplete="name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
                    </div>
                    <div>
                      <label htmlFor="u-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input id="u-email" name="email" type="email" autoComplete="email" inputMode="email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
                    </div>
                    <div>
                      <label htmlFor="u-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input id="u-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]" />
                    </div>
                    <div>
                      <label htmlFor="u-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
                        {["agent", "buyer", "seller", "investor", "wholesaler", "broker", "lender", "title", "staff", "admin", "super_admin"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="u-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select id="u-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]">
                        {["active", "inactive", "pending", "suspended"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={saveProfile} disabled={saving}
                      className="px-5 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold text-sm hover:bg-[#b8911f] disabled:opacity-60">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={() => setEditing(false)} disabled={saving}
                      className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Account Information</h3>
                    {[
                      { l: "Full Name", v: user.name },
                      { l: "Email Address", v: user.email },
                      { l: "Phone Number", v: user.phone || "Not provided" },
                    ].map((f) => (
                      <div key={f.l}>
                        <p className="text-xs text-gray-500">{f.l}</p>
                        <p className="text-sm font-medium text-gray-900">{f.v}</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-xs text-gray-500">Role</p>
                      <span className="px-2.5 py-1 bg-[#0A2647] text-white text-xs rounded-full capitalize">{user.role}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Status &amp; Activity</h3>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`px-2.5 py-1 text-xs rounded-full capitalize ${chip(user.status)}`}>{user.status}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Joined Date</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Login</p>
                      <p className="text-sm font-medium text-gray-900">
                        {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity — backed by admin_activity_logs */}
          {activeTab === "Activity" && (
            user.activity.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-3xl mb-3" aria-hidden="true">📋</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No recorded activity</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Admin actions performed by this user will appear here once they are logged.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {user.activity.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-4 pl-10">
                      <div className="absolute left-2.5 w-7 h-7 bg-white border-2 border-[#C9A227] rounded-full flex items-center justify-center text-xs z-10" aria-hidden="true">•</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        {item.subject_type && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.subject_type.split("\\").pop()} #{item.subject_id}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Login History — real auth_logs */}
          {activeTab === "Login History" && (
            user.login_history.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No sign-in records for this user.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A2647] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date &amp; Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Event</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Device / Browser</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.login_history.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{new Date(e.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{e.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{e.ip_address || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={e.user_agent ?? ""}>
                          {e.user_agent || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs rounded-full ${e.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {e.success ? "Success" : "Failed"}
                          </span>
                          {!e.success && e.failure_reason && (
                            <span className="block text-xs text-red-500 mt-1">{e.failure_reason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Assigned Leads — real leads.assigned_to */}
          {activeTab === "Assigned Leads" && (
            user.assigned_leads.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-3xl mb-3" aria-hidden="true">🎯</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No leads assigned</h3>
                <p className="text-xs text-gray-500">Assign leads to this user from the CRM pipeline.</p>
                <Link href="/admin/leads" className="inline-block mt-4 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-semibold hover:bg-[#b8911f]">
                  Open Leads
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A2647] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Lead #</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.assigned_leads.map((lead) => {
                      const score = lead.score ?? 0;
                      return (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">#{lead.id}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || lead.email || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">{lead.type || "—"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${Math.min(100, score)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{score}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 text-xs rounded-full capitalize ${chip(lead.status)}`}>{lead.status || "—"}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(lead.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
