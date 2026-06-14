import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/lists/:visitorId → 해당 방문자의 체크인 목록(공개), 상태별 그룹
export async function GET(_req: NextRequest, { params }: { params: { visitorId: string } }) {
  const checkins = await prisma.checkin.findMany({
    where: { visitorId: params.visitorId },
    orderBy: { updatedAt: "desc" },
    take: 500,
    include: {
      service: {
        select: {
          id: true, nameKo: true, nameEn: true, taglineKo: true, taglineEn: true,
          category: true, stage: true, region: true, kind: true, platform: true,
          pricing: true, isLocalBiz: true, featured: true, views: true, upvotes: true,
          tags: true, ratingSum: true, ratingCount: true, status: true,
        },
      },
    },
  });

  const nickname = checkins[0]?.nickname ?? "게스트";
  const groups: Record<string, any[]> = { going: [], saved: [], went: [] };
  for (const c of checkins) {
    // 승인된 서비스만 공개
    if (c.service && c.service.status === "approved" && groups[c.status]) {
      groups[c.status].push(c.service);
    }
  }
  return NextResponse.json({ nickname, groups });
}
