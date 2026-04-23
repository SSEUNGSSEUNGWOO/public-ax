import { createClient } from "@supabase/supabase-js";

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
}

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getAllInsights(): Promise<Insight[]> {
  const { data, error } = await getClient()
    .from("insights")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("insights fetch error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getInsightBySlug(slug: string): Promise<Insight | null> {
  const decoded = decodeURIComponent(slug);
  const { data, error } = await getClient()
    .from("insights")
    .select("*")
    .or(`slug.eq.${decoded},slug.eq.${slug}`)
    .single();

  if (error) return null;
  return data;
}
