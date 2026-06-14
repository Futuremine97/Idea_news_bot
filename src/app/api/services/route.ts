import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseServiceInput } from "@/lib/serviceInput";

export const dynamic = "force-dynamic";

// 공개 응답에서 비공개 필드(ownerToken) 제거
function publicView<T extends { ownerToken?: string | null }>(s: T) {
  const { ownerToken, ...rest } = s;
  return rest;
}

// GET /api/services?q=&category=&stage=&region=&localOnly=&sort=&kind=&platform=
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const category = sp.get("category") || undefined;
  const stage = sp.get("stage") || undefined;
  const region = sp.get("region") || undefined;
  const localOnly = sp.get("localOnly") === "1";
  const sort = sp.get("sort") || "featured";
  const kind = sp.get("kind") || undefined;
  const platform = sp.get("platform") || undefined;

  const where: any = { status: "approved" };
  if (category && category !== "all") where.category = category;
  if (stage && stage !== "all") where.stage = stage;
  if (region && region !== "all") where.region = region;
  if (kind && kind !== "all") where.kind = kind;
  if (platform && platform !== "all") where.platform = platform;
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
  return NextResponse.json({ services: services.map(publicView) });
}

// POST /api/services — 누구나 등록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = parseServiceInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    // 소유자 관리 토큰 발급 (등록자만 알게 됨 → 수정/삭제 권한)
    const ownerToken = crypto.randomUUID();

    const created = await prisma.service.create({
      data: {
        ...parsed.data,
        source: "manual",
        // ADMIN_TOKEN 설정 시 검수 대기(pending), 미설정 시 즉시 노출(approved).
        status: process.env.ADMIN_TOKEN ? "pending" : "approved",
        ownerToken,
      },
    });

    // 생성 응답에는 ownerToken 포함(등록자 본인에게 1회 전달) → 관리 페이지 진입용
    return NextResponse.json({ service: created, ownerToken }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/services failed:", e);
    const code = e?.code ? ` [${e.code}]` : "";
    return NextResponse.json(
      { error: `등록 실패: 데이터베이스 오류${code}. DB 마이그레이션(npm run db:push) 및 DATABASE_URL 설정을 확인하세요.` },
      { status: 500 }
    );
  }
}
