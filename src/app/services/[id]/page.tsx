import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ServiceDetailClient, { type ServiceFull } from "./ServiceDetailClient";

export const dynamic = "force-dynamic";

async function getService(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

// 공유 링크 미리보기 & 구글 색인용 메타데이터 (홍보 효과 직결)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const s = await getService(params.id);
  if (!s) return { title: "Not found | AI 서비스 허브" };
  const title = `${s.nameKo} (${s.nameEn}) | AI 서비스 허브`;
  const description = s.taglineKo || s.taglineEn;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "AI 서비스 허브",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const s = await getService(params.id);
  if (!s || s.status !== "approved") notFound();

  // 조회수 +1 (실패해도 페이지는 정상 렌더)
  prisma.service.update({ where: { id: s.id }, data: { views: { increment: 1 } } }).catch(() => {});

  // 클라이언트로 넘길 직렬화 가능한 평면 객체
  const service: ServiceFull = {
    id: s.id,
    nameKo: s.nameKo, nameEn: s.nameEn,
    taglineKo: s.taglineKo, taglineEn: s.taglineEn,
    descKo: s.descKo, descEn: s.descEn,
    category: s.category, stage: s.stage, region: s.region,
    websiteUrl: s.websiteUrl, instagramUrl: s.instagramUrl,
    pricing: s.pricing,
    isLocalBiz: s.isLocalBiz, address: s.address, lat: s.lat, lng: s.lng,
    views: s.views, upvotes: s.upvotes, tags: s.tags,
  };

  return <ServiceDetailClient service={service} />;
}
