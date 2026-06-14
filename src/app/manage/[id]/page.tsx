"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import {
  CATEGORIES, STAGES, REGIONS, PRICING, KINDS, PLATFORMS,
  CATEGORY_LABELS, STAGE_LABELS, REGION_LABELS, KIND_LABELS, PLATFORM_LABELS,
} from "@/lib/types";

type Stats = {
  views: number; upvotes: number; ratingAvg: number; ratingCount: number;
  reviewCount: number; checkins: { going: number; saved: number; went: number };
  status: string; featured: boolean;
};

export default function ManagePage() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLang();
  const [token, setToken] = useState("");
  const [state, setState] = useState<"loading" | "ok" | "unauthorized" | "notfound">("loading");
  const [stats, setStats] = useState<Stats | null>(null);
  const [form, setForm] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (patch: any) => setForm((f: any) => ({ ...f, ...patch }));

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const tok = qs.get("t") || localStorage.getItem(`ownerToken:${id}`) || "";
    setToken(tok);
    if (tok) localStorage.setItem(`ownerToken:${id}`, tok);

    fetch(`/api/services/${id}/manage?token=${encodeURIComponent(tok)}`)
      .then(async (r) => {
        if (r.status === 401) return setState("unauthorized");
        if (r.status === 404) return setState("notfound");
        const d = await r.json();
        setStats(d.stats);
        const s = d.service;
        setForm({
          nameKo: s.nameKo, nameEn: s.nameEn,
          taglineKo: s.taglineKo, taglineEn: s.taglineEn,
          descKo: s.descKo || "", descEn: s.descEn || "",
          category: s.category, stage: s.stage, region: s.region,
          pricing: s.pricing || "freemium", tags: s.tags || "",
          kind: s.kind || "service", platform: s.platform || "mcp", repoUrl: s.repoUrl || "",
          websiteUrl: s.websiteUrl || "", instagramUrl: s.instagramUrl || "",
          isLocalBiz: !!s.isLocalBiz, address: s.address || "",
          lat: s.lat != null ? String(s.lat) : "", lng: s.lng != null ? String(s.lng) : "",
        });
        setState("ok");
      })
      .catch(() => setState("notfound"));
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    setError("");
    try {
      const r = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ownerToken: token, lat: form.lat || null, lng: form.lng || null }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Error");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err: any) {
      setSaveStatus("error");
      setError(err.message);
    }
  };

  const del = async () => {
    if (!confirm(t("manage_delete_confirm"))) return;
    const r = await fetch(`/api/services/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerToken: token }),
    });
    if (r.ok) {
      localStorage.removeItem(`ownerToken:${id}`);
      window.location.href = "/";
    } else {
      setError((await r.json().catch(() => ({}))).error || "Error");
    }
  };

  const manageUrl = typeof window !== "undefined" ? `${window.location.origin}/manage/${id}?t=${token}` : "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(manageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (state === "loading") return <p className="py-12 text-center text-slate-400">…</p>;
  if (state === "unauthorized")
    return <p className="py-12 text-center text-red-600">⚠️ {t("manage_unauthorized")}</p>;
  if (state === "notfound" || !form || !stats)
    return <p className="py-12 text-center text-slate-400">—</p>;

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t("manage_title")}</h1>
        <Link href={`/services/${id}`} className="text-sm text-brand-600 hover:underline">
          {t("reg_go_public")} ↗
        </Link>
      </div>

      {/* 관리 링크 */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="mb-1 font-medium text-amber-800">🔑 {t("manage_link")}</p>
        <p className="mb-2 text-amber-700">{t("reg_success_desc")}</p>
        <div className="flex items-center gap-2">
          <input readOnly value={manageUrl} className="flex-1 rounded border border-amber-200 bg-white px-2 py-1 text-xs text-slate-600" />
          <button onClick={copyLink} className="rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-400">
            {copied ? "✓" : t("reg_copy_link")}
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div>
        <h2 className="mb-2 text-lg font-bold">{t("manage_stats")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t("views")} value={stats.views} />
          <Stat label={t("upvote")} value={stats.upvotes} />
          <Stat label={t("avg_rating")} value={`${stats.ratingAvg.toFixed(1)} (${stats.ratingCount})`} />
          <Stat label={t("reviews_title")} value={stats.reviewCount} />
          <Stat label={`🚩 ${t("ci_going")}`} value={stats.checkins.going} />
          <Stat label={`🔖 ${t("ci_saved")}`} value={stats.checkins.saved} />
          <Stat label={`✅ ${t("ci_went")}`} value={stats.checkins.went} />
          <Stat label="status" value={stats.status} />
        </div>
      </div>

      {/* 수정 폼 */}
      <form onSubmit={save} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold">{t("manage_edit")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <L label={t("field_nameKo")}><input className={inputCls} value={form.nameKo} onChange={(e) => set({ nameKo: e.target.value })} /></L>
          <L label={t("field_nameEn")}><input className={inputCls} value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} /></L>
          <L label={t("field_taglineKo")}><input className={inputCls} value={form.taglineKo} onChange={(e) => set({ taglineKo: e.target.value })} /></L>
          <L label={t("field_taglineEn")}><input className={inputCls} value={form.taglineEn} onChange={(e) => set({ taglineEn: e.target.value })} /></L>
        </div>
        <L label={t("field_descKo")}><textarea className={inputCls} rows={3} value={form.descKo} onChange={(e) => set({ descKo: e.target.value })} /></L>
        <L label={t("field_descEn")}><textarea className={inputCls} rows={3} value={form.descEn} onChange={(e) => set({ descEn: e.target.value })} /></L>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <L label={t("field_category")}>
            <select className={inputCls} value={form.category} onChange={(e) => set({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c][lang]}</option>)}
            </select>
          </L>
          <L label={t("field_stage")}>
            <select className={inputCls} value={form.stage} onChange={(e) => set({ stage: e.target.value })}>
              {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s][lang]}</option>)}
            </select>
          </L>
          <L label={t("field_region")}>
            <select className={inputCls} value={form.region} onChange={(e) => set({ region: e.target.value })}>
              {REGIONS.map((r) => <option key={r} value={r}>{REGION_LABELS[r][lang]}</option>)}
            </select>
          </L>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <L label={t("field_website")}><input className={inputCls} value={form.websiteUrl} onChange={(e) => set({ websiteUrl: e.target.value })} /></L>
          <L label={t("field_instagram")}><input className={inputCls} value={form.instagramUrl} onChange={(e) => set({ instagramUrl: e.target.value })} /></L>
          <L label={t("field_pricing")}>
            <select className={inputCls} value={form.pricing} onChange={(e) => set({ pricing: e.target.value })}>
              {PRICING.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </L>
          <L label={t("field_tags")}><input className={inputCls} value={form.tags} onChange={(e) => set({ tags: e.target.value })} /></L>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <span className="mb-2 block text-sm font-medium text-slate-700">{t("field_kind")}</span>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button type="button" key={k} onClick={() => set({ kind: k })}
                className={"rounded-lg px-4 py-2 text-sm font-medium " + (form.kind === k ? "bg-brand-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100")}>
                {KIND_LABELS[k][lang]}
              </button>
            ))}
          </div>
          {form.kind === "extension" && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <L label={t("field_platform")}>
                <select className={inputCls} value={form.platform} onChange={(e) => set({ platform: e.target.value })}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p][lang]}</option>)}
                </select>
              </L>
              <L label={t("field_repo")}><input className={inputCls} value={form.repoUrl} onChange={(e) => set({ repoUrl: e.target.value })} /></L>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isLocalBiz} onChange={(e) => set({ isLocalBiz: e.target.checked })} />
            {t("field_isLocalBiz")}
          </label>
          {form.isLocalBiz && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3"><L label={t("field_address")}><input className={inputCls} value={form.address} onChange={(e) => set({ address: e.target.value })} /></L></div>
              <L label="위도 (lat)"><input className={inputCls} value={form.lat} onChange={(e) => set({ lat: e.target.value })} /></L>
              <L label="경도 (lng)"><input className={inputCls} value={form.lng} onChange={(e) => set({ lng: e.target.value })} /></L>
            </div>
          )}
        </div>

        {saveStatus === "error" && <p className="text-sm text-red-600">⚠️ {error}</p>}
        {saveStatus === "saved" && <p className="text-sm text-emerald-600">✓ {t("manage_saved")}</p>}

        <div className="flex items-center justify-between">
          <button type="submit" disabled={saveStatus === "saving"}
            className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            {t("manage_save")}
          </button>
          <button type="button" onClick={del}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            {t("manage_delete")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-800">{value}</div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
