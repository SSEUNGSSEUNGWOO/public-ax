import { db } from "@/lib/db";
import { guides } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface GuideVideo {
  title: string;
  url: string;
  channel: string;
}

export interface GuideImage {
  id: string;
  type: "cover" | "diagram" | "example" | "infographic" | "screenshot";
  description: string;
  url?: string;
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  category: string;
  difficulty?: string;
  tags: string[];
  published_at: string;
  body: string;
  videos?: GuideVideo[];
  images?: GuideImage[];
  evaluation_score?: number;
  status?: "draft" | "published";
  views?: number;
}

function rowToGuide(row: typeof guides.$inferSelect): Guide {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category,
    tags: row.tags,
    published_at: row.publishedAt,
    body: row.body,
    videos: row.videos as GuideVideo[] | undefined,
    images: row.images as GuideImage[] | undefined,
    evaluation_score: row.evaluationScore ?? undefined,
    status: row.status as "draft" | "published" | undefined,
    views: row.views ?? undefined,
  };
}

export async function getAllGuides(): Promise<Guide[]> {
  try {
    const rows = await db
      .select()
      .from(guides)
      .where(eq(guides.status, "published"))
      .orderBy(desc(guides.publishedAt));

    return rows.map(rowToGuide);
  } catch (error) {
    console.error("guides fetch error:", error);
    return [];
  }
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  try {
    const rows = await db
      .select()
      .from(guides)
      .where(eq(guides.slug, slug))
      .limit(1);

    if (rows.length === 0) return null;
    return rowToGuide(rows[0]);
  } catch {
    return null;
  }
}
