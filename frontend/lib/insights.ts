import { db } from "@/lib/db";
import { insights } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";

export interface Insight {
  slug: string;
  title: string;
  body: string;
  sources: { title: string; url: string; source_id: string }[];
  published_at: string;
  category: string;
  image_url: string | null;
  evaluation_score: number | null;
  crawled_count: number;
  views?: number;
}

function rowToInsight(row: typeof insights.$inferSelect): Insight {
  return {
    slug: row.slug,
    title: row.title,
    body: row.body,
    sources: row.sources as Insight["sources"],
    published_at: row.publishedAt,
    category: row.category,
    image_url: row.imageUrl,
    evaluation_score: row.evaluationScore,
    crawled_count: row.crawledCount,
    views: row.views ?? undefined,
  };
}

export async function getAllInsights(): Promise<Insight[]> {
  try {
    const rows = await db
      .select()
      .from(insights)
      .orderBy(desc(insights.publishedAt));

    return rows.map(rowToInsight);
  } catch (error) {
    console.error("insights fetch error:", error);
    return [];
  }
}

export async function getInsightBySlug(slug: string): Promise<Insight | null> {
  const decoded = decodeURIComponent(slug);
  try {
    const rows = await db
      .select()
      .from(insights)
      .where(or(eq(insights.slug, decoded), eq(insights.slug, slug)))
      .limit(1);

    if (rows.length === 0) return null;
    return rowToInsight(rows[0]);
  } catch {
    return null;
  }
}
