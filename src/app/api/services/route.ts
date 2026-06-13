import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeExternalUrl } from "@/lib/url";
import { CATEGORIES, STAGES, REGIONS, PRICING } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX = { short: 120, mid: 300, long: 4000, tags: 300 };

function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

// GET /api/services?q=&category=&stage=&region=&localOnly=&sort=
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const category = sp.get("category") || undefined;
  const stage = sp.get("stage") || undefined;
  const region = sp.get("region") || undefined;
  const localOnly = sp.get("localOnly") === "1";
  const sort = sp.get("sort") || "featured";

  const where: any = { status: "approved" };
  if (category && category !== "all") where.category = category;
  if (stage && stage !== "all") where.stage = stage;
  if (region && region !== "all") where.region = region;
  if (localOnly) where.isLocalBiz = true;
  if (q) {
    where.OR = [
      { nameKo: { contains: q } },
      { nameEn: { contains: q } },
      { taglineKo: { contains: q } },
      { taglineEn: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  const orderBy =
    sort === "new"
      ? [{ createdAt: "desc" as const }]
      : sort === "top"
      ? [{ upvotes: "desc" as const }, { views: "desc" as const }]
      : [{ featured: "desc" as const }, { upvotes: "desc" as const }, { createdAt: "desc" as const }];

  const services = await prisma.service.findMany({ where, orderBy });
  return NextResponse.json({ services });
}

// POST /api/services — 누구나 등록 (입력 검증 + URL 살균)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const data = {
      nameKo: str(body.nameKo, MAX.short),
      nameEn: str(body.nameEn, MAX.short),
      taglineKo: str(body.taglineKo, MAX.mid),
      taglineEn: str(body.taglineEn, MAX.mid),
      descKo: str(body.descKo, MAX.long),
      descEn: str(body.descEn, MAX.long),
      category: str(body.category, 40),
      stage: str(body.stage, 20),
      region: str(body.region, 20),
      pricing: str(body.pricing, 20),
      tags: str(body.tags, MAX.tags),
      address: str(body.address, MAX.mid),
      submitterName: str(body.submitterName, MAX.short),
      submitterEmail: str(body.submitterEmail, MAX.short),
    };

    // 필수 필드
    for (const f of ["nameKo", "nameEn", "taglineKo", "taglineEn"] as const) {
      if (!data[f]) return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
    }
    // enum 검증
    if (!CATEGORIES.includes(data.category as any))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    if (!STAGES.includes(data.stage as any))
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    if (!REGIONS.includes(data.region as any))
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    if (data.pricing && !PRICING.includes(data.pricing as any)) data.pricing = "";

    // URL 살균 (http/https 만 허용 → javascript: 등 XSS 차단)
    const websiteUrl = safeExternalUrl(body.websiteUrl);
    const instagramUrl = safeExternalUrl(body.instagramUrl);
    const logoUrl = safeExternalUrl(body.logoUrl);

    // 좌표 검증
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

    const created = await prisma.service.create({
      data: {
        ...data,
        pricing: data.pricing || null,
        address: data.address || null,
        submitterName: data.submitterName || null,
        submitterEmail: data.submitterEmail || null,
        websiteUrl,
        instagramUrl,
        logoUrl,
        isLocalBiz,
        lat,
        lng,
        mapProvider: isLocalBiz ? str(body.mapProvider, 20) || "naver" : null,
        source: "manual",
        // 데모: 즉시 노출. 운영 시 "pending" 으로 두고 검수 권장.
        status: "approved",
      },
    });

    return NextResponse.json({ service: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
