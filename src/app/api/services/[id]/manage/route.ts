import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/services/:id/manage?token=...  → 소유자 전용: 편집용 데이터 + 통계
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = process.env.ADMIN_TOKEN;
  const owner = service.ownerToken && token === service.ownerToken;
  const isAdmin = admin && token === admin;
  if (!owner && !isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checkins = await prisma.checkin.findMany({
    where: { serviceId: params.id },
    select: { status: true },
  });
  const checkinCounts = { going: 0, saved: 0, went: 0 } as Record<string, number>;
  for (const c of checkins) if (checkinCounts[c.status] != null) checkinCounts[c.status]++;
  const reviewCount = await prisma.review.count({ where: { serviceId: params.id } });

  const { ownerToken, ...rest } = service;
  return NextResponse.json({
    service: rest, // 편집용 전체 필드(ownerToken 제외)
    stats: {
      views: service.views,
      upvotes: service.upvotes,
      ratingAvg: service.ratingCount > 0 ? service.ratingSum / service.ratingCount : 0,
      ratingCount: service.ratingCount,
      reviewCount,
      checkins: checkinCounts,
      status: service.status,
      featured: service.featured,
    },
  });
}
