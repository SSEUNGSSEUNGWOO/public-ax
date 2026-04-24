import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const AI_KEYWORDS = ["AI", "인공지능", "빅데이터", "머신러닝", "딥러닝", "자연어처리", "LLM", "챗봇", "지능형", "디지털전환", "클라우드"] as const;
export type AiKeyword = typeof AI_KEYWORDS[number];

export interface BidItem {
  bidNtceNo: string;
  bidNtceOrd: string;
  bidNtceNm: string;
  bidNtceSttusNm: string;
  bidNtceDate: string;
  bidNtceBgn: string;
  bsnsDivNm: string;
  ntceInsttNm: string;
  asignBdgtAmt: string;
  presmptPrce: string;
  bidClseDate: string;
  bidClseTm: string;
  bidNtceUrl: string;
}

export interface MonthStat {
  label: string;
  count: number;
  totalBudget: number;
}

function rowToBidItem(row: Record<string, string>): BidItem {
  return {
    bidNtceNo: row.bid_ntce_no ?? "",
    bidNtceOrd: row.bid_ntce_ord ?? "",
    bidNtceNm: row.bid_ntce_nm ?? "",
    bidNtceSttusNm: row.bid_ntce_sttus ?? "",
    bidNtceDate: row.bid_ntce_date ?? "",
    bidNtceBgn: "",
    bsnsDivNm: row.bsns_div_nm ?? "",
    ntceInsttNm: row.ntce_instt_nm ?? "",
    asignBdgtAmt: row.assign_bdgt_amt ?? "",
    presmptPrce: row.presmpt_prce ?? "",
    bidClseDate: row.bid_clse_date ?? "",
    bidClseTm: row.bid_clse_tm ?? "",
    bidNtceUrl: row.bid_ntce_url ?? "",
  };
}

// 전체 공고 (Supabase)
export async function fetchAIBids(): Promise<BidItem[]> {
  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .order("bid_ntce_date", { ascending: false })
    .limit(2000);

  if (error || !data) return [];
  return data.map(rowToBidItem);
}

// 월별 통계 (Supabase 집계)
export async function fetchMonthlyStats(months = 6): Promise<MonthStat[]> {
  const results: MonthStat[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const label = `${year}-${month}`;
    const from = `${year}${month}01`;
    const to = `${year}${month}31`;

    const { data } = await supabase
      .from("bids")
      .select("assign_bdgt_amt, presmpt_prce")
      .gte("bid_ntce_date", from)
      .lte("bid_ntce_date", to);

    const count = data?.length ?? 0;
    const totalBudget = (data ?? []).reduce(
      (sum, b) => sum + parseInt((b.assign_bdgt_amt || b.presmpt_prce) ?? "0"),
      0
    );
    results.push({ label, count, totalBudget });
  }

  return results;
}
