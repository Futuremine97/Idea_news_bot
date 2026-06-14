"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { ServiceCard, type ServiceLite } from "@/components/ServiceCard";
import { PLATFORMS, PLATFORM_LABELS, STAGES, STAGE_LABELS } from "@/lib/types";

export default function ToolsPage() {
  const { lang, t } = useLang();
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("all");
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("kind", "extension");
    if (q) params.set("q", q);
    if (platform !== "all") params.set("platform", platform);
    if (stage !== "all") params.set("stage", stage);
    if (sort) params.set("sort", sort);

    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/services?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [q, platform, stage, sort]);

  const selectCls =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none";

  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-14 sm:px-12">
        <span className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          Extensions · MCP
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t("tools_title")}</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-500 sm:text-lg">{t("tools_sub")}</p>
        <div className="mt-7">
          <Link
            href="/register?kind=extension"
            className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
          >
            {t("hero_cta")}
          </Link>
        </div>
      </section>

      {/* 플랫폼 빠른 필터 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPlatform("all")}
          className={
            "rounded-full px-3 py-1.5 text-sm " +
            (platform === "all" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")
          }
        >
          {t("filter_all")}
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={
              "rounded-full px-3 py-1.5 text-sm " +
              (platform === p ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")
            }
          >
            {PLATFORM_LABELS[p][lang]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search_placeholder")}
          className="w-full flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none sm:min-w-[220px]"
        />
        <select className={selectCls} value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="all">{t("filter_stage")}: {t("filter_all")}</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s][lang]}
            </option>
          ))}
        </select>
        <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">{t("sort_featured")}</option>
          <option value="new">{t("sort_new")}</option>
          <option value="top">{t("sort_top")}</option>
        </select>
      </div>

      {loading ? (
        <p className="py-12 text-center text-slate-400">…</p>
      ) : services.length === 0 ? (
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
