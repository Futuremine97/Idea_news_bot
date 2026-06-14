import { CATEGORIES, STAGES, REGIONS, PRICING, KINDS, PLATFORMS } from "./types";
import { safeExternalUrl } from "./url";

const MAX = { short: 120, mid: 300, long: 4000, tags: 300 };

function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export type ParsedService = {
  nameKo: string; nameEn: string;
  taglineKo: string; taglineEn: string;
  descKo: string; descEn: string;
  category: string; stage: string; region: string;
  pricing: string | null; tags: string;
  kind: string; platform: string | null; repoUrl: string | null;
  websiteUrl: string | null; instagramUrl: string | null; logoUrl: string | null;
  isLocalBiz: boolean; address: string | null; lat: number | null; lng: number | null;
  mapProvider: string | null;
  submitterName: string | null; submitterEmail: string | null;
};

/**
 * 등록/수정 공통 입력 검증·살균. 신뢰 경계(서버)에서만 사용.
 * status / source / ownerToken / featured 는 여기서 다루지 않음(권한 분리).
 */
export function parseServiceInput(
  body: any
): { ok: true; data: ParsedService } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };

  const nameKo = str(body.nameKo, MAX.short);
  const nameEn = str(body.nameEn, MAX.short);
  const taglineKo = str(body.taglineKo, MAX.mid);
  const taglineEn = str(body.taglineEn, MAX.mid);
  for (const [k, v] of [["nameKo", nameKo], ["nameEn", nameEn], ["taglineKo", taglineKo], ["taglineEn", taglineEn]] as const) {
    if (!v) return { ok: false, error: `Missing field: ${k}` };
  }

  const category = str(body.category, 40);
  const stage = str(body.stage, 20);
  const region = str(body.region, 20);
  if (!CATEGORIES.includes(category as any)) return { ok: false, error: "Invalid category" };
  if (!STAGES.includes(stage as any)) return { ok: false, error: "Invalid stage" };
  if (!REGIONS.includes(region as any)) return { ok: false, error: "Invalid region" };

  let pricing: string | null = str(body.pricing, 20);
  if (pricing && !PRICING.includes(pricing as any)) pricing = null;
  if (!pricing) pricing = null;

  let kind = str(body.kind, 20) || "service";
  if (!KINDS.includes(kind as any)) kind = "service";
  let platform: string | null = null;
  if (kind === "extension") {
    const p = str(body.platform, 20);
    platform = PLATFORMS.includes(p as any) ? p : "other";
  }

  const isLocalBiz = !!body.isLocalBiz;
  let lat: number | null = null;
  let lng: number | null = null;
  if (body.lat != null && body.lat !== "") {
    const n = Number(body.lat);
    if (Number.isFinite(n) && n >= -90 && n <= 90) lat = n;
  }
  if (body.lng != null && body.lng !== "") {
    const n = Number(body.lng);
    if (Number.isFinite(n) && n >= -180 && n <= 180) lng = n;
  }

  return {
    ok: true,
    data: {
      nameKo, nameEn, taglineKo, taglineEn,
      descKo: str(body.descKo, MAX.long),
      descEn: str(body.descEn, MAX.long),
      category, stage, region,
      pricing,
      tags: str(body.tags, MAX.tags),
      kind, platform,
      repoUrl: safeExternalUrl(body.repoUrl),
      websiteUrl: safeExternalUrl(body.websiteUrl),
      instagramUrl: safeExternalUrl(body.instagramUrl),
      logoUrl: safeExternalUrl(body.logoUrl),
      isLocalBiz,
      address: str(body.address, MAX.mid) || null,
      lat, lng,
      mapProvider: isLocalBiz ? str(body.mapProvider, 20) || "naver" : null,
      submitterName: str(body.submitterName, MAX.short) || null,
      submitterEmail: str(body.submitterEmail, MAX.short) || null,
    },
  };
}
