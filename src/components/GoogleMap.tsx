"use client";

import { useEffect, useRef } from "react";
import { MapKeyMissing, type MapMarker } from "./NaverMap";

declare global {
  interface Window {
    google?: any;
    __gmapsLoading?: Promise<void>;
  }
}

function loadGoogleScript(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoading) return window.__gmapsLoading;
  window.__gmapsLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Maps SDK"));
    document.head.appendChild(s);
  });
  return window.__gmapsLoading;
}

export function GoogleMap({
  markers,
  center,
  height = 400,
  onSelect,
}: {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  height?: number;
  onSelect?: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !ref.current) return;
    loadGoogleScript(apiKey)
      .then(() => {
        const g = window.google;
        const c = center ?? markers[0] ?? { lat: 37.5665, lng: 126.978 };
        const map = new g.maps.Map(ref.current, { center: c, zoom: 11 });
        markers.forEach((m) => {
          const marker = new g.maps.Marker({ position: { lat: m.lat, lng: m.lng }, map, title: m.title });
          if (onSelect) marker.addListener("click", () => onSelect(m.id));
        });
      })
      .catch((e) => console.error(e));
  }, [apiKey, markers, center, onSelect]);

  if (!apiKey) {
    return <MapKeyMissing provider="구글 지도 (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)" height={height} markers={markers} />;
  }
  return <div ref={ref} style={{ height, width: "100%" }} className="rounded-xl border border-slate-200" />;
}
