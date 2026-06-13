"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { Filters, type FilterState } from "@/components/Filters";
import { ServiceCard, type ServiceLite } from "@/components/ServiceCard";

export default function HomePage() {
  const { t } = useLang();
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ q: "", category: "all", stage: "all", region: "all" });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.stage !== "all") params.set("stage", filters.stage);
    if (filters.region !== "all") params.set("region", filters.region);

    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/services?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [filters]);

  const count = services.length;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-500 px-6 py-12 text-white sm:px-10">
        <h1 className="max-w-3xl text-2xl font-bold leading-snug sm:text-3xl">{t("tagline")}</h1>
        <p className="mt-3 text-brand-100">{t("hero_sub")}</p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-white px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50"
          >
            {t("hero_cta")}
          </Link>
          <Link
            href="/map"
            className="rounded-lg border border-white/40 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
          >
            {t("nav_map")}
          </Link>
        </div>
      </section>

      {/* Filters */}
      <Filters value={filters} onChange={setFilters} />

      {/* Grid */}
      {loading ? (
        <p className="py-12 text-center text-slate-400">…</p>
      ) : count === 0 ? (
        <p className="py-12 text-center text-slate-400">{t("no_results")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}
