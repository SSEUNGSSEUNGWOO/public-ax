"use client";

import { useState } from "react";
import Link from "next/link";
import { Guide, GuideImage } from "@/lib/guides";
import { ContentCounts } from "@/lib/counts";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  "AI 기초": "text-blue-600 dark:text-blue-400",
  "실무 활용": "text-emerald-600 dark:text-emerald-400",
  "기술 심화": "text-violet-600 dark:text-violet-400",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  "입문": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "기초": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "심화": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const CATEGORY_ACTIVE: Record<string, string> = {
  "AI 기초": "bg-blue-500 text-white",
  "실무 활용": "bg-emerald-500 text-white",
  "기술 심화": "bg-violet-500 text-white",
};

const DIFFICULTY_ACTIVE: Record<string, string> = {
  "입문": "bg-emerald-500 text-white",
  "기초": "bg-blue-500 text-white",
  "심화": "bg-violet-500 text-white",
};

interface GuideListProps {
  guides: Guide[];
  counts: ContentCounts;
}

const PAGE_SIZE = 6;

export function GuideList({ guides, counts }: GuideListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const categories = Array.from(new Set(guides.map((g) => g.category).filter(Boolean)));
  const difficulties = Array.from(new Set(guides.map((g) => g.difficulty).filter(Boolean))) as string[];

  const q = query.trim().toLowerCase();
  const filtered = guides.filter((g) => {
    if (activeCategory && g.category !== activeCategory) return false;
    if (activeDifficulty && g.difficulty !== activeDifficulty) return false;
    if (q && !g.title.toLowerCase().includes(q) && !g.summary.toLowerCase().includes(q) && !g.tags.some((t) => t.toLowerCase().includes(q))) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() { setPage(1); }

  return (
    <div>
      {/* 검색창 */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="제목, 요약, 태그 검색..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); resetPage(); }}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/40"
        />
        {query && (
          <button onClick={() => { setQuery(""); resetPage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {/* 필터 */}
      <div className="flex flex-col gap-3 mb-8">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveCategory(null); resetPage(); }}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                activeCategory === null
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40"
              )}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); resetPage(); }}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                  activeCategory === cat
                    ? (CATEGORY_ACTIVE[cat] ?? "bg-foreground text-background") + " border-transparent"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {difficulties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveDifficulty(null); resetPage(); }}
              className={cn(
                "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all duration-150",
                activeDifficulty === null
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40"
              )}
            >
              전체 난이도
            </button>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => { setActiveDifficulty(activeDifficulty === diff ? null : diff); resetPage(); }}
                className={cn(
                  "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all duration-150",
                  activeDifficulty === diff
                    ? (DIFFICULTY_ACTIVE[diff] ?? "bg-foreground text-background") + " border-transparent"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                )}
              >
                {diff}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 결과 수 */}
      <p className="text-xs text-muted-foreground mb-5">
        {filtered.length}개의 가이드
      </p>

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">해당하는 가이드가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((guide) => {
            const cover = (guide.images ?? []).find((img: GuideImage) => img.type === "cover");
            const colorClass = CATEGORY_COLORS[guide.category] ?? "text-primary";
            const difficulty = guide.difficulty;
            return (
              <Link
                key={guide.slug}
                href={`/guide/${guide.slug}`}
                className="group flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:bg-primary/10 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="relative w-full aspect-video bg-muted overflow-hidden">
                  {cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.url}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={`text-xs font-semibold uppercase tracking-widest ${colorClass} opacity-40`}>
                        {guide.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${colorClass}`}>
                      {guide.category}
                    </span>
                    {difficulty && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[difficulty] ?? "bg-muted text-muted-foreground"}`}>
                        {difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {guide.summary}
                  </p>
                  <div className="flex flex-nowrap gap-1.5 mt-3 overflow-hidden">
                    {guide.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground/60">조회 {guide.views ?? 0}</span>
                    <span className="text-[10px] text-muted-foreground/40">·</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {counts[guide.slug]?.likes ?? 0}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="flex items-center justify-center gap-1 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "w-8 h-8 text-sm rounded-lg transition-all duration-150",
                p === page
                  ? "bg-foreground text-background font-semibold"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
