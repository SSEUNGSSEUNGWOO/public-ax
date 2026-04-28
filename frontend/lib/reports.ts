import { createClient } from "@supabase/supabase-js";

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

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getLatestReport(): Promise<ProcReport | null> {
  const { data, error } = await getClient()
    .from("proc_reports")
    .select("*")
    .eq("status", "published")
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("proc_reports fetch error:", error.message);
    return null;
  }
  return data;
}

export async function getAllReports(): Promise<ProcReport[]> {
  const { data, error } = await getClient()
    .from("proc_reports")
    .select("*")
    .eq("status", "published")
    .order("period_end", { ascending: false });

  if (error) {
    console.error("proc_reports list error:", error.message);
    return [];
  }
  return data ?? [];
}
