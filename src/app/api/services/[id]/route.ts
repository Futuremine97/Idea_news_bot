import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseServiceInput } from "@/lib/serviceInput";

export const dynamic = "force-dynamic";

function publicView<T extends { ownerToken?: string | null }>(s: T) {
  const { ownerToken, ...rest } = s;
  return rest;
}

// 소유자/관리자 토큰 검증
function isOwner(service: { ownerToken: string | null }, token: string): boolean {
  if (token && service.ownerToken && token === service.ownerToken) return true;
  const admin = process.env.ADMIN_TOKEN;
  if (admin && token && token === admin) return true;
  return false;
}

// GET /api/services/:id  (조회수 증가) — ownerToken 미노출
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.service.update({ where: { id: params.id }, data: { views: { increment: 1 } } });
  return NextResponse.json({ service: publicView(service) });
}

// POST /api/services/:id  (action: "upvote")
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  if (body.action === "upvote") {
    const updated = await prisma.service.update({
      where: { id: params.id },
      data: { upvotes: { increment: 1 } },
    });
    return NextResponse.json({ upvotes: updated.upvotes });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// PATCH /api/services/:id  { ownerToken, ...fields } — 소유자 수정
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => null);
    const token = typeof body?.ownerToken === "string" ? body.ownerToken : "";

    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isOwner(existing, token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = parseServiceInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    // status / featured / ownerToken 은 변경 불가(권한 분리)
    const updated = await prisma.service.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ service: publicView(updated) });
  } catch (e: any) {
    console.error("PATCH service failed:", e);
    const code = e?.code ? ` [${e.code}]` : "";
    return NextResponse.json({ error: `수정 실패: DB 오류${code}.` }, { status: 500 });
  }
}

// DELETE /api/services/:id  { ownerToken } — 소유자 삭제
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const token =
      (typeof body?.ownerToken === "string" && body.ownerToken) ||
      req.nextUrl.searchParams.get("token") ||
      "";

    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isOwner(existing, token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.service.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE service failed:", e);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
