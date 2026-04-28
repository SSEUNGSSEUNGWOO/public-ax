"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Insight {
  headline: string;
  summary: string;
  categoryTotals: Record<string, number>;
  seriesTotal: Record<string, number>;
}

interface AnalysisData {
  total: number;
  categories: string[];
  agencyTypes: string[];
  bizDivs: string[];
  budgetRanges: string[];
  agencyMatrix: Record<string, Record<string, number>>;
  bizMatrix: Record<string, Record<string, number>>;
  budgetMatrix: Record<string, Record<string, number>>;
  agencyInsights: Insight;
  bizInsights: Insight;
  budgetInsights: Insight;
  industryTop15: { name: string; count: number }[];
  contractMethods: { name: string; count: number }[];
  decisionMethods: { name: string; count: number }[];
  regionLimit: { restricted: number; free: number; regions: { name: string; count: number }[] };
}

const AGENCY_TYPE_COLORS: Record<string, string> = {
  "대학/연구기관": "#10b981",
  "중앙부처": "#8b5cf6",
  "지자체": "#f59e0b",
  "공공기관": "#3b82f6",
  "민간위탁": "#ec4899",
  "기타": "#94a3b8",
};

const BIZ_COLORS: Record<string, string> = {
  "용역": "#3b82f6",
  "물품": "#10b981",
  "공사": "#f59e0b",
};

const BUDGET_COLORS: Record<string, string> = {
  "1억 미만": "#cbd5e1",
  "1~10억": "#94a3b8",
  "10~100억": "#6366f1",
  "100억+": "#8b5cf6",
};

export function AnalysisTab() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/proc/analysis")
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground mt-3">분석 데이터 로딩 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-center text-muted-foreground py-12 text-sm">데이터를 불러올 수 없습니다. {error}</p>;
  }

  return (
    <div className="space-y-12">
      <InsightSection eyebrow="기관 분석" insight={data.agencyInsights}>
        <CategoryStackedBars
          categories={data.categories}
          series={data.agencyTypes}
          matrix={data.agencyMatrix}
          colors={AGENCY_TYPE_COLORS}
          totals={data.agencyInsights.categoryTotals}
        />
      </InsightSection>

      <InsightSection eyebrow="사업 형태" insight={data.bizInsights}>
        <CategoryStackedBars
          categories={data.categories}
          series={data.bizDivs}
          matrix={data.bizMatrix}
          colors={BIZ_COLORS}
          totals={data.bizInsights.categoryTotals}
        />
      </InsightSection>

      <InsightSection eyebrow="예산 규모" insight={data.budgetInsights}>
        <CategoryStackedBars
          categories={data.categories}
          series={data.budgetRanges}
          matrix={data.budgetMatrix}
          colors={BUDGET_COLORS}
          totals={data.budgetInsights.categoryTotals}
        />
      </InsightSection>

      <IndustryCard items={data.industryTop15} />

      <ContractCard contracts={data.contractMethods} decisions={data.decisionMethods} />

      <RegionCard data={data.regionLimit} />
    </div>
  );
}

