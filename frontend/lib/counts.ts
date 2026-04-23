import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ContentCounts {
  [slug: string]: { likes: number; comments: number };
}

export async function getCountsForType(contentType: "insight" | "guide"): Promise<ContentCounts> {
  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase
      .from("likes")
      .select("content_id")
      .eq("content_type", contentType),
    supabase
      .from("comments")
      .select("content_id")
      .eq("content_type", contentType),
  ]);

  const result: ContentCounts = {};

  for (const row of likes ?? []) {
    if (!result[row.content_id]) result[row.content_id] = { likes: 0, comments: 0 };
    result[row.content_id].likes++;
  }
  for (const row of comments ?? []) {
    if (!result[row.content_id]) result[row.content_id] = { likes: 0, comments: 0 };
    result[row.content_id].comments++;
  }

  return result;
}
