"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface EmailTemplate {
  id: number;
  name: string;
  slug: string;
  type: string;
  subject: string;
  html_body: string;
  text_body?: string | null;
  is_active: boolean;
}

const emptyForm = {
  name: "",
  type: "marketing",
  subject: "",
  html_body: "",
  text_body: "",
  is_active: true,
};

export default function EmailTemplatesPage() {
  const { success, notifyError } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<EmailTemplate[]>("/email-templates");
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      notifyError(err, "Email templates could not be loaded.");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: EmailTemplate) => {
    setEditing(t);
    setForm({
      name: t.name,
      type: t.type,
      subject: t.subject,
      html_body: t.html_body,
      text_body: t.text_body || "",
      is_active: t.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.subject || !form.html_body) {
      notifyError(new Error("Name, subject, and body are required."));
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await apiPut(`/email-templates/${editing.id}`, form);
        success("Template updated.", "Email");
      } else {
        await apiPost("/email-templates", form);
        success("Template created.", "Email");
      }
      setShowModal(false);
      await fetchTemplates();
    } catch (err) {
      notifyError(err, "Template could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    try {
      await apiDelete(`/email-templates/${id}`);
      success("Template deleted.", "Email");
      await fetchTemplates();
    } catch (err) {
      notifyError(err, "Template could not be deleted.");
    }
  };

  return (
    <AdminLayout title="Email Templates">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-slate-500">{templates.length} template(s)</p>
        <div className="flex gap-2">
          <Link href="/admin/email-templates/editor" className="px-4 py-2 border rounded-lg text-sm font-medium">
            Visual Editor
          </Link>
          <button onClick={openCreate} className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold">
            + New Template
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading...</div>
        ) : templates.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No templates yet. Create one.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Name</th>
                <th className="px-4 py-3 text-left text-sm">Type</th>
                <th className="px-4 py-3 text-left text-sm">Subject</th>
                <th className="px-4 py-3 text-left text-sm">Active</th>
                <th className="px-4 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-navy">{t.name}</td>
                  <td className="px-4 py-3 text-sm capitalize">{t.type}</td>
                  <td className="px-4 py-3 text-sm truncate max-w-xs">{t.subject}</td>
                  <td className="px-4 py-3 text-sm">{t.is_active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => openEdit(t)} className="text-sm text-gold font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-sm text-red-600 font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-navy">{editing ? "Edit Template" : "New Template"}</h3>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="marketing">Marketing</option>
              <option value="transactional">Transactional</option>
              <option value="notification">Notification</option>
            </select>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              rows={8}
              placeholder="HTML body"
              value={form.html_body}
              onChange={(e) => setForm({ ...form, html_body: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
