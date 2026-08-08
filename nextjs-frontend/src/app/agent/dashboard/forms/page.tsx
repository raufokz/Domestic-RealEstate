"use client";

import { useState, useEffect } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface CustomField {
  id: number;
  form_type: string;
  field_label: string;
  field_type: string;
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
}

const FORM_TYPES = [
  { key: "buyer", label: "Buyer Inquiry", icon: "🏠", desc: "For buyers searching for properties" },
  { key: "seller", label: "Seller Request", icon: "💰", desc: "For homeowners wanting to sell" },
  { key: "investor", label: "Investor Inquiry", icon: "📈", desc: "For investment opportunities" },
  { key: "contact", label: "General Contact", icon: "📧", desc: "General contact & inquiries" },
  { key: "rental", label: "Rental Inquiry", icon: "🔑", desc: "For rental property inquiries" },
  { key: "referral", label: "Referral Form", icon: "🤝", desc: "Agent-to-agent referrals" },
];

const FIELD_TYPES = [
  { key: "text", label: "Text Input", icon: "Aa" },
  { key: "textarea", label: "Text Area", icon: "¶" },
  { key: "dropdown", label: "Dropdown Select", icon: "▼" },
  { key: "checkbox", label: "Checkbox", icon: "☑" },
  { key: "date", label: "Date Picker", icon: "📅" },
  { key: "number", label: "Number", icon: "#" },
  { key: "email", label: "Email", icon: "@" },
  { key: "phone", label: "Phone", icon: "📞" },
  { key: "file", label: "File Upload", icon: "📎" },
];

const BASE_FIELDS: Record<string, { label: string; type: string }[]> = {
  buyer: [
    { label: "First Name", type: "text" },
    { label: "Last Name", type: "text" },
    { label: "Email", type: "email" },
    { label: "Phone", type: "phone" },
    { label: "Budget Range", type: "text" },
    { label: "Preferred Location", type: "text" },
    { label: "Property Type", type: "dropdown" },
    { label: "Bedrooms", type: "number" },
    { label: "Message", type: "textarea" },
  ],
  seller: [
    { label: "First Name", type: "text" },
    { label: "Last Name", type: "text" },
    { label: "Email", type: "email" },
    { label: "Phone", type: "phone" },
    { label: "Property Address", type: "text" },
    { label: "Expected Price", type: "number" },
    { label: "Timeline", type: "dropdown" },
    { label: "Message", type: "textarea" },
  ],
  investor: [
    { label: "First Name", type: "text" },
    { label: "Last Name", type: "text" },
    { label: "Email", type: "email" },
    { label: "Phone", type: "phone" },
    { label: "Investment Type", type: "dropdown" },
    { label: "Budget", type: "text" },
    { label: "ROI Expectation", type: "text" },
    { label: "Message", type: "textarea" },
  ],
  contact: [
    { label: "First Name", type: "text" },
    { label: "Last Name", type: "text" },
    { label: "Email", type: "email" },
    { label: "Subject", type: "text" },
    { label: "Message", type: "textarea" },
  ],
  rental: [
    { label: "First Name", type: "text" },
    { label: "Last Name", type: "text" },
    { label: "Email", type: "email" },
    { label: "Phone", type: "phone" },
    { label: "Move-in Date", type: "date" },
    { label: "Budget", type: "number" },
    { label: "Message", type: "textarea" },
  ],
  referral: [
    { label: "Referring Agent Name", type: "text" },
    { label: "Agent Email", type: "email" },
    { label: "Agent Phone", type: "phone" },
    { label: "Client Name", type: "text" },
    { label: "Client Phone", type: "phone" },
    { label: "Referral Fee %", type: "number" },
    { label: "Notes", type: "textarea" },
  ],
};

