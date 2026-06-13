import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/services/:id  (조회수 증가)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.service.update({ where: { id: params.id }, data: { views: { increment: 1 } } });
  return NextResponse.json({ service });
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