function IndustryCard({ items }: { items: { name: string; count: number }[] }) {
  if (items.length === 0) return null;
  const max = items[0]?.count ?? 1;
  const top = items[0];
  return (
    <section>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">참여 자격</p>
        <h3 className="text-xl font-bold leading-tight mb-2">
          {top ? `"${top.name}" 업종 사업이 가장 많음` : "참여 가능 업종 분포"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          공고에 명시된 참여 가능 업종 Top 15. 회사 업종과 매칭되는 사업 비중을 확인하세요.
        </p>
      </div>
      <div className="rounded-2xl border bg-card p-5">
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.name} className="grid grid-cols-[1fr_50px] items-center gap-3 text-xs">
              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <span className="text-foreground truncate" title={it.name}>{it.name}</span>
                <div className="h-5 bg-muted/30 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-md transition-all"
                    style={{ width: `${(it.count / max) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-muted-foreground text-right">{it.count}건</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContractCard({
  contracts,
  decisions,
}: {
  contracts: { name: string; count: number }[];
  decisions: { name: string; count: number }[];
}) {
  if (contracts.length === 0 && decisions.length === 0) return null;
  const cTotal = contracts.reduce((s, c) => s + c.count, 0);
  const dTotal = decisions.reduce((s, c) => s + c.count, 0);
  const topContract = contracts[0];
  const topDecision = decisions[0];

  const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <section>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">계약·입찰 방식</p>
        <h3 className="text-xl font-bold leading-tight mb-2">
          {topContract && topDecision
            ? `${topContract.name}·${topDecision.name} 위주`
            : "계약 형태 분포"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {topContract && cTotal > 0
            ? `사업의 ${pct(topContract.count, cTotal)}%가 ${topContract.name}, `
            : ""}
          {topDecision && dTotal > 0
            ? `${pct(topDecision.count, dTotal)}%가 ${topDecision.name}으로 진행됩니다.`
            : ""}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">계약방법</p>
          <BarList items={contracts} total={cTotal} />
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">낙찰자 결정방법</p>
          <BarList items={decisions} total={dTotal} />
        </div>
      </div>
    </section>
  );
}

function RegionCard({
  data,
}: {
  data: { restricted: number; free: number; regions: { name: string; count: number }[] };
}) {
  const total = data.restricted + data.free;
  if (total === 0) return null;
  const restrictedPct = Math.round((data.restricted / total) * 100);

  return (
    <section>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">지역 제한</p>
        <h3 className="text-xl font-bold leading-tight mb-2">
          {restrictedPct}% 사업이 지역 제한 있음
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          지역 제한이 걸린 사업은 해당 지역 소재 기업만 참여 가능합니다.
          {data.regions.length > 0 && ` 가장 많은 지역은 ${data.regions[0].name}.`}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">전체 비율</p>
          <div className="flex h-8 rounded-md overflow-hidden mb-3">
            <div
              className="h-full bg-amber-500/60 flex items-center justify-center text-[11px] font-medium text-white"
              style={{ width: `${restrictedPct}%` }}
            >
              {restrictedPct >= 8 ? `제한 ${restrictedPct}%` : ""}
            </div>
            <div
              className="h-full bg-emerald-500/40 flex items-center justify-center text-[11px] font-medium text-white"
              style={{ width: `${100 - restrictedPct}%` }}
            >
              {100 - restrictedPct >= 8 ? `제한 없음 ${100 - restrictedPct}%` : ""}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>제한 {data.restricted}건</span>
            <span>제한 없음 {data.free}건</span>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">제한 지역 Top 10</p>
          {data.regions.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 py-4">데이터 없음</p>
          ) : (
            <BarList items={data.regions} total={data.restricted} />
          )}
        </div>
      </div>
    </section>
  );
}

function BarList({ items, total }: { items: { name: string; count: number }[]; total: number }) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="space-y-1.5">
      {items.map((it) => {
        const pct = total > 0 ? Math.round((it.count / total) * 100) : 0;
        return (
          <div key={it.name} className="grid grid-cols-[140px_1fr_50px] items-center gap-2 text-xs">
            <span className="text-foreground truncate" title={it.name}>{it.name}</span>
            <div className="h-4 bg-muted/30 rounded-md overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-md"
                style={{ width: `${(it.count / max) * 100}%` }}
              />
            </div>
            <span className="text-muted-foreground text-right">
              {it.count} <span className="text-muted-foreground/60">({pct}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InsightSection({
  eyebrow,
  insight,
  children,
}: {
  eyebrow: string;
  insight: Insight;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">{eyebrow}</p>
        <h3 className="text-xl font-bold leading-tight mb-2">{insight.headline}</h3>
        {insight.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.summary}</p>
        )}
      </div>
      <div className="rounded-2xl border bg-card p-5">{children}</div>
    </section>
  );
}

function CategoryStackedBars({
  categories,
  series,
  matrix,
  colors,
  totals,
}: {
  categories: string[];
  series: string[];
  matrix: Record<string, Record<string, number>>;
  colors: Record<string, string>;
  totals: Record<string, number>;
}) {
  // 합계 큰 순 정렬, Top 5만 노출
  const visibleCategories = categories
    .filter((c) => (totals[c] ?? 0) > 0)
    .sort((a, b) => (totals[b] ?? 0) - (totals[a] ?? 0))
    .slice(0, 5);

  return (
    <div>
      {/* 카테고리별 100% stacked bar */}
      <div className="space-y-3">
        {visibleCategories.map((c) => {
          const total = totals[c];
          return (
            <div key={c} className="grid grid-cols-[120px_1fr_44px] items-center gap-3">
              <span className="text-xs font-medium text-foreground truncate" title={c}>
                {c}
              </span>
              <div className="flex h-6 rounded-md overflow-hidden bg-muted/30">
                {series.map((s) => {
                  const v = matrix[c]?.[s] ?? 0;
                  if (v === 0) return null;
                  const pct = (v / total) * 100;
                  return (
                    <div
                      key={s}
                      className={cn(
                        "h-full flex items-center justify-center text-[10px] font-medium text-white/95 transition-all hover:brightness-110",
                        pct < 10 && "text-white/0"
                      )}
                      style={{ width: `${pct}%`, backgroundColor: colors[s] ?? "#94a3b8" }}
                      title={`${s}: ${v}건 (${pct.toFixed(1)}%)`}
                    >
                      {pct >= 10 && `${Math.round(pct)}%`}
                    </div>
                  );
                })}
              </div>
              <span className="text-[11px] text-muted-foreground text-right">{total}</span>
            </div>
          );
        })}
      </div>

      {/* 범례 (작게, 차트 아래) */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-5 pt-4 border-t">
        {series.map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[s] ?? "#94a3b8" }} />
            <span className="text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
