import fs from "fs";
import path from "path";

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

const DATA_PATH = path.join(
  process.cwd().includes("frontend")
    ? process.cwd()
    : path.join(process.cwd(), "frontend"),
  "content",
  "guides.json"
);

export function getAllGuides(): Guide[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw) as Guide[];
    return data
      .filter((g) => !g.status || g.status === "published")
      .sort((a, b) => b.published_at.localeCompare(a.published_at));
  } catch {
    return [];
  }
}

export function getGuideBySlug(slug: string): Guide | null {
  const decoded = decodeURIComponent(slug);
  return getAllGuides().find((g) => g.slug === decoded || g.slug === slug) ?? null;
}
