"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function PropertyMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const initMap = async () => {
      const L = (await import("leaflet")).default;
      const map = L.map(mapRef.current!).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.marker([lat, lng]).addTo(map).bindPopup(`<b>${title}</b>`).openPopup();
      mapInstanceRef.current = map;
    };
    initMap();
    return () => { mapInstanceRef.current?.remove(); mapInstanceRef.current = null; };
  }, [lat, lng, title]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-xl" />;
}
