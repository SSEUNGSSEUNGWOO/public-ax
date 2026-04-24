"use client";

import { useState, useMemo, useEffect } from "react";
import { BidItem, AI_KEYWORDS, AiKeyword, MonthStat } from "@/lib/g2b";
import { cn } from "@/lib/utils";

const BIZ_COLORS: Record<string, string> = {
  "용역": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "물품": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "공사": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
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
  stats: {
    total: number;
    totalBudget: number;
    urgent: number;
    topAgency: string;
  };
}

function MonthlyTrend({ data }: { data: MonthStat[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="rounded-2xl border bg-card p-5 mb-8">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">월별 AI 공고 추이 (최근 6개월)</p>
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => {
          const height = Math.max((d.count / maxCount) * 100, 4);
          const isLast = i === data.length - 1;
          return (
            <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] font-semibold text-muted-foreground">{d.count}</span>
              <div
                className={cn("w-full rounded-t-md transition-all", isLast ? "bg-primary" : "bg-primary/30")}
                style={{ height: `${height}%` }}
              />
              <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                {d.label.slice(5)}월
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProcList({ bids, stats }: ProcListProps) {
  const [monthlyStats, setMonthlyStats] = useState<MonthStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proc/stats")
      .then((r) => r.json())
      .then(setMonthlyStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);
  const [activeKeyword, setActiveKeyword] = useState<AiKeyword | null>(null);
  const [sort, setSort] = useState<SortKey>("dday");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = bids;
    if (activeKeyword) list = list.filter((b) => b.bidNtceNm?.includes(activeKeyword));
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
  }, [bids, activeKeyword, sort, q]);

  return (
    <div>
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "이번달 AI 공고", value: `${stats.total}건`, sub: "나라장터 기준" },
          { label: "총 예산 규모", value: formatBudget(String(stats.totalBudget)), sub: "배정예산 합계" },
          { label: "마감 임박", value: `${stats.urgent}건`, sub: "D-7 이내", urgent: true },
          { label: "최다 발주기관", value: stats.topAgency, sub: "공고 수 기준" },
        ].map((s) => (
          <div key={s.label} className={cn(
            "rounded-2xl border bg-card p-5",
            s.urgent && stats.urgent > 0 && "border-red-400/40"
          )}>
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={cn(
              "text-xl font-bold leading-tight mb-0.5 truncate",
              s.urgent && stats.urgent > 0 && "text-red-500 dark:text-red-400"
            )}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground/60">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 월별 트렌드 */}
      {statsLoading ? (
        <div className="rounded-2xl border bg-card p-5 mb-8 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm text-muted-foreground">과거 데이터 불러오는 중...</span>
        </div>
      ) : monthlyStats.length > 1 && (
        <MonthlyTrend data={monthlyStats} />
      )}

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

      {/* 키워드 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveKeyword(null)}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
            activeKeyword === null
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-muted-foreground border-border hover:border-foreground/40"
          )}
        >
          전체 <span className="opacity-60 ml-0.5">{bids.length}</span>
        </button>
        {AI_KEYWORDS.map((kw) => {
          const count = bids.filter((b) => b.bidNtceNm?.includes(kw)).length;
          if (count === 0) return null;
          return (
            <button
              key={kw}
              onClick={() => setActiveKeyword(activeKeyword === kw ? null : kw)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                activeKeyword === kw
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40"
              )}
            >
              {kw} <span className="opacity-60 ml-0.5">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 결과 수 */}
      <p className="text-xs text-muted-foreground mb-4">{filtered.length}개 공고</p>

      {/* 공고 리스트 */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">해당하는 공고가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((bid, idx) => {
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
    </div>
  );
}
