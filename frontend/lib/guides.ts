import { createClient } from "@supabase/supabase-js";

export interface GuideVideo {
  title: string;
  url: string;
  channel: string;
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  published_at: string;
  body: string;
  videos?: GuideVideo[];
  evaluation_score?: number;
  status?: "draft" | "published";
}

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getAllGuides(): Promise<Guide[]> {
  const { data, error } = await getClient()
    .from("guides")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("guides fetch error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const { data, error } = await getClient()
    .from("guides")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}
