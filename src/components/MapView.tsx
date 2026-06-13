"use client";

import { useState } from "react";
import { NaverMap, type MapMarker } from "./NaverMap";
import { GoogleMap } from "./GoogleMap";

type Provider = "naver" | "google";

export function MapView({
  markers,
  center,
  height = 480,
  onSelect,
}: {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  height?: number;
  onSelect?: (id: string) => void;
}) {
  const def = (process.env.NEXT_PUBLIC_DEFAULT_MAP_PROVIDER as Provider) || "naver";
  const [provider, setProvider] = useState<Provider>(def);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex overflow-hidden rounded-lg border border-slate-200 text-sm self-start">
        <button
          onClick={() => setProvider("naver")}
          className={provider === "naver" ? "bg-brand-600 px-3 py-1.5 text-white" : "px-3 py-1.5 text-slate-600"}
        >
          네이버 지도
        </button>
        <button
          onClick={() => setProvider("google")}
          className={provider === "google" ? "bg-brand-600 px-3 py-1.5 text-white" : "px-3 py-1.5 text-slate-600"}
        >
          Google Maps
        </button>
      </div>
      {provider === "naver" ? (
        <NaverMap markers={markers} center={center} height={height} onSelect={onSelect} />
      ) : (
        <GoogleMap markers={markers} center={center} height={height} onSelect={onSelect} />
      )}
    </div>
  );
}

export type { MapMarker };
