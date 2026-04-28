import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const AI_KEYWORDS = ["AI", "인공지능", "빅데이터", "머신러닝", "딥러닝", "자연어처리", "LLM", "챗봇", "지능형", "디지털전환", "클라우드"] as const;
export type AiKeyword = typeof AI_KEYWORDS[number];

export const AI_CATEGORIES = [
  "LLM/생성형 AI",
  "RAG/지식 검색",
  "컴퓨터 비전",
  "음성/STT",
  "빅데이터 분석",
  "AI 인프라/MLOps",
  "AI 자율주행/로봇",
  "AI 의료/헬스케어",
  "AI 보안",
  "AI 정책/연구용역",
  "AI 교육/컨설팅",
  "디지털 전환",
  "기타 AI",
] as const;
export type AiCategory = typeof AI_CATEGORIES[number];

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
  aiCategory: string | null;
}

export interface MonthStat {
  label: string;
  count: number;
  totalBudget: number;
}

function rowToBidItem(row: Record<string, string | null>): BidItem {
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
    aiCategory: row.ai_category ?? null,
  };
}

// 조달청 제3자단가·각수요기관 같은 표준 단가계약은 잠재 사용한도라 통계 왜곡 → 제외
function isUnitContract(row: Record<string, string | null>): boolean {
  const name = row.bid_ntce_nm || "";
  const dmnd = row.dmnd_instt_nm || "";
  if (name.includes("_제3자단가") || name.includes("단가계약") || name.includes("단가입찰")) return true;
  if (dmnd === "각 수요기관") return true;
  return false;
}

// 같은 사업(공고명+발주기관+마감일)이면 가장 최신 공고번호·차수만 남김
function dedupeBids(items: BidItem[]): BidItem[] {
  const key = (b: BidItem) => `${b.bidNtceNm}|${b.ntceInsttNm}|${b.bidClseDate}`;
  const isNewer = (a: BidItem, b: BidItem) =>
    a.bidNtceNo !== b.bidNtceNo ? a.bidNtceNo > b.bidNtceNo : a.bidNtceOrd > b.bidNtceOrd;

  const seen = new Map<string, BidItem>();
  for (const b of items) {
    const k = key(b);
    const existing = seen.get(k);
    seen.set(k, !existing || isNewer(b, existing) ? b : existing);
  }
  return Array.from(seen.values()).sort((a, b) => a.bidClseDate.localeCompare(b.bidClseDate));
}

// 참여 가능한 공고 (마감 미경과 + 사업 단위 dedupe + 단가계약·무관 제외)
export async function fetchAIBids(): Promise<BidItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await getClient()
    .from("bids")
    .select("*")
    .gte("bid_clse_date", today)
    .order("bid_clse_date", { ascending: true })
    .limit(1000);

  if (error || !data) return [];
  const filtered = data.filter((r) => !isUnitContract(r) && r.ai_category !== "무관");
  return dedupeBids(filtered.map(rowToBidItem));
}

// 이번달 신규 등록 건수 (bid_ntce_date 기준)
export async function fetchThisMonthCount(): Promise<number> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const from = `${year}-${month}-01`;
  const next = new Date(year, now.getMonth() + 1, 1);
  const to = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;

  const { count } = await getClient()
    .from("bids")
    .select("id", { count: "exact", head: true })
    .gte("bid_ntce_date", from)
    .lt("bid_ntce_date", to);

  return count ?? 0;
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
    const from = `${year}-${month}-01`;
    const next = new Date(year, d.getMonth() + 1, 1);
    const to = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;

    const { data } = await getClient()
      .from("bids")
      .select("assign_bdgt_amt, presmpt_prce")
      .gte("bid_ntce_date", from)
      .lt("bid_ntce_date", to);

    const count = data?.length ?? 0;
    const totalBudget = (data ?? []).reduce(
      (sum, b) => sum + parseInt((b.assign_bdgt_amt || b.presmpt_prce) ?? "0"),
      0
    );
    results.push({ label, count, totalBudget });
  }

  return results;
}