export default function AgentFormsPage() {
  const [activeForm, setActiveForm] = useState("buyer");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddField, setShowAddField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // New field form
  const [newField, setNewField] = useState({
    field_label: "",
    field_type: "text",
    options: "",
    is_required: false,
  });

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    email_on_submission: true,
    sms_on_submission: false,
    push_notification: true,
    daily_digest: false,
  });

  useEffect(() => {
    async function fetch() {
      try {
        const res = await apiGet<{ data: CustomField[] }>(`/agent/forms/fields?form_type=${activeForm}`);
        setCustomFields(res.data || []);
      } catch {
        setCustomFields([]);
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    fetch();
  }, [activeForm]);

  async function handleAddField() {
    if (!newField.field_label.trim()) return;
    setSaving(true);
    const payload = {
      form_type: activeForm,
      field_label: newField.field_label,
      field_type: newField.field_type,
      options: newField.field_type === "dropdown" ? newField.options.split(",").map((o) => o.trim()).filter(Boolean) : null,
      is_required: newField.is_required,
      sort_order: customFields.length,
    };
    try {
      const res = await apiPost<CustomField>("/agent/forms/fields", payload);
      setCustomFields((prev) => [...prev, res]);
    } catch {
      // Optimistic — add locally with a temp ID
      setCustomFields((prev) => [...prev, { ...payload, id: Date.now(), is_active: true } as CustomField]);
    }
    setNewField({ field_label: "", field_type: "text", options: "", is_required: false });
    setShowAddField(false);
    setSaving(false);
    setSavedMsg("Field added!");
    setTimeout(() => setSavedMsg(null), 3000);
  }

  async function handleToggleField(id: number) {
    setCustomFields((prev) =>
      prev.map((f) => f.id === id ? { ...f, is_active: !f.is_active } : f)
    );
    try { await apiPut(`/agent/forms/fields/${id}/toggle`); } catch { /* optimistic */ }
  }

  async function handleDeleteField(id: number) {
    if (!confirm("Remove this custom field?")) return;
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    try { await apiDelete(`/agent/forms/fields/${id}`); } catch { /* optimistic */ }
  }

  const baseFields = BASE_FIELDS[activeForm] || [];
  const allFields = [
    ...baseFields.map((f, i) => ({ id: -(i + 1), field_label: f.label, field_type: f.type, options: null as string[] | null, isBase: true, is_active: true, is_required: true })),
    ...customFields.map((f) => ({ id: f.id, field_label: f.field_label, field_type: f.field_type, options: f.options, isBase: false, is_active: f.is_active, is_required: f.is_required })),
  ];

  return (
    <AgentLayout title="Lead Forms" subtitle="Customize lead capture forms for your website and portals">
      <div className="space-y-6">
        {/* Form Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FORM_TYPES.map((ft) => (
            <button
              key={ft.key}
              onClick={() => setActiveForm(ft.key)}
              className={`p-3 rounded-xl border-2 text-left transition ${
                activeForm === ft.key
                  ? "border-[#C9A227] bg-[#C9A227]/5 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="text-xl">{ft.icon}</span>
              <p className="text-xs font-bold text-[#0A2647] mt-1">{ft.label}</p>
              <p className="text-[10px] text-slate-500">{ft.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Field Management */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-[#0A2647]">
                    {FORM_TYPES.find((f) => f.key === activeForm)?.label} — Form Fields
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {baseFields.length} base fields + {customFields.filter((f) => f.is_active).length} custom fields
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {savedMsg && <span className="text-xs text-emerald-600 font-bold">{savedMsg}</span>}
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      previewMode ? "bg-[#0A2647] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {previewMode ? "✕ Close Preview" : "👁 Preview"}
                  </button>
                  <button
                    onClick={() => setShowAddField(true)}
                    className="px-3 py-1.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-bold hover:bg-[#b8911f] transition"
                  >
                    + Add Custom Field
                  </button>
                </div>
              </div>

              {/* Fields List */}
              <div className="divide-y divide-slate-50">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A227] mx-auto" />
                  </div>
                ) : (
                  allFields.map((field, i) => (
                    <div
                      key={field.id}
                      className={`px-4 py-3 flex items-center gap-3 ${
                        !field.is_active ? "opacity-40" : ""
                      } ${field.isBase ? "" : "bg-blue-50/30"}`}
                    >
                      <span className="text-xs font-mono text-slate-400 w-5">{i + 1}</span>
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                        {FIELD_TYPES.find((ft) => ft.key === field.field_type)?.icon || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0A2647] truncate">
                          {field.field_label}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {field.field_type}
                          {field.is_required && " · Required"}
                          {field.isBase && " · System Field"}
                        </p>
                      </div>
                      {field.isBase ? (
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">Locked</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleField(field.id)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                              field.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {field.is_active ? "Active" : "Off"}
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-[#0A2647] mb-3">📬 Form Notification Preferences</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(notifPrefs).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                      className="rounded text-[#0A2647]"
                    />
                    {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Preview */}
          <div className="lg:col-span-2">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 sticky top-4">
              <p className="text-xs font-bold text-slate-400 mb-4">LIVE FORM PREVIEW</p>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h4 className="text-base font-bold text-[#0A2647] mb-1">
                  {FORM_TYPES.find((f) => f.key === activeForm)?.icon}{" "}
                  {FORM_TYPES.find((f) => f.key === activeForm)?.label}
                </h4>
                <p className="text-xs text-slate-500 mb-4">Fill out the form below and we'll get back to you shortly.</p>

                {allFields.filter((f) => f.is_active).map((field) => {
                  const label = field.field_label;
                  const type = field.field_type;
                  return (
                    <div key={field.id} className="mb-3">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        {label} {field.is_required && <span className="text-red-400">*</span>}
                      </label>
                      {type === "textarea" ? (
                        <textarea rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50" placeholder={`Enter ${label.toLowerCase()}...`} readOnly />
                      ) : type === "dropdown" ? (
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50" disabled>
                          <option>Select {label.toLowerCase()}...</option>
                          {(field.options || []).map((opt: string) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : type === "checkbox" ? (
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input type="checkbox" disabled className="rounded" /> {label}
                        </label>
                      ) : type === "file" ? (
                        <div className="w-full px-3 py-3 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 text-center bg-slate-50">
                          📎 Click to upload or drag & drop
                        </div>
                      ) : (
                        <input
                          type={type === "date" ? "date" : type === "number" ? "number" : type === "email" ? "email" : "text"}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                          placeholder={`Enter ${label.toLowerCase()}...`}
                          readOnly
                        />
                      )}
                    </div>
                  );
                })}

                <button className="w-full py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-xs font-bold mt-2">
                  Submit {FORM_TYPES.find((f) => f.key === activeForm)?.label}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Field Modal */}
      <AnimatePresence>
        {showAddField && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#0A2647]">Add Custom Field</h3>
                <button onClick={() => setShowAddField(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Field Label *</label>
                  <input
                    type="text"
                    value={newField.field_label}
                    onChange={(e) => setNewField((p) => ({ ...p, field_label: e.target.value }))}
                    placeholder="e.g. Preferred Contact Time"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Field Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FIELD_TYPES.map((ft) => (
                      <button
                        key={ft.key}
                        onClick={() => setNewField((p) => ({ ...p, field_type: ft.key }))}
                        className={`p-2 rounded-lg border-2 text-xs font-semibold transition text-center ${
                          newField.field_type === ft.key
                            ? "border-[#C9A227] bg-[#C9A227]/10 text-[#0A2647]"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-base block mb-0.5">{ft.icon}</span>
                        {ft.label}
                      </button>
                    ))}
                  </div>
                </div>

                {newField.field_type === "dropdown" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Dropdown Options (comma separated)</label>
                    <input
                      type="text"
                      value={newField.options}
                      onChange={(e) => setNewField((p) => ({ ...p, options: e.target.value }))}
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newField.is_required}
                    onChange={(e) => setNewField((p) => ({ ...p, is_required: e.target.checked }))}
                    className="rounded text-[#0A2647]"
                  />
                  Mark as required field
                </label>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddField}
                  disabled={saving || !newField.field_label.trim()}
                  className="flex-1 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-bold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Field"}
                </button>
                <button
                  onClick={() => setShowAddField(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AgentLayout>
  );
}
