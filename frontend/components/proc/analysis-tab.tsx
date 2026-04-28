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

      <p className="text-xs text-muted-foreground/60 text-center pt-4">
        💡 6개월 재수집 완료 후 참여 가능 업종·계약방법·지역 제한 분석이 추가됩니다.
      </p>
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
