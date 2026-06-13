"use client";

import { useEffect, useRef } from "react";

export type MapMarker = { id: string; lat: number; lng: number; title: string };

declare global {
  interface Window {
    naver?: any;
  }
}

function loadNaverScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps) return resolve();
    const existing = document.getElementById("naver-map-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.id = "naver-map-sdk";
    // 2025년부터 네이버 신규 키는 ncpKeyId 파라미터 사용 (구 ncpClientId 대체)
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Naver Maps SDK"));
    document.head.appendChild(s);
  });
}

export function NaverMap({
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
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !ref.current) return;
    let map: any;
    loadNaverScript(clientId)
      .then(() => {
        const naver = window.naver;
        const c = center ?? markers[0] ?? { lat: 37.5665, lng: 126.978 };
        map = new naver.maps.Map(ref.current, {
          center: new naver.maps.LatLng(c.lat, c.lng),
          zoom: 12,
        });
        markers.forEach((m) => {
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(m.lat, m.lng),
            map,
            title: m.title,
          });
          if (onSelect) {
            naver.maps.Event.addListener(marker, "click", () => onSelect(m.id));
          }
        });
      })
      .catch((e) => console.error(e));
  }, [clientId, markers, center, onSelect]);

  if (!clientId) {
    return <MapKeyMissing provider="네이버 지도 (NEXT_PUBLIC_NAVER_MAP_CLIENT_ID)" height={height} markers={markers} />;
  }
  return <div ref={ref} style={{ height, width: "100%" }} className="rounded-xl border border-slate-200" />;
}

export function MapKeyMissing({
  provider,
  height,
  markers,
}: {
  provider: string;
  height: number;
  markers: MapMarker[];
}) {
  return (
    <div
      style={{ height }}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500"
    >
      <p className="font-medium text-slate-600">🗺️ 지도 API 키가 설정되지 않았습니다</p>
      <p>
        <code className="rounded bg-slate-200 px-1">.env</code> 에 {provider} 키를 추가하면 지도가 표시됩니다.
      </p>
      {markers.length > 0 && (
        <ul className="mt-2 text-left text-xs text-slate-500">
          {markers.map((m) => (
            <li key={m.id}>📍 {m.title} ({m.lat.toFixed(4)}, {m.lng.toFixed(4)})</li>
          ))}
        </ul>
      )}
    </div>
  );
}
