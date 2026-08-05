"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface RoleRow {
  id: number;
  name: string;
  permissions: string[];
  users_count: number;
}

export default function RolesPermissionsPage() {
  const { success, notifyError } = useToast();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<number, Set<string>>>({});

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiGet<{ data: RoleRow[] }>("/admin/roles"),
        apiGet<{ data: string[] }>("/admin/roles/permissions"),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
      setDraft(Object.fromEntries(rolesRes.data.map((r) => [r.id, new Set(r.permissions)])));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load roles and permissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const toggle = (roleId: number, permission: string) => {
    setDraft((prev) => {
      const next = new Set(prev[roleId]);
      next.has(permission) ? next.delete(permission) : next.add(permission);
      return { ...prev, [roleId]: next };
    });
  };

  const isDirty = (role: RoleRow) => {
    const current = draft[role.id];
    if (!current) return false;
    const original = new Set(role.permissions);
    return current.size !== original.size || [...current].some((p) => !original.has(p));
  };

  async function handleSave(role: RoleRow) {
    setSavingRoleId(role.id);
    try {
      await apiPut(`/admin/roles/${role.id}`, { permissions: Array.from(draft[role.id] ?? []) });
      success(`${role.name} permissions updated.`);
      fetchAll();
    } catch (e) {
      notifyError(e, "Could not save permissions.");
    } finally {
      setSavingRoleId(null);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Roles &amp; Permissions">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
          <span className="ml-3 text-gray-500">Loading roles...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Roles &amp; Permissions">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchAll} className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Roles & Permissions">
      <p className="text-sm text-slate-500 mb-4 max-w-2xl">
        Every permission a role has here is real and enforced server-side. <code className="bg-slate-100 px-1 rounded">super_admin</code> always
        has every permission automatically and can&apos;t be edited.
      </p>

      <div className="space-y-6">
        {roles.map((role) => {
          const current = draft[role.id] ?? new Set<string>();
          const isSuperAdmin = role.name === "super_admin";
          return (
            <div key={role.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#0A2647] capitalize">{role.name.replace("_", " ")}</h2>
                  <p className="text-xs text-gray-500">{role.users_count} user{role.users_count === 1 ? "" : "s"}</p>
                </div>
                {!isSuperAdmin && (
                  <button
                    onClick={() => handleSave(role)}
                    disabled={savingRoleId === role.id || !isDirty(role)}
                    className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] disabled:opacity-40"
                  >
                    {savingRoleId === role.id ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>

              {isSuperAdmin ? (
                <p className="text-sm text-gray-400 italic">All permissions (via Gate::before) — nothing to configure.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {permissions.map((permission) => (
                    <label key={permission} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={current.has(permission)}
                        onChange={() => toggle(role.id, permission)}
                        className="rounded border-gray-300 text-[#C9A227] focus:ring-[#C9A227]"
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
