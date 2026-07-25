"use client";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), { ssr: false });

export default function PropertyMapWrapper({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  return <PropertyMap lat={lat} lng={lng} title={title} />;
}
