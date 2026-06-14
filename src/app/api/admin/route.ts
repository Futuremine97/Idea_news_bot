import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * 관리자 검수 API. 서버 환경변수 ADMIN_TOKEN 으로 보호.
 * 요청 헤더 x-admin-token 이 ADMIN_TOKEN 과 일치해야 함.
 * ADMIN_TOKEN 미설정 시 기능 비활성(501) → 등록은 즉시 노출(approved)되는 데모 모드.
 */
function authorize(req: NextRequest): "ok" | "no-token-config" | "unauthorized" {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return "no-token-config";
  const got = req.headers.get("x-admin-token") || "";
  // 길이 + 값 비교 (간단). 운영 시 timing-safe 비교 권장.
  if (got.length === expected.length && got === expected) return "ok";
  return "unauthorized";
}

// GET /api/admin?status=pending|approved|rejected|all  → 전체 목록(검수용)
export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (auth === "no-token-config")
    return NextResponse.json({ error: "ADMIN_TOKEN not configured" }, { status: 501 });
  if (auth === "unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status") || "all";
  const where = status !== "all" ? { status } : {};
  const services = await prisma.service.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 1000,
  });
  return NextResponse.json({ services });
}

// POST /api/admin  body: { id, action: approve|reject|feature|unfeature|delete }
export async function POST(req: NextRequest) {
  const auth = authorize(req);
  if (auth === "no-token-config")
    return NextResponse.json({ error: "ADMIN_TOKEN not configured" }, { status: 501 });
  if (auth === "unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json().catch(() => null);
  const id = typeof b?.id === "string" ? b.id : "";
  const action = typeof b?.action === "string" ? b.action : "";
  if (!id || !action) return NextResponse.json({ error: "Missing id/action" }, { status: 400 });

  try {
    if (action === "delete") {
      await prisma.service.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    const data: any = {};
    if (action === "approve") data.status = "approved";
    else if (action === "reject") data.status = "rejected";
    else if (action === "feature") data.featured = true;
    else if (action === "unfeature") data.featured = false;
    else return NextResponse.json({ error: "Unknown action" }, { status: 400 });

    const updated = await prisma.service.update({ where: { id }, data });
    return NextResponse.json({ service: updated });
  } catch (e: any) {
    console.error("admin action failed:", e);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
