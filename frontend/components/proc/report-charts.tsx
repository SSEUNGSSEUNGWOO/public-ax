"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { ReportData, CategoryChange, AgencyChange, LargeBid } from "@/lib/reports";

const CATEGORY_COLORS: Record<string, string> = {
  "LLM/생성형 AI": "#8b5cf6",
  "RAG/지식 검색": "#3b82f6",
  "컴퓨터 비전": "#f43f5e",
  "음성/STT": "#ec4899",
  "빅데이터 분석": "#06b6d4",
  "AI 인프라/MLOps": "#6366f1",
  "AI 자율주행/로봇": "#f97316",
  "AI 의료/헬스케어": "#ef4444",
  "AI 보안": "#14b8a6",
  "AI 정책/연구용역": "#a855f7",
  "AI 교육/컨설팅": "#22c55e",
  "디지털 전환": "#64748b",
  "기타 AI": "#94a3b8",
};

function formatBudget(amt: number): string {
  if (amt >= 100_000_000) return `${(amt / 100_000_000).toFixed(1)}억`;
  if (amt >= 10_000) return `${Math.round(amt / 10_000).toLocaleString()}만`;
  return amt.toLocaleString();
}

function CategoryBarChart({ items, label }: { items: CategoryChange[]; label: string }) {
  const data = items.slice(0, 8).map((c) => ({
    category: c.category,
    "최근 30일": c.recent,
    "직전 90일 월평균": c.baseline_monthly_avg,
    change_pct: c.change_pct,
  }));
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{label}</p>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={130} interval={0} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="최근 30일" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          <Bar dataKey="직전 90일 월평균" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AgencyBarChart({ items, label }: { items: AgencyChange[]; label: string }) {
  const data = items.slice(0, 12).map((a) => ({
    name: a.name.length > 22 ? a.name.slice(0, 22) + "…" : a.name,
    fullName: a.name,
    "최근 30일": a.recent,
    "직전 90일 월평균": a.baseline_monthly_avg,
  }));
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{label}</p>
      <ResponsiveContainer width="100%" height={Math.max(280, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={170} interval={0} />
          <Tooltip
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
            }
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="최근 30일" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          <Bar dataKey="직전 90일 월평균" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MonthlyTrendChart({ items, label }: { items: { month: string; count: number }[]; label: string }) {
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{label}</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={items} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function BizDistributionChart({
  recent,
  label,
}: {
  recent: Record<string, number>;
  label: string;
}) {
  const data = Object.entries(recent)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const colors = ["#8b5cf6", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899"];
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{label}</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label={(e) => `${e.name} ${e.value}`}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function LargeBidsList({ items, label }: { items: LargeBid[]; label: string }) {
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-4">
      <p className="mb-3 text-sm font-medium text-foreground">{label}</p>
      <ul className="divide-y divide-border">
        {items.slice(0, 10).map((b, i) => (
          <li key={i} className="py-2.5 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground truncate">{b.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] mr-1.5" style={{ background: (CATEGORY_COLORS[b.category] ?? "#94a3b8") + "22", color: CATEGORY_COLORS[b.category] ?? "#94a3b8" }}>
                  {b.category}
                </span>
                {b.agency}
              </p>
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {formatBudget(b.budget)}원
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CHART_LABELS: Record<string, string> = {
  hot_categories: "🔥 Hot 카테고리 (최근 30일 vs 직전 90일 월평균)",
  cold_categories: "❄️ Cold 카테고리",
  new_categories: "🆕 신규 등장 카테고리",
  disappeared_categories: "🪦 사라진 카테고리",
  top_agencies: "🎯 주요 발주처 (수요기관 기준)",
  large_bids: "💰 큰 사업 Top 10",
  monthly_trend: "📈 월별 발주 추이 (최근 6개월)",
  biz_distribution: "📊 사업구분 분포 (최근 30일)",
  budget_by_category: "💵 카테고리별 예산 합계",
};

export function ReportChart({ type, dataKey, data }: { type: string; dataKey: string; data: ReportData }) {
  const label = CHART_LABELS[dataKey] ?? dataKey;

  if (dataKey === "monthly_trend") {
    return <MonthlyTrendChart items={data.monthly_trend} label={label} />;
  }
  if (dataKey === "biz_distribution") {
    return <BizDistributionChart recent={data.biz_distribution.recent} label={label} />;
  }
  if (dataKey === "large_bids" || type === "bigbids") {
    return <LargeBidsList items={data.large_bids} label={label} />;
  }
  if (dataKey === "top_agencies" || type === "hbar") {
    return <AgencyBarChart items={data.top_agencies} label={label} />;
  }

  const categoryItems: Record<string, CategoryChange[] | undefined> = {
    hot_categories: data.hot_categories,
    cold_categories: data.cold_categories,
    new_categories: data.new_categories,
    disappeared_categories: data.disappeared_categories,
  };

  if (dataKey === "budget_by_category") {
    const items = data.budget_by_category.slice(0, 8).map((b) => ({
      category: b.category,
      total: Math.round(b.total / 100_000_000),
    }));
    return (
      <div className="my-6 rounded-lg border border-border bg-card/30 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">{label} (단위: 억원)</p>
        <ResponsiveContainer width="100%" height={Math.max(220, items.length * 36)}>
          <BarChart data={items} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={130} interval={0} />
            <Tooltip formatter={(v) => `${Number(v).toLocaleString()}억`} />
            <Bar dataKey="total" fill="#06b6d4" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const items = categoryItems[dataKey];
  if (items && items.length) {
    return <CategoryBarChart items={items} label={label} />;
  }

  return (
    <div className="my-4 rounded border border-dashed border-border p-3 text-xs text-muted-foreground">
      차트 데이터 없음: {type}/{dataKey}
    </div>
  );
}
