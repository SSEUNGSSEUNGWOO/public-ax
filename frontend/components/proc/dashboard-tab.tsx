"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface DashboardData {
  kpi: {
    active: number;
    thisMonthCount: number;
    lastMonthCount: number;
    urgent: number;
    activeBudget: number;
    thisMonthBudget: number;
    lastMonthBudget: number;
  };
  categoryDistribution: { category: string; count: number }[];
  monthlyTrend: Record<string, number | string>[];
  categoryChange: { category: string; thisMonth: number; lastMonth: number; diff: number; changePct: number }[];
  topAgencies: { name: string; count: number; totalBudget: number }[];
  budgetDistribution: { range: string; count: number; totalBudget: number }[];
  ddayDistribution: { range: string; count: number }[];
  categoryAvgBudget: { category: string; count: number; avgBudget: number }[];
  agencyTypeDistribution: { type: string; count: number }[];
}

const AGENCY_TYPE_COLORS: Record<string, string> = {
  "대학/연구기관": "#10b981",
  "중앙부처": "#8b5cf6",
  "지자체": "#f59e0b",
  "공공기관": "#3b82f6",
  "민간위탁": "#ec4899",
  "기타": "#94a3b8",
};

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
  "AI 정책/연구용역": "#f59e0b",
  "AI 교육/컨설팅": "#10b981",
  "디지털 전환": "#64748b",
  "기타 AI": "#94a3b8",
  "미분류": "#cbd5e1",
};

