"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { MapView, type MapMarker } from "@/components/MapView";

type LocalService = {
  id: string;
  nameKo: string;
  nameEn: string;
  taglineKo: string;
  taglineEn: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export default function MapPage() {
  const { lang, t } = useLang();
  const [services, setServices] = useState<LocalService[]>([]);

  useEffect(() => {
    fetch("/api/services?localOnly=1")
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .catch(() => {});
  }, []);

  const markers: MapMarker[] = services
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({ id: s.id, lat: s.lat!, lng: s.lng!, title: lang === "ko" ? s.nameKo : s.nameEn }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t("map_title")}</h1>
        <p className="mt-1 text-slate-500">{t("map_sub")}</p>
      </div>

      <MapView markers={markers} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Link
            key={s.id}
            href={`/services/${s.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-500"
          >
            <h3 className="font-semibold">{lang === "ko" ? s.nameKo : s.nameEn}</h3>
            <p className="text-sm text-slate-500">{lang === "ko" ? s.taglineKo : s.taglineEn}</p>
            {s.address && <p className="mt-2 text-xs text-slate-400">📍 {s.address}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
