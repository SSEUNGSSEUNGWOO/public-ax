import { MetadataRoute } from "next";
import { getAllInsights } from "@/lib/insights";
import { getAllGuides } from "@/lib/guides";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://public-ax.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [insights, guides] = await Promise.all([getAllInsights(), getAllGuides()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/insights`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/proc`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/champions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/join`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const insightPages: MetadataRoute.Sitemap = insights.map((i) => ({
    url: `${SITE_URL}/insights/${encodeURIComponent(i.slug)}`,
    lastModified: new Date(i.published_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${SITE_URL}/guide/${encodeURIComponent(g.slug)}`,
    lastModified: new Date(g.published_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...insightPages, ...guidePages];
}
