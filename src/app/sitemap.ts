import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/tools`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/register`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/map`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const services = await prisma.service.findMany({
      where: { status: "approved" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });
    const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
      url: `${base}/services/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticPages, ...servicePages];
  } catch {
    return staticPages;
  }
}
