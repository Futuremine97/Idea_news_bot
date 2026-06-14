import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUSES = ["going", "saved", "went"] as const;

// GET /api/services/:id/checkin  → 상태별 카운트 + 사람 목록(공개)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const checkins = await prisma.checkin.findMany({
    where: { serviceId: params.id },
    orderBy: { updatedAt: "desc" },
    take: 300,
    select: { visitorId: true, nickname: true, status: true },
  });
  const counts = { going: 0, saved: 0, went: 0 } as Record<string, number>;
  for (const c of checkins) if (counts[c.status] != null) counts[c.status]++;
  return NextResponse.json({ counts, people: checkins });
}

// POST /api/services/:id/checkin  { visitorId, nickname, status }
// status 가 STATUSES 면 upsert, "none" 이면 삭제(토글 해제)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = await req.json().catch(() => null);
    const visitorId = typeof b?.visitorId === "string" ? b.visitorId.trim().slice(0, 80) : "";
    if (!visitorId) return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
    const nickname = (typeof b?.nickname === "string" ? b.nickname.trim() : "").slice(0, 30) || "게스트";
    const status = typeof b?.status === "string" ? b.status : "";

    if (status === "none") {
      await prisma.checkin.deleteMany({ where: { serviceId: params.id, visitorId } });
      return NextResponse.json({ ok: true, status: null });
    }
    if (!STATUSES.includes(status as any)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 서비스 존재 확인
    const svc = await prisma.service.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!svc) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const checkin = await prisma.checkin.upsert({
      where: { serviceId_visitorId: { serviceId: params.id, visitorId } },
      create: { serviceId: params.id, visitorId, nickname, status },
      update: { nickname, status },
    });
    return NextResponse.json({ ok: true, status: checkin.status });
  } catch (e: any) {
    console.error("checkin failed:", e);
    const code = e?.code ? ` [${e.code}]` : "";
    return NextResponse.json({ error: `체크인 실패: DB 오류${code}. db:push 여부를 확인하세요.` }, { status: 500 });
  }
}
