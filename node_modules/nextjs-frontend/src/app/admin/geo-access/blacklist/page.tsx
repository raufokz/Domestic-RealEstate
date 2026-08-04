"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import GeoListManager from "@/components/admin/geo/GeoListManager";

export default function GeoBlacklistPage() {
  return (
    <AdminLayout title="Geo Access Control — Blacklist">
      <p className="text-sm text-slate-500 mb-4">
        Blacklisted IPs and CIDR ranges are always denied, independent of the country policy — use this to block a
        specific abusive IP regardless of where it geolocates.
      </p>
      <GeoListManager kind="blacklist" />
    </AdminLayout>
  );
}
