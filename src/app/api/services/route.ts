import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/services?q=&category=&stage=&region=&localOnly=
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const category = sp.get("category") || undefined;
  const stage = sp.get("stage") || undefined;
  const region = sp.get("region") || undefined;
  const localOnly = sp.get("localOnly") === "1";

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

  const services = await prisma.service.findMany({
    where,
    orderBy: [{ featured: "desc" }, { upvotes: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ services });
}

// POST /api/services  — 누구나 등록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 필수 필드 검증
    const required = ["nameKo", "nameEn", "taglineKo", "taglineEn", "category", "stage", "region"];
    for (const f of required) {
      if (!body[f] || String(body[f]).trim() === "") {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
      }
    }

    const created = await prisma.service.create({
      data: {
        nameKo: body.nameKo,
        nameEn: body.nameEn,
        taglineKo: body.taglineKo,
        taglineEn: body.taglineEn,
        descKo: body.descKo || "",
        descEn: body.descEn || "",
        category: body.category,
        stage: body.stage,
        region: body.region,
        websiteUrl: body.websiteUrl || null,
        instagramUrl: body.instagramUrl || null,
        logoUrl: body.logoUrl || null,
        pricing: body.pricing || null,
        isLocalBiz: !!body.isLocalBiz,
        address: body.address || null,
        lat: body.lat != null ? Number(body.lat) : null,
        lng: body.lng != null ? Number(body.lng) : null,
        mapProvider: body.mapProvider || null,
        submitterName: body.submitterName || null,
        submitterEmail: body.submitterEmail || null,
        tags: body.tags || "",
        source: "manual",
        // 데모 편의를 위해 즉시 노출. 운영 시 "pending" 으로 두고 검수 권장.
        status: "approved",
      },
    });

    return NextResponse.json({ service: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
