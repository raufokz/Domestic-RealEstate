"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Integration {
  id: number;
  integration_key: string;
  name: string;
  category: string;
  status: string;
  last_error_message?: string | null;
}

export default function ApiKeysPage() {
  const { success, notifyError } = useToast();
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<Integration[]>("/admin/integrations");
      const list = Array.isArray(data) ? data : [];
      setItems(list.filter((i) => ["ai", "email", "maps", "analytics", "storage", "payments"].includes(i.category)));
    } catch (err) {
      notifyError(err, "Integrations could not be loaded.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const seed = async () => {
    try {
      await apiGet("/admin/integrations/seed");
      success("Integrations seeded.", "Integrations");
      await fetchItems();
    } catch (err) {
      notifyError(err, "Could not seed integrations.");
    }
  };

  return (
    <AdminLayout title="API Keys & Credentials">
      <div className="flex justify-between mb-6">
        <p className="text-sm text-slate-500">
          Manage API keys for AI, email, maps, and analytics. Configure each integration, then Test.
        </p>
        <button onClick={seed} className="px-4 py-2 border rounded-lg text-sm font-medium">
          Seed Integrations
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 mb-4">No integrations found.</p>
            <button onClick={seed} className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold">
              Seed Now
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Service</th>
                <th className="px-4 py-3 text-left text-sm">Category</th>
                <th className="px-4 py-3 text-left text-sm">Status</th>
                <th className="px-4 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-navy">{i.name}</td>
                  <td className="px-4 py-3 text-sm capitalize">{i.category}</td>
                  <td className="px-4 py-3 text-sm capitalize">{i.status.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/integrations/${i.integration_key}`} className="text-sm text-gold font-medium">
                      Configure / Test →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
