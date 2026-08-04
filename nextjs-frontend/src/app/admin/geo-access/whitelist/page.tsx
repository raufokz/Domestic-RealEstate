"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import GeoListManager from "@/components/admin/geo/GeoListManager";

export default function GeoWhitelistPage() {
  return (
    <AdminLayout title="Geo Access Control — Whitelist">
      <p className="text-sm text-slate-500 mb-4">
        Whitelisted IPs and CIDR ranges always bypass country and VPN/proxy/Tor blocking — use this for developer,
        office, or QA IPs that need access regardless of location.
      </p>
      <GeoListManager kind="whitelist" />
    </AdminLayout>
  );
}