function formatBudget(n: number): string {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(1)}조`;
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(0)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString();
}

function changeLabel(pct: number): { text: string; color: string } {
  if (pct > 0) return { text: `↑ +${pct}%`, color: "text-emerald-600 dark:text-emerald-400" };
  if (pct < 0) return { text: `↓ ${pct}%`, color: "text-rose-600 dark:text-rose-400" };
  return { text: "±0%", color: "text-muted-foreground" };
}

function pctChange(cur: number, prev: number): number {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

export function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/proc/dashboard")
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
        <p className="text-xs text-muted-foreground mt-3">대시보드 로딩 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-center text-muted-foreground py-12 text-sm">데이터를 불러올 수 없습니다. {error}</p>;
  }

  const monthChange = pctChange(data.kpi.thisMonthCount, data.kpi.lastMonthCount);
  const budgetChange = pctChange(data.kpi.thisMonthBudget, data.kpi.lastMonthBudget);

  const sortedCategoryChange = [...data.categoryChange].sort((a, b) => b.changePct - a.changePct);

  return (
    <div className="space-y-8">
      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="참여 가능"
          value={`${data.kpi.active}건`}
          sub="마감 미경과"
        />
        <KpiCard
          label="이번달 신규"
          value={`${data.kpi.thisMonthCount}건`}
          sub={`전월 대비`}
          change={changeLabel(monthChange)}
        />
        <KpiCard
          label="마감 임박"
          value={`${data.kpi.urgent}건`}
          sub="D-7 이내"
          urgent={data.kpi.urgent > 0}
        />
        <KpiCard
          label="이번달 예산"
          value={`${formatBudget(data.kpi.thisMonthBudget)}`}
          sub="전월 대비"
          change={changeLabel(budgetChange)}
        />
      </div>

      {/* 카테고리 분포 + 월별 추이 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="카테고리 분포" subtitle="참여 가능 공고 기준">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={1}
                >
                  {data.categoryDistribution.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value, name) => [`${value}건`, String(name)]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 11, paddingLeft: 8 }}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="월별 등록 + 예산 추이" subtitle="6개월 (막대=건수, 선=예산 합)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="count" tick={{ fontSize: 10 }} />
                <YAxis
                  yAxisId="budget"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => `${(v / 100_000_000).toFixed(0)}억`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value, name) => {
                    if (name === "건수") return [`${value}건`, "건수"];
                    return [formatBudget(Number(value)), "예산"];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
                <Bar yAxisId="count" dataKey="total" name="건수" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Line
                  yAxisId="budget"
                  type="monotone"
                  dataKey="totalBudget"
                  name="예산"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#f59e0b" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* D-day 분포 + 카테고리별 평균 예산 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="마감 D-day 분포" subtitle="참여 가능 공고">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ddayDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value) => [`${value}건`, "공고"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.ddayDistribution.map((d, i) => (
                    <Cell
                      key={d.range}
                      fill={i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : i === 2 ? "#3b82f6" : "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="카테고리별 평균 예산" subtitle="참여 가능 공고">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryAvgBudget} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => `${(v / 100_000_000).toFixed(0)}억`}
                />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value, _name, p) => [
                    `${formatBudget(Number(value))} (${(p.payload as { count: number }).count}건)`,
                    "평균",
                  ]}
                />
                <Bar dataKey="avgBudget" radius={[0, 6, 6, 0]}>
                  {data.categoryAvgBudget.map((c) => (
                    <Cell key={c.category} fill={CATEGORY_COLORS[c.category] ?? "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 카테고리별 6개월 추이 (Multi-line) */}
      <Card title="카테고리별 6개월 추이" subtitle="상위 5개 카테고리 등록 건수">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
              {data.categoryDistribution.slice(0, 5).map((c) => (
                <Line
                  key={c.category}
                  type="monotone"
                  dataKey={c.category}
                  stroke={CATEGORY_COLORS[c.category] ?? "#94a3b8"}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 카테고리 변화율 + 예산 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="카테고리별 월간 변화율" subtitle={`이번달 vs 지난달`}>
          <div className="space-y-1.5 mt-2">
            {sortedCategoryChange.slice(0, 8).map((c) => {
              const lbl = changeLabel(c.changePct);
              return (
                <div key={c.category} className="flex items-center gap-3 text-xs">
                  <span className="w-32 truncate text-muted-foreground" title={c.category}>{c.category}</span>
                  <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden relative">
                    <div
                      className={cn("h-full rounded-full", c.changePct >= 0 ? "bg-emerald-500/60" : "bg-rose-500/60")}
                      style={{ width: `${Math.min(Math.abs(c.changePct), 100)}%` }}
                    />
                  </div>
                  <span className={cn("w-16 text-right font-medium", lbl.color)}>{lbl.text}</span>
                  <span className="w-12 text-right text-muted-foreground/60">{c.thisMonth}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="예산대 분포" subtitle="참여 가능 공고">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.budgetDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value, _name, p) => [
                    `${value}건 (예산 ${formatBudget((p.payload as { totalBudget: number }).totalBudget)})`,
                    "건수",
                  ]}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top 10 발주기관 + 기관 유형 도넛 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title="Top 10 발주기관" subtitle="참여 가능 공고 (조달청·지방조달청 제외)">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topAgencies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                    formatter={(value, _name, p) => [
                      `${value}건 (예산 ${formatBudget((p.payload as { totalBudget: number }).totalBudget)})`,
                      "건수",
                    ]}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card title="기관 유형별 분포" subtitle="참여 가능 공고">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.agencyTypeDistribution}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={1}
                >
                  {data.agencyTypeDistribution.map((entry) => (
                    <Cell key={entry.type} fill={AGENCY_TYPE_COLORS[entry.type] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value, name) => [`${value}건`, String(name)]}
                />
                <Legend
                  layout="vertical"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 11 }}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  change,
  urgent,
}: {
  label: string;
  value: string;
  sub: string;
  change?: { text: string; color: string };
  urgent?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5", urgent && "border-red-400/40")}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl font-bold leading-tight mb-0.5 truncate", urgent && "text-red-500 dark:text-red-400")}>
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] text-muted-foreground/60">{sub}</p>
        {change && <span className={cn("text-[11px] font-medium", change.color)}>{change.text}</span>}
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
