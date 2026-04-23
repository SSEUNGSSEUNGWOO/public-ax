import fs from "fs";
import path from "path";

export interface Insight {
  slug: string;
  title: string;
  body: string;
  sources: { title: string; url: string; source_id: string }[];
  published_at: string;
  category: string;
  image_url: string | null;
  evaluation_score: number | null;
}

const DATA_PATH = path.join(
  process.cwd().includes("frontend")
    ? process.cwd()
    : path.join(process.cwd(), "frontend"),
  "..",
  "ai-service",
  "insights",
  "data",
  "insights.json"
);

export function getAllInsights(): Insight[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw) as Insight[];
    return data.sort((a, b) => b.published_at.localeCompare(a.published_at));
  } catch {
    return [];
  }
}

export function getInsightBySlug(slug: string): Insight | null {
  const decoded = decodeURIComponent(slug);
  return getAllInsights().find((i) => i.slug === decoded || i.slug === slug) ?? null;
}
