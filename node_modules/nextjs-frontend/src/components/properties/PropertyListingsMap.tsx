"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { storageUrl } from "@/lib/media";
import { propertyPhotoPaths } from "@/lib/properties";

interface MapPropertyProps {
  id: number;
  slug: string;
  title: string;
  price?: string | number | null;
  bedrooms?: number | null;
  bathrooms?: number | string | null;
  sqft?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photos?: string[] | null;
  images?: any[] | null;
}

export default function PropertyListingsMap({ properties }: { properties: MapPropertyProps[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default Leaflet icon paths
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });

      // Default geographic focus: Miami, Florida
      const defaultCenter: [number, number] = [25.7617, -80.1918];

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current!, { zoomControl: false }).setView(defaultCenter, 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        
        // Add zoom controls to the bottom right
        L.control.zoom({ position: "bottomright" }).addTo(map);
        mapInstanceRef.current = map;
      }

      // Remove previous markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const bounds: any[] = [];

      properties.forEach((p) => {
        const lat = p.latitude ? parseFloat(p.latitude as string) : null;
        const lng = p.longitude ? parseFloat(p.longitude as string) : null;

        if (lat && lng && isFinite(lat) && isFinite(lng)) {
          // Format price label for visual node (e.g. 1.2M or 850k)
          const rawPrice = typeof p.price === "number" ? p.price : parseFloat(p.price || "0");
          let priceLabel = "Contact";
          if (rawPrice > 0) {
            priceLabel = rawPrice >= 1_000_000 
              ? `$${(rawPrice / 1_000_000).toFixed(1)}M` 
              : `$${(rawPrice / 1_000).toFixed(0)}k`;
          }

          // Custom DivIcon styled in white/navy/gold light mode
          const priceBadgeIcon = L.divIcon({
            html: `<div style="background-color: #ffffff; color: #0A2647; border: 2.25px solid #0A2647; font-weight: 800; border-radius: 9999px; padding: 4px 8px; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 4px;" class="hover:scale-105 hover:border-[#C9A227] transition-all">
                     <span style="width: 6px; height: 6px; background-color: #C9A227; border-radius: 50%;"></span>
                     ${priceLabel}
                   </div>`,
            className: "custom-price-badge",
            iconSize: [70, 26],
            iconAnchor: [35, 13],
          });

          // Build preview popup content
          const photo = storageUrl(propertyPhotoPaths(p)[0]) ?? null;
          const formattedPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(rawPrice);

          const popupHtml = `
            <div style="font-family: Outfit, Inter, sans-serif; width: 220px; overflow: hidden; border-radius: 12px; margin: -1px;">
              ${photo ? `<img src="${photo}" style="width: 100%; height: 100px; object-cover; display: block; border-bottom: 1px solid #f1f5f9;" alt="${p.title}" />` : ""}
              <div style="padding: 10px;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #C9A227; letter-spacing: 0.5px;">${p.bedrooms ?? "—"} beds · ${p.bathrooms ?? "—"} baths</span>
                <strong style="color: #0A2647; font-size: 13px; font-weight: 800; display: block; margin-top: 2px; text-overflow: truncate; overflow: hidden; white-space: nowrap;">${p.title}</strong>
                <span style="color: #0A2647; font-weight: 900; font-size: 15px; display: block; margin: 4px 0 8px 0; font-family: monospace;">${formattedPrice}</span>
                <a href="/properties/${p.slug}" style="display: block; background-color: #0A2647; color: #ffffff; text-decoration: none; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px; border-radius: 8px; text-align: center; transition: background-color 0.2s;">View Details</a>
              </div>
            </div>
          `;

          const marker = L.marker([lat, lng], { icon: priceBadgeIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(popupHtml, { minWidth: 220, closeButton: false });

          markersRef.current.push(marker);
          bounds.push([lat, lng]);
        }
      });

      if (bounds.length > 0 && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
      }
    };

    initMap();
  }, [properties]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={mapRef} className="w-full h-full min-h-[450px] lg:min-h-0 bg-slate-100 rounded-3xl overflow-hidden shadow-premium-sm border border-slate-200/50" />
  );
}
