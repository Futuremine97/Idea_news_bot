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
  const [filters, setFilters] = useState<FilterState>({ q: "", category: "all", stage: "all", region: "all", sort: "featured" });

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("kind", "service");
    if (filters.q) params.set("q", filters.q);
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.stage !== "all") params.set("stage", filters.stage);
    if (filters.region !== "all") params.set("region", filters.region);
    if (filters.sort) params.set("sort", filters.sort);

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
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-14 sm:px-12">
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          AI Service Hub
        </span>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {t("tagline")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-500 sm:text-lg">{t("hero_sub")}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
          >
            {t("hero_cta")}
          </Link>
          <Link
            href="/map"
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
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
