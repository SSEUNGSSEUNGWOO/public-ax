import { db } from "@/lib/db";
import { procReports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface ProcReport {
  id: string;
  slug: string;
  title: string;
  body: string;
  data: ReportData;
  period_start: string;
  period_end: string;
  baseline_start: string;
  baseline_end: string;
  evaluation_score: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  period: { start: string; end: string; baseline_start: string; baseline_end: string };
  summary: { recent_total: number; baseline_total: number; baseline_monthly_avg: number };
  hot_categories: CategoryChange[];
  cold_categories: CategoryChange[];
  new_categories: CategoryChange[];
  disappeared_categories: CategoryChange[];
  category_changes_all: CategoryChange[];
  top_agencies: AgencyChange[];
  budget_by_category: BudgetByCategory[];
  large_bids: LargeBid[];
  biz_distribution: { recent: Record<string, number>; baseline_monthly: Record<string, number> };
  monthly_trend: { month: string; count: number }[];
}

export interface CategoryChange {
  category: string;
  recent: number;
  baseline_monthly_avg: number;
  change_pct: number | null;
}

export interface AgencyChange {
  name: string;
  recent: number;
  baseline_monthly_avg: number;
  change_pct: number | null;
}

export interface BudgetByCategory {
  category: string;
  count: number;
  avg: number;
  median: number;
  max: number;
  total: number;
}

export interface LargeBid {
  title: string;
  category: string;
  agency: string;
  budget: number;
  biz_div: string | null;
  ntce_date: string;
}

function rowToReport(row: typeof procReports.$inferSelect): ProcReport {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: row.body,
    data: row.data as ReportData,
    period_start: row.periodStart ?? "",
    period_end: row.periodEnd ?? "",
    baseline_start: row.baselineStart ?? "",
    baseline_end: row.baselineEnd ?? "",
    evaluation_score: row.evaluationScore ? parseFloat(row.evaluationScore) : null,
    status: row.status ?? "draft",
    created_at: row.createdAt?.toISOString() ?? "",
    updated_at: row.updatedAt?.toISOString() ?? "",
  };
}

export async function getLatestReport(): Promise<ProcReport | null> {
  try {
    const rows = await db
      .select()
      .from(procReports)
      .where(eq(procReports.status, "published"))
      .orderBy(desc(procReports.periodEnd))
      .limit(1);

    if (rows.length === 0) return null;
    return rowToReport(rows[0]);
  } catch (error) {
    console.error("proc_reports fetch error:", error);
    return null;
  }
}

export async function getAllReports(): Promise<ProcReport[]> {
  try {
    const rows = await db
      .select()
      .from(procReports)
      .where(eq(procReports.status, "published"))
      .orderBy(desc(procReports.periodEnd));

    return rows.map(rowToReport);
  } catch (error) {
    console.error("proc_reports list error:", error);
    return [];
  }
}
