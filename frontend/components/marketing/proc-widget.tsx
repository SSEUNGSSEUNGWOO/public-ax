"use client";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/shared/link-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BidItem } from "@/lib/g2b";

interface ProcWidgetProps {
  totalTenders: number;
  totalBudget: number;
  topAgency: string;
  recentBids?: BidItem[];
}

function getDday(dateStr: string, timeStr?: string): number {
  if (!dateStr) return 999;
  const close = new Date(`${dateStr}T${timeStr ?? "23:59"}:00`);
  return Math.ceil((close.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatBudget(amt: string): string {
  const n = parseInt(amt ?? "0");
  if (!n) return "-";
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return `${n.toLocaleString()}원`;
}

function DdayBadge({ dday }: { dday: number }) {
  if (dday < 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">마감</span>;
  if (dday === 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">D-day</span>;
  if (dday <= 3) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">D-{dday}</span>;
  if (dday <= 7) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">D-{dday}</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">D-{dday}</span>;
}

export function ProcWidget({
  totalTenders,
  totalBudget,
  topAgency,
  recentBids = [],
}: ProcWidgetProps) {
  const urgentBids = recentBids.filter((b) => {
    const d = getDday(b.bidClseDate, b.bidClseTm);
    return d >= 0 && d <= 7;
  });
  const preview = recentBids
    .slice()
    .sort((a, b) => {
      const da = getDday(a.bidClseDate, a.bidClseTm);
      const db = getDday(b.bidClseDate, b.bidClseTm);
      if (da < 0 && db >= 0) return 1;
      if (da >= 0 && db < 0) return -1;
      return da - db;
    })
    .slice(0, 5);

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-2xl font-bold">K-AI PROC</h2>
              <Badge variant="secondary" className="text-xs rounded-full font-normal">
                Beta
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">이번 달 공공 AI 조달 현황</p>
          </div>
          <LinkButton href="/proc" variant="ghost" size="sm">
            전체 보기 &rarr;
          </LinkButton>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "이번달 AI 공고", value: <><NumberTicker value={totalTenders} /><span className="text-blue-500 ml-0.5 text-lg">건</span></>, color: "from-blue-50/60 dark:from-blue-950/20" },
            { label: "총 예산 규모", value: <><NumberTicker value={totalBudget} /><span className="text-emerald-500 ml-0.5 text-lg">억</span></>, color: "from-emerald-50/60 dark:from-emerald-950/20" },
            { label: "마감 임박", value: <><span className={urgentBids.length > 0 ? "text-red-500" : ""}>{urgentBids.length}</span><span className="text-muted-foreground ml-0.5 text-lg">건</span></>, color: urgentBids.length > 0 ? "from-red-50/60 dark:from-red-950/20" : "from-muted/30" },
            { label: "최다 발주기관", value: <span className="text-base font-bold truncate block">{topAgency}</span>, color: "from-amber-50/60 dark:from-amber-950/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border bg-gradient-to-br ${s.color} to-transparent p-5`}>
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-3xl font-bold tracking-tight leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* 마감 임박 공고 미리보기 */}
        {preview.length > 0 && (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">마감 임박순 공고</span>
            </div>
            <div className="divide-y">
              {preview.map((bid, idx) => {
                const dday = getDday(bid.bidClseDate, bid.bidClseTm);
                const budget = formatBudget(bid.asignBdgtAmt || bid.presmptPrce);
                return (
                  <a
                    key={`${bid.bidNtceNo}-${idx}`}
                    href={bid.bidNtceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-14">
                      <DdayBadge dday={dday} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-1">{bid.bidNtceNm}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{bid.ntceInsttNm}</p>
                    </div>
                    <div className="flex-shrink-0 text-sm font-bold text-right">{budget}</div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
