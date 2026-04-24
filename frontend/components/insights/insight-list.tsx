"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Insight } from "@/lib/insights";
import { ContentCounts } from "@/lib/counts";
import { cn } from "@/lib/utils";

interface InsightListProps {
  insights: Insight[];
  counts: ContentCounts;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(dateStr: string) {
  // "2026-04-24" or "2026-04-24T..." → "2026-04-24"
  return dateStr.slice(0, 10);
}

function formatMonthLabel(year: number, month: number) {
  return `${year}년 ${month + 1}월`;
}

function InsightCalendar({ insights, counts }: InsightListProps) {
  const latestDate = useMemo(() => {
    if (insights.length === 0) return new Date();
    return new Date(insights[0].published_at);
  }, [insights]);

  const [year, setYear] = useState(latestDate.getFullYear());
  const [month, setMonth] = useState(latestDate.getMonth());

  const insightMap = useMemo(() => {
    const map: Record<string, Insight> = {};
    for (const i of insights) {
      map[toDateKey(i.published_at)] = i;
    }
    return map;
  }, [insights]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toDateKey(new Date().toISOString());

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="rounded-2xl border bg-card p-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="text-sm font-semibold">{formatMonthLabel(year, month)}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-muted-foreground/60 py-1">{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const insight = insightMap[dateKey];
          const isToday = dateKey === today;

          if (insight) {
            return (
              <Link
                key={dateKey}
                href={`/insights/${insight.slug}`}
                className="group relative aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-200"
                title={insight.title}
              >
                {insight.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={insight.image_url}
                    alt={insight.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/50">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    </svg>
                  </div>
                )}
                {/* 날짜 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className={cn(
                  "absolute top-1 left-1 text-[10px] font-bold leading-none px-1 py-0.5 rounded",
                  isToday ? "bg-primary text-primary-foreground" : "bg-black/40 text-white"
                )}>
                  {day}
                </span>
              </Link>
            );
          }

          return (
            <div
              key={dateKey}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center",
                isToday ? "ring-2 ring-primary" : "bg-muted/30"
              )}
            >
              <span className={cn(
                "text-[11px] font-medium",
                isToday ? "text-primary font-bold" : "text-muted-foreground/40"
              )}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-4 h-4 rounded bg-primary/10 border border-primary/30 inline-block" />
          리포트 있음
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-4 h-4 rounded bg-muted/30 inline-block" />
          없음
        </span>
      </div>
    </div>
  );
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

const PAGE_SIZE = 8;

export function InsightList({ insights, counts }: InsightListProps) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const insight of insights) {
      const m = formatMonth(insight.published_at);
      if (!seen.has(m)) { seen.add(m); result.push(m); }
    }
    return result;
  }, [insights]);

  const q = query.trim().toLowerCase();
  const filtered = insights.filter((i) => {
    if (activeMonth && formatMonth(i.published_at) !== activeMonth) return false;
    if (q && !i.title.toLowerCase().includes(q) && !i.body.slice(0, 300).toLowerCase().includes(q)) return false;
    return true;
  });

  // 필터/검색 변경 시 초기화
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeMonth, query]);

  // IntersectionObserver로 무한 스크롤
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
    }
  }, [filtered.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const visible = filtered.slice(0, visibleCount);
  const [latest, ...rest] = visible;
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      {/* 상단 툴바 */}
      <div className="flex items-center gap-3 mb-5">
        {/* 검색창 */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="리포트 제목 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/40"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* 뷰 토글 */}
        <div className="flex items-center gap-1 border rounded-xl p-1 bg-muted/30">
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-150",
              view === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="리스트 보기"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-150",
              view === "calendar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="캘린더 보기"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 캘린더 뷰 */}
      {view === "calendar" && (
        <InsightCalendar insights={insights} counts={counts} />
      )}

      {/* 리스트 뷰 */}
      {view === "list" && (
        <>
          {/* 월 필터 */}
          {months.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveMonth(null)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                  activeMonth === null
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                )}
              >
                전체
              </button>
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMonth(activeMonth === m ? null : m)}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                    activeMonth === m
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">해당하는 리포트가 없습니다.</p>
          ) : (
            <>
              <Link
                href={`/insights/${latest.slug}`}
                className="group block rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:bg-primary/10 transition-all duration-200 mb-12"
              >
                {latest.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={latest.image_url} alt={latest.title} className="w-full h-72 object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                )}
                <div className="p-7">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2 block">Latest · Daily Report</span>
                  <h2 className="text-2xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors">{latest.title}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <time className="text-sm text-muted-foreground">{latest.published_at}</time>
                    <span className="text-sm text-muted-foreground/60">케이브레인 AI퍼블릭센터 · 장승우</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground/70">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {counts[latest.slug]?.likes ?? 0}
                    </span>
                    <span className="text-sm text-muted-foreground/60">조회 {latest.views ?? 0}</span>
                  </div>
                </div>
              </Link>

              {rest.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">이전 리포트</h3>
                  <div className="flex flex-col gap-4">
                    {rest.map((insight) => (
                      <Link
                        key={insight.slug}
                        href={`/insights/${insight.slug}`}
                        className="group flex gap-5 rounded-2xl border bg-card p-5 hover:shadow-md hover:bg-primary/10 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        {insight.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={insight.image_url} alt={insight.title} className="w-24 h-20 sm:w-36 sm:h-24 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-500" />
                        )}
                        <div className="flex flex-col justify-between min-w-0">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1.5 block">Daily Report</span>
                            <h2 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">{insight.title}</h2>
                          </div>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <time className="text-xs text-muted-foreground">{insight.published_at}</time>
                            <span className="text-xs text-muted-foreground/60">케이브레인 AI퍼블릭센터 · 장승우</span>
                            <span className="text-xs text-muted-foreground/60">조회 {insight.views ?? 0}</span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                              {counts[insight.slug]?.likes ?? 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* 무한 스크롤 sentinel */}
              <div ref={sentinelRef} className="h-4" />
              {hasMore && (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
