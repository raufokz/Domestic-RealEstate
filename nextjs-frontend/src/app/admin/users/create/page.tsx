"use client";

import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

const roles = ["admin", "super_admin", "agent", "broker", "buyer", "seller", "investor", "staff", "lender", "title"];

export default function CreateUserPage() {
  const { success, notifyError } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.role) errs.role = "Role is required";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setCreatedId(null);
    try {
      const res = await apiPost<{ data: { id: number } }>("/admin/users", {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        phone: form.phone.trim() || undefined,
        password: form.password,
        status: "active",
      });
      setCreatedId(res?.data?.id ?? null);
      setForm({ name: "", email: "", role: "", phone: "", password: "" });
      success("User created successfully.", "Create User");
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const body = err.data as { errors?: Record<string, string[]> };
        if (body.errors) {
          const next: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(body.errors)) {
            next[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
          }
          setErrors(next);
        }
      }
      notifyError(err, "User could not be created.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Create User">
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#0A2647]">New User Details</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the information below to create a new user account.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Enter full name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent ${errors.name ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="user@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent ${errors.email ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent ${errors.role ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Minimum 8 characters"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent ${errors.password ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create User"
                )}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {createdId !== null && (
                <Link
                  href={`/admin/users/${createdId}`}
                  className="text-sm font-medium text-[#0A2647] hover:text-[#C9A227]"
                >
                  View new user →
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
