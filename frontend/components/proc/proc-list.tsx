"use client";

import { useState, useMemo, useEffect } from "react";
import { BidItem, AI_CATEGORIES, AiCategory } from "@/lib/g2b";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const BIZ_COLORS: Record<string, string> = {
  "용역": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "물품": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "공사": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const CATEGORY_COLORS: Record<string, string> = {
  "LLM/생성형 AI": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "RAG/지식 검색": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "컴퓨터 비전": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "음성/STT": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "빅데이터 분석": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "AI 인프라/MLOps": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "AI 자율주행/로봇": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "AI 의료/헬스케어": "bg-red-500/10 text-red-600 dark:text-red-400",
  "AI 보안": "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  "AI 정책/연구용역": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "AI 교육/컨설팅": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "디지털 전환": "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  "기타 AI": "bg-muted text-muted-foreground",
};

function getDday(dateStr: string, timeStr?: string): number {
  if (!dateStr) return 999;
  const close = new Date(`${dateStr}T${timeStr ?? "23:59"}:00`);
  const now = new Date();
  return Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatBudget(amt: string): string {
  const n = parseInt(amt ?? "0");
  if (!n) return "-";
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return `${n.toLocaleString()}원`;
}

function highlightKeyword(text: string, keyword: string | null): string {
  if (!keyword || !text.includes(keyword)) return text;
  return text;
}

function DdayBadge({ dday }: { dday: number }) {
  if (dday < 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">마감</span>;
  if (dday === 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">D-day</span>;
  if (dday <= 3) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">D-{dday}</span>;
  if (dday <= 7) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">D-{dday}</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">D-{dday}</span>;
}

type SortKey = "dday" | "latest" | "budget";

interface ProcListProps {
  bids: BidItem[];
}

export function ProcList({ bids }: ProcListProps) {
  const [activeCategory, setActiveCategory] = useState<AiCategory | null>(null);
  const [sort, setSort] = useState<SortKey>("dday");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const q = query.trim().toLowerCase();

  // 필터·정렬·검색 변경 시 페이지 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [activeCategory, sort, q]);

  const filtered = useMemo(() => {
    let list = bids;
    if (activeCategory) list = list.filter((b) => b.aiCategory === activeCategory);
    if (q) list = list.filter((b) => b.bidNtceNm?.toLowerCase().includes(q) || b.ntceInsttNm?.toLowerCase().includes(q));
    return list.slice().sort((a, b) => {
      if (sort === "dday") {
        const da = getDday(a.bidClseDate, a.bidClseTm);
        const db = getDday(b.bidClseDate, b.bidClseTm);
        if (da < 0 && db >= 0) return 1;
        if (da >= 0 && db < 0) return -1;
        return da - db;
      }
      if (sort === "latest") return b.bidNtceDate.localeCompare(a.bidNtceDate);
      if (sort === "budget") return parseInt(b.asignBdgtAmt ?? "0") - parseInt(a.asignBdgtAmt ?? "0");
      return 0;
    });
  }, [bids, activeCategory, sort, q]);

  return (
    <div>

      {/* 툴바 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* 검색 */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="공고명, 기관명 검색..."
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

        {/* 정렬 */}
        <div className="flex items-center gap-1 border rounded-xl p-1 bg-muted/30 self-start">
          {(["dday", "latest", "budget"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg transition-all duration-150",
                sort === s ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "dday" ? "마감임박순" : s === "latest" ? "최신순" : "예산순"}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
            activeCategory === null
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-muted-foreground border-border hover:border-foreground/40"
          )}
        >
          전체 <span className="opacity-60 ml-0.5">{bids.length}</span>
        </button>
        {AI_CATEGORIES.map((cat) => {
          const count = bids.filter((b) => b.aiCategory === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40"
              )}
            >
              {cat} <span className="opacity-60 ml-0.5">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 결과 수 */}
      {(() => {
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
        const end = Math.min(page * PAGE_SIZE, total);
        return (
          <p className="text-xs text-muted-foreground mb-4">
            {total === 0 ? "0개 공고" : `${total}개 공고 중 ${start}-${end}`}
            {totalPages > 1 && <span className="text-muted-foreground/60"> · {page}/{totalPages} 페이지</span>}
          </p>
        );
      })()}

      {/* 공고 리스트 */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">해당하는 공고가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((bid, idx) => {
            const dday = getDday(bid.bidClseDate, bid.bidClseTm);
            const budget = formatBudget(bid.asignBdgtAmt || bid.presmptPrce);
            const bizColor = BIZ_COLORS[bid.bsnsDivNm] ?? "bg-muted text-muted-foreground";
            return (
              <a
                key={`${bid.bidNtceNo}-${bid.bidNtceOrd}-${idx}`}
                href={bid.bidNtceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border bg-card p-5 hover:shadow-md hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", bizColor)}>
                      {bid.bsnsDivNm || "기타"}
                    </span>
                    {bid.aiCategory && bid.aiCategory !== "무관" && (
                      <span className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        CATEGORY_COLORS[bid.aiCategory] ?? "bg-muted text-muted-foreground"
                      )}>
                        {bid.aiCategory}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground/60">{bid.ntceInsttNm}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {bid.bidNtceNm}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">공고 {bid.bidNtceDate}</span>
                    {bid.bidClseDate && (
                      <span className="text-xs text-muted-foreground">
                        마감 {bid.bidClseDate} {bid.bidClseTm}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 flex-shrink-0">
                  <DdayBadge dday={dday} />
                  <span className="text-sm font-bold text-foreground">{budget}</span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {filtered.length > PAGE_SIZE && (
        <Pagination
          page={page}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  // 표시할 페이지 번호: 현재 ±2 + 처음·마지막
  const pages: (number | "...")[] = [];
  const window = 2;
  const add = (n: number) => pages.push(n);
  add(1);
  if (page - window > 2) pages.push("...");
  for (let i = Math.max(2, page - window); i <= Math.min(totalPages - 1, page + window); i++) {
    add(i);
  }
  if (page + window < totalPages - 1) pages.push("...");
  if (totalPages > 1) add(totalPages);

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        이전
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="text-xs text-muted-foreground/50 px-1">···</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "text-xs font-medium min-w-[32px] px-2 py-1.5 rounded-lg border transition-colors",
              p === page
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground hover:text-foreground hover:border-foreground/40"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        다음
      </button>
    </div>
  );
}
