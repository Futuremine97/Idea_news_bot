"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";
import { CATEGORY_LABELS, STAGE_LABELS, REGION_LABELS } from "@/lib/types";

export type ServiceLite = {
  id: string;
  nameKo: string;
  nameEn: string;
  taglineKo: string;
  taglineEn: string;
  category: string;
  stage: string;
  region: string;
  pricing?: string | null;
  isLocalBiz: boolean;
  featured: boolean;
  views: number;
  upvotes: number;
  tags: string;
};

export function ServiceCard({ s }: { s: ServiceLite }) {
  const { lang, t } = useLang();
  const name = lang === "ko" ? s.nameKo : s.nameEn;
  const tagline = lang === "ko" ? s.taglineKo : s.taglineEn;
  const tags = s.tags.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 4);

  return (
    <Link
      href={`/services/${s.id}`}
      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-md"
    >
      {s.featured && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          ★ {t("featured")}
        </span>
      )}
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-600">{name}</h3>
      </div>
      <p className="mb-3 line-clamp-2 text-sm text-slate-500">{tagline}</p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="rounded bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700">
          {CATEGORY_LABELS[s.category]?.[lang] ?? s.category}
        </span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
          {STAGE_LABELS[s.stage]?.[lang] ?? s.stage}
        </span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
          {REGION_LABELS[s.region]?.[lang] ?? s.region}
        </span>
        {s.isLocalBiz && (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">📍 {t("local_biz")}</span>
        )}
      </div>

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-400">
          {tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
        <span>▲ {s.upvotes}</span>
        <span>{s.views} {t("views")}</span>
      </div>
    </Link>
  );
}
