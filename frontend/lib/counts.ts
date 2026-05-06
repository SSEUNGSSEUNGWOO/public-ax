import { db } from "@/lib/db";
import { likes, comments } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export interface ContentCounts {
  [slug: string]: { likes: number; comments: number };
}

export async function getCountsForType(contentType: "insight" | "guide"): Promise<ContentCounts> {
  const [likeRows, commentRows] = await Promise.all([
    db
      .select({
        contentId: likes.contentId,
        count: sql<number>`count(*)::int`,
      })
      .from(likes)
      .where(eq(likes.contentType, contentType))
      .groupBy(likes.contentId),
    db
      .select({
        contentId: comments.contentId,
        count: sql<number>`count(*)::int`,
      })
      .from(comments)
      .where(eq(comments.contentType, contentType))
      .groupBy(comments.contentId),
  ]);

  const result: ContentCounts = {};

  for (const row of likeRows) {
    if (!result[row.contentId]) result[row.contentId] = { likes: 0, comments: 0 };
    result[row.contentId].likes = row.count;
  }
  for (const row of commentRows) {
    if (!result[row.contentId]) result[row.contentId] = { likes: 0, comments: 0 };
    result[row.contentId].comments = row.count;
  }

  return result;
}
