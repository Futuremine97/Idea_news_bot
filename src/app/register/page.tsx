"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import {
  CATEGORIES, STAGES, REGIONS, PRICING,
  CATEGORY_LABELS, STAGE_LABELS, REGION_LABELS,
} from "@/lib/types";

type Form = {
  nameKo: string; nameEn: string;
  taglineKo: string; taglineEn: string;
  descKo: string; descEn: string;
  category: string; stage: string; region: string;
  websiteUrl: string; instagramUrl: string; pricing: string; tags: string;
  isLocalBiz: boolean; address: string; lat: string; lng: string;
  submitterName: string; submitterEmail: string;
};

const empty: Form = {
  nameKo: "", nameEn: "", taglineKo: "", taglineEn: "", descKo: "", descEn: "",
  category: "chatbot", stage: "mvp", region: "kr",
  websiteUrl: "", instagramUrl: "", pricing: "freemium", tags: "",
  isLocalBiz: false, address: "", lat: "", lng: "",
  submitterName: "", submitterEmail: "",
};

export default function RegisterPage() {
  const { lang, t } = useLang();
  const router = useRouter();
  const [form, setForm] = useState<Form>(empty);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const [geoStatus, setGeoStatus] = useState<"idle" | "searching" | "fail" | "disabled">("idle");
  const geocode = async () => {
    if (!form.address.trim()) return;
    setGeoStatus("searching");
    try {
      const r = await fetch(`/api/geocode?query=${encodeURIComponent(form.address)}`);
      if (r.status === 501) return setGeoStatus("disabled");
      const d = await r.json();
      const hit = d?.results?.[0];
      if (hit) {
        set({ lat: String(hit.lat), lng: String(hit.lng) });
        setGeoStatus("idle");
      } else {
        setGeoStatus("fail");
      }
    } catch {
      setGeoStatus("fail");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const payload: any = {
        ...form,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        mapProvider: process.env.NEXT_PUBLIC_DEFAULT_MAP_PROVIDER || "naver",
      };
      const r = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "Error");
      }
      const d = await r.json();
      setStatus("done");
      router.push(`/services/${d.service.id}`);
    } catch (err: any) {
      setStatus("error");
      setError(err.message);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";
  const labelCls = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{t("register_title")}</h1>
      <p className="mt-1 text-slate-500">{t("register_sub")}</p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={`${t("field_nameKo")} *`}>
            <input className={inputCls} required value={form.nameKo} onChange={(e) => set({ nameKo: e.target.value })} />
          </Field>
          <Field label={`${t("field_nameEn")} *`}>
            <input className={inputCls} required value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} />
          </Field>
          <Field label={`${t("field_taglineKo")} *`}>
            <input className={inputCls} required value={form.taglineKo} onChange={(e) => set({ taglineKo: e.target.value })} />
          </Field>
          <Field label={`${t("field_taglineEn")} *`}>
            <input className={inputCls} required value={form.taglineEn} onChange={(e) => set({ taglineEn: e.target.value })} />
          </Field>
        </div>

        <Field label={t("field_descKo")}>
          <textarea className={inputCls} rows={3} value={form.descKo} onChange={(e) => set({ descKo: e.target.value })} />
        </Field>
        <Field label={t("field_descEn")}>
          <textarea className={inputCls} rows={3} value={form.descEn} onChange={(e) => set({ descEn: e.target.value })} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={`${t("field_category")} *`}>
            <select className={inputCls} value={form.category} onChange={(e) => set({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c][lang]}</option>)}
            </select>
          </Field>
          <Field label={`${t("field_stage")} *`}>
            <select className={inputCls} value={form.stage} onChange={(e) => set({ stage: e.target.value })}>
              {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s][lang]}</option>)}
            </select>
          </Field>
          <Field label={`${t("field_region")} *`}>
            <select className={inputCls} value={form.region} onChange={(e) => set({ region: e.target.value })}>
              {REGIONS.map((r) => <option key={r} value={r}>{REGION_LABELS[r][lang]}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("field_website")}>
            <input className={inputCls} type="url" placeholder="https://" value={form.websiteUrl} onChange={(e) => set({ websiteUrl: e.target.value })} />
          </Field>
          <Field label={t("field_instagram")}>
            <input className={inputCls} type="url" placeholder="https://instagram.com/..." value={form.instagramUrl} onChange={(e) => set({ instagramUrl: e.target.value })} />
          </Field>
          <Field label={t("field_pricing")}>
            <select className={inputCls} value={form.pricing} onChange={(e) => set({ pricing: e.target.value })}>
              {PRICING.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label={t("field_tags")}>
            <input className={inputCls} placeholder="ai, chatbot, marketing" value={form.tags} onChange={(e) => set({ tags: e.target.value })} />
          </Field>
        </div>

        {/* 자영업자 위치 */}
        <div className="rounded-xl bg-slate-50 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isLocalBiz} onChange={(e) => set({ isLocalBiz: e.target.checked })} />
            {t("field_isLocalBiz")}
          </label>
          {form.isLocalBiz && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Field label={t("field_address")}>
                  <div className="flex gap-2">
                    <input className={inputCls} value={form.address} onChange={(e) => set({ address: e.target.value })} />
                    <button
                      type="button"
                      onClick={geocode}
                      disabled={geoStatus === "searching" || !form.address.trim()}
                      className="shrink-0 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-50"
                    >
                      {geoStatus === "searching" ? t("geocode_searching") : t("geocode_btn")}
                    </button>
                  </div>
                </Field>
                {geoStatus === "fail" && <p className="mt-1 text-xs text-red-600">{t("geocode_fail")}</p>}
                {geoStatus === "disabled" && <p className="mt-1 text-xs text-amber-600">{t("geocode_disabled")}</p>}
              </div>
              <Field label="위도 (lat)">
                <input className={inputCls} inputMode="decimal" placeholder="37.5665" value={form.lat} onChange={(e) => set({ lat: e.target.value })} />
              </Field>
              <Field label="경도 (lng)">
                <input className={inputCls} inputMode="decimal" placeholder="126.9780" value={form.lng} onChange={(e) => set({ lng: e.target.value })} />
              </Field>
              <p className="self-end text-xs text-slate-400">
                좌표는 네이버/구글 지도에서 우클릭으로 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("field_submitterName")}>
            <input className={inputCls} value={form.submitterName} onChange={(e) => set({ submitterName: e.target.value })} />
          </Field>
          <Field label={t("field_submitterEmail")}>
            <input className={inputCls} type="email" value={form.submitterEmail} onChange={(e) => set({ submitterEmail: e.target.value })} />
          </Field>
        </div>

        {status === "error" && <p className="text-sm text-red-600">⚠️ {error}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
