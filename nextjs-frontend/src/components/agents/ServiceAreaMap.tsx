"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { apiGet, ApiError } from "@/lib/api";

interface ZipCentroid {
  zip: string;
  latitude: number;
  longitude: number;
}

const MILES_TO_METERS = 1609.34;

/**
 * Visualizes an agent's coverage radius around their declared ZIP codes on
 * a Leaflet/OpenStreetMap map (free — no Google Maps API). Geocodes ZIPs
 * via the free `/zip-lookup/{zip}` endpoint (backed by the seeded
 * zip_codes centroid table), never a paid geocoding service.
 */
export default function ServiceAreaMap({ zips, radiusMiles }: { zips: string[]; radiusMiles: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvedCount, setResolvedCount] = useState<number | null>(null);

  const zipList = zips.filter((z) => /^\d{5}$/.test(z));

  useEffect(() => {
    if (!mapRef.current || zipList.length === 0) return;
    let cancelled = false;

    async function render() {
      setError(null);
      const L = (await import("leaflet")).default;

      const centroids: ZipCentroid[] = [];
      for (const zip of zipList) {
        try {
          const res = await apiGet<{ data: ZipCentroid }>(`/zip-lookup/${zip}`);
          if (res?.data) centroids.push(res.data);
        } catch {
          // Unknown ZIP — skip it silently, don't block the others.
        }
      }

      if (cancelled) return;
      setResolvedCount(centroids.length);

      if (centroids.length === 0) {
        setError("Couldn't locate any of these ZIP codes on the map.");
        return;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!).setView([centroids[0].latitude, centroids[0].longitude], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      for (const c of centroids) {
        const point: [number, number] = [c.latitude, c.longitude];
        L.marker(point).addTo(map).bindPopup(`ZIP ${c.zip}`);
        L.circle(point, {
          radius: radiusMiles * MILES_TO_METERS,
          color: "#C9A227",
          fillColor: "#C9A227",
          fillOpacity: 0.12,
          weight: 2,
        }).addTo(map);
        bounds.extend(point);
      }
      if (centroids.length > 1) map.fitBounds(bounds.pad(0.2));

      mapInstanceRef.current = map;
    }

    render();
    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(zipList), radiusMiles]);

  if (zipList.length === 0) {
    return (
      <div className="w-full h-full min-h-[240px] rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400 text-center px-6">
        Add ZIP codes to your service area to preview your coverage radius here.
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-full min-h-[240px] rounded-xl" />
      {error && (
        <p className="mt-2 text-xs text-amber-600">{error}</p>
      )}
      {resolvedCount !== null && resolvedCount > 0 && resolvedCount < zipList.length && (
        <p className="mt-2 text-xs text-slate-400">
          Showing {resolvedCount} of {zipList.length} ZIP codes — the rest aren&apos;t in our coverage lookup.
        </p>
      )}
    </div>
  );
}
