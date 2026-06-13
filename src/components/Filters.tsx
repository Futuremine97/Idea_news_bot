"use client";

import { useLang } from "./LangProvider";
import { CATEGORIES, STAGES, REGIONS, CATEGORY_LABELS, STAGE_LABELS, REGION_LABELS } from "@/lib/types";

export type FilterState = {
  q: string;
  category: string;
  stage: string;
  region: string;
  sort: string;
};

export function Filters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (v: FilterState) => void;
}) {
  const { lang, t } = useLang();
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  const selectCls =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        value={value.q}
        onChange={(e) => set({ q: e.target.value })}
        placeholder={t("search_placeholder")}
        className="w-full flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none sm:min-w-[220px]"
      />
      <select className={selectCls} value={value.category} onChange={(e) => set({ category: e.target.value })}>
        <option value="all">{t("filter_category")}: {t("filter_all")}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c][lang]}
          </option>
        ))}
      </select>
      <select className={selectCls} value={value.stage} onChange={(e) => set({ stage: e.target.value })}>
        <option value="all">{t("filter_stage")}: {t("filter_all")}</option>
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {STAGE_LABELS[s][lang]}
          </option>
        ))}
      </select>
      <select className={selectCls} value={value.region} onChange={(e) => set({ region: e.target.value })}>
        <option value="all">{t("filter_region")}: {t("filter_all")}</option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {REGION_LABELS[r][lang]}
          </option>
        ))}
      </select>
      <select className={selectCls} value={value.sort} onChange={(e) => set({ sort: e.target.value })}>
        <option value="featured">{t("sort_featured")}</option>
        <option value="new">{t("sort_new")}</option>
        <option value="top">{t("sort_top")}</option>
      </select>
    </div>
  );
}
