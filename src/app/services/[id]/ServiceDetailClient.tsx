"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { MapView } from "@/components/MapView";
import { ShareButtons } from "@/components/ShareButtons";
import { safeExternalUrl } from "@/lib/url";
import { CATEGORY_LABELS, STAGE_LABELS, REGION_LABELS } from "@/lib/types";

export type ServiceFull = {
  id: string;
  nameKo: string; nameEn: string;
  taglineKo: string; taglineEn: string;
  descKo: string; descEn: string;
  category: string; stage: string; region: string;
  websiteUrl?: string | null; instagramUrl?: string | null;
  pricing?: string | null;
  isLocalBiz: boolean; address?: string | null; lat?: number | null; lng?: number | null;
  views: number; upvotes: number; tags: string;
};

export default function ServiceDetailClient({ service: s }: { service: ServiceFull }) {
  const { lang, t } = useLang();
  const [upvotes, setUpvotes] = useState(s.upvotes);

  const upvote = async () => {
    try {
      const r = await fetch(`/api/services/${s.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upvote" }),
      });
      const d = await r.json();
      if (d.upvotes != null) setUpvotes(d.upvotes);
    } catch {
      /* ignore */
    }
  };

  const name = lang === "ko" ? s.nameKo : s.nameEn;
  const tagline = lang === "ko" ? s.taglineKo : s.taglineEn;
  const desc = lang === "ko" ? s.descKo : s.descEn;
  const tags = s.tags.split(",").map((x) => x.trim()).filter(Boolean);
  const website = safeExternalUrl(s.websiteUrl);
  const instagram = safeExternalUrl(s.instagramUrl);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-brand-600">
        {t("back")}
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="mt-1 text-lg text-slate-500">{tagline}</p>
          </div>
          <button
            onClick={upvote}
            className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            ▲ {t("upvote")} {upvotes}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{CATEGORY_LABELS[s.category]?.[lang] ?? s.category}</Badge>
          <Badge>{STAGE_LABELS[s.stage]?.[lang] ?? s.stage}</Badge>
          <Badge>{REGION_LABELS[s.region]?.[lang] ?? s.region}</Badge>
          {s.pricing && <Badge>{s.pricing}</Badge>}
          {s.isLocalBiz && <Badge>📍 {t("local_biz")}</Badge>}
        </div>

        {desc && <p className="mt-6 whitespace-pre-wrap leading-relaxed text-slate-700">{desc}</p>}

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 text-sm text-slate-400">
            {tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t("visit_site")} ↗
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {t("view_instagram")} ↗
            </a>
          )}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <ShareButtons title={name} />
        </div>
      </div>

      {s.isLocalBiz && s.lat != null && s.lng != null && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {s.address && <p className="mb-3 text-sm text-slate-600">📍 {s.address}</p>}
          <MapView
            markers={[{ id: s.id, lat: s.lat, lng: s.lng, title: name }]}
            center={{ lat: s.lat, lng: s.lng }}
            height={360}
          />
        </div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">{children}</span>;
}
