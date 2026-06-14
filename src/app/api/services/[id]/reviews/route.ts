import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/services/:id/reviews
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const reviews = await prisma.review.findMany({
    where: { serviceId: params.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reviews });
}

// POST /api/services/:id/reviews  { author, rating, body }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = await req.json().catch(() => null);
    if (!b || typeof b !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const rating = Math.round(Number(b.rating));
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }
    const body = typeof b.body === "string" ? b.body.trim().slice(0, 2000) : "";
    if (!body) return NextResponse.json({ error: "Review body required" }, { status: 400 });
    const author = (typeof b.author === "string" ? b.author.trim() : "").slice(0, 60) || "익명";

    // 서비스 존재 확인
    const svc = await prisma.service.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!svc) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    // 리뷰 생성 + 집계 갱신 (원자적)
    const [review] = await prisma.$transaction([
      prisma.review.create({ data: { serviceId: params.id, author, rating, body } }),
      prisma.service.update({
        where: { id: params.id },
        data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ review }, { status: 201 });
  } catch (e: any) {
    console.error("POST review failed:", e);
    const code = e?.code ? ` [${e.code}]` : "";
    return NextResponse.json(
      { error: `리뷰 등록 실패: DB 오류${code}. db:push 여부를 확인하세요.` },
      { status: 500 }
    );
  }
}
