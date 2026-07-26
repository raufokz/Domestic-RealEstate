"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface ContactGroup {
  id: number;
  name: string;
  description: string | null;
  contacts_count: number;
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  type: string[] | null;
  status: string;
  source: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  tags: string[] | null;
  assigned_to: number | null;
  groups: ContactGroup[];
  created_at: string;
}

interface ContactStats {
  total: number;
  active: number;
  unsubscribed: number;
  by_source: { source: string | null; count: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  type: [] as string[],
  status: "active",
  source: "",
  company: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  tags: [] as string[],
  group_ids: [] as number[],
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  unsubscribed: "bg-red-100 text-red-800",
  lead: "bg-blue-100 text-blue-800",
};

const typeOptions = ["buyer", "seller", "investor", "tenant", "vendor", "agent"];
const sourceOptions = ["website", "referral", "social", "manual", "import", "form", "other"];

export default function ContactsPage() {
  const { success, notifyError } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [tagInput, setTagInput] = useState("");

  const fetchContacts = useCallback(async (page: number, status: string, type: string, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "20");
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      if (q.trim()) params.set("search", q.trim());
      const res = await apiGet<PaginatedResponse<Contact>>(`/admin/contacts?${params.toString()}`);
      setContacts(res.data);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiGet<ContactStats>("/admin/contacts/stats");
      setStats(res);
    } catch (e) {
      // Do not leave stale or zeroed stats on screen pretending to be real.
      setStats(null);
      notifyError(e, "Could not load contact statistics.");
    }
  }, [notifyError]);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await apiGet<ContactGroup[]>("/admin/contact-groups");
      setGroups(res);
    } catch (e) {
      setGroups([]);
      notifyError(e, "Could not load contact groups.");
    }
  }, [notifyError]);

  useEffect(() => {
    fetchContacts(currentPage, filterStatus, filterType, search);
  }, [currentPage, filterStatus, filterType, fetchContacts]);

  useEffect(() => {
    fetchStats();
    fetchGroups();
  }, [fetchStats, fetchGroups]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchContacts(1, filterStatus, filterType, search);
  };

  const openCreate = () => {
    setEditingContact(null);
    setForm(emptyForm);
    setTagInput("");
    setShowModal(true);
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email,
      phone: c.phone || "",
      type: c.type || [],
      status: c.status || "active",
      source: c.source || "",
      company: c.company || "",
      address: c.address || "",
      city: c.city || "",
      state: c.state || "",
      zip: c.zip || "",
      tags: c.tags || [],
      group_ids: c.groups?.map((g) => g.id) || [],
    });
    setTagInput("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingContact) {
        await apiPut(`/admin/contacts/${editingContact.id}`, form);
      } else {
        await apiPost("/admin/contacts", form);
      }
      setShowModal(false);
      fetchContacts(currentPage, filterStatus, filterType, search);
      fetchStats();
      fetchGroups();
      success(editingContact ? "Contact updated." : "Contact saved.", "CRM");
    } catch (err) {
      notifyError(err, "Contacts is not working because the contact could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await apiDelete(`/admin/contacts/${id}`);
      setShowDeleteConfirm(null);
      fetchContacts(currentPage, filterStatus, filterType, search);
      fetchStats();
      success("Contact deleted.", "CRM");
    } catch (err) {
      notifyError(err, "Contacts is not working because the contact could not be deleted.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) return;
    try {
      if (editingGroup) {
        await apiPut(`/admin/contact-groups/${editingGroup.id}`, groupForm);
      } else {
        await apiPost("/admin/contact-groups", groupForm);
      }
      setShowGroupModal(false);
      setGroupForm({ name: "", description: "" });
      setEditingGroup(null);
      fetchGroups();
      success(editingGroup ? "Group updated." : "Group created.", "CRM");
    } catch (err) {
      notifyError(err, "Contact groups is not working because the group could not be saved.");
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("Delete this group?")) return;
    try {
      await apiDelete(`/admin/contact-groups/${id}`);
      fetchGroups();
      success("Group deleted.", "CRM");
    } catch (err) {
      notifyError(err, "Contact groups is not working because the group could not be deleted.");
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
      setTagInput("");
    }
  };

  const removeTag = (t: string) => {
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) });
  };

  const toggleType = (t: string) => {
    setForm({
      ...form,
      type: form.type.includes(t) ? form.type.filter((x) => x !== t) : [...form.type, t],
    });
  };

  const toggleGroup = (gid: number) => {
    setForm({
      ...form,
      group_ids: form.group_ids.includes(gid) ? form.group_ids.filter((x) => x !== gid) : [...form.group_ids, gid],
    });
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
      ))}
    </tr>
  );

  return (
    <AdminLayout title="Contact Management">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Contacts</p>
          <p className="text-2xl font-bold text-[#0A2647] mt-1">{stats?.total ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats?.active ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unsubscribed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats?.unsubscribed ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Groups</p>
          <p className="text-2xl font-bold text-[#C9A227] mt-1">{groups.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="lead">Lead</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              >
                <option value="">All Types</option>
                {typeOptions.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <button onClick={handleSearch} className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#1a3a5c]">
                Search
              </button>
            </div>
            <button onClick={openCreate} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
              + Add Contact
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A2647] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Groups</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : contacts.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">No contacts found.</td></tr>
                  ) : (
                    contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-[#0A2647]">{c.first_name} {c.last_name}</span>
                          {c.company && <p className="text-xs text-gray-400">{c.company}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{c.email}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{c.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(c.type || []).map((t) => (
                              <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full capitalize">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs rounded-full ${statusColors[c.status] || "bg-gray-100 text-gray-700"}`}>
                            {c.status?.charAt(0).toUpperCase() + (c.status?.slice(1) || "")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm capitalize">{c.source || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(c.groups || []).map((g) => (
                              <span key={g.id} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">{g.name}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => openEdit(c)} className="text-[#C9A227] hover:text-[#b8911f] text-sm font-medium mr-3">Edit</button>
                          <button onClick={() => setShowDeleteConfirm(c.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0A2647]">Contact Groups</h2>
              <button onClick={() => { setEditingGroup(null); setGroupForm({ name: "", description: "" }); setShowGroupModal(true); }} className="text-[#C9A227] hover:text-[#b8911f] text-sm font-semibold">+ Add</button>
            </div>
            <div className="space-y-2">
              {groups.length === 0 ? (
                <p className="text-sm text-gray-400">No groups yet.</p>
              ) : (
                groups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{g.name}</p>
                      <p className="text-xs text-gray-400">{g.contacts_count} contacts</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingGroup(g); setGroupForm({ name: g.name, description: g.description || "" }); setShowGroupModal(true); }} className="text-gray-400 hover:text-[#C9A227] text-xs">Edit</button>
                      <button onClick={() => handleDeleteGroup(g.id)} className="text-gray-400 hover:text-red-500 text-xs">Del</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-semibold text-[#0A2647]">{editingContact ? "Edit Contact" : "New Contact"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227]">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227]">
                    <option value="">Select source</option>
                    {sourceOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip</label>
                  <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((t) => (
                    <button key={t} type="button" onClick={() => toggleType(t)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${form.type.includes(t) ? "bg-[#0A2647] text-white border-[#0A2647]" : "bg-white text-gray-600 border-gray-300 hover:border-[#C9A227]"}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag and press Enter" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Add</button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.tags.map((t) => (
                      <span key={t} className="px-2 py-1 bg-[#0A2647] text-white text-xs rounded-full flex items-center gap-1">
                        {t} <button type="button" onClick={() => removeTag(t)} className="hover:text-[#C9A227]">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {groups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Groups</label>
                  <div className="flex flex-wrap gap-2">
                    {groups.map((g) => (
                      <button key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${form.group_ids.includes(g.id) ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"}`}>
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.first_name || !form.last_name || !form.email}
                className="px-6 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? "Saving..." : editingContact ? "Update Contact" : "Create Contact"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-semibold text-[#0A2647] mb-2">Delete Contact</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this contact? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Create/Edit Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#0A2647] mb-4">{editingGroup ? "Edit Group" : "New Group"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowGroupModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSaveGroup} disabled={!groupForm.name.trim()} className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-50">
                {editingGroup ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
