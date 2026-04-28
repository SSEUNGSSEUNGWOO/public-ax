import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SIX_MONTH_DAYS = 180;

interface BidRow {
  ai_category: string | null;
  ntce_instt_nm: string | null;
  dmnd_instt_nm: string | null;
  bid_ntce_nm: string | null;
  bsns_div_nm: string | null;
  bid_ntce_date: string | null;
  bid_clse_date: string | null;
  assign_bdgt_amt: string | null;
  presmpt_prce: string | null;
}

function isUnitContract(r: BidRow): boolean {
  const name = r.bid_ntce_nm || "";
  const dmnd = r.dmnd_instt_nm || "";
  if (name.includes("_제3자단가") || name.includes("단가계약") || name.includes("단가입찰")) return true;
  if (dmnd === "각 수요기관") return true;
  return false;
}

const CATEGORIES = [
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
];

const AGENCY_TYPES = ["대학/연구기관", "중앙부처", "지자체", "공공기관", "민간위탁", "기타"];

const BIZ_DIVS = ["용역", "물품", "공사"];

const BUDGET_RANGES = [
  { label: "1억 미만", min: 0, max: 100_000_000 },
  { label: "1~10억", min: 100_000_000, max: 1_000_000_000 },
  { label: "10~100억", min: 1_000_000_000, max: 10_000_000_000 },
  { label: "100억+", min: 10_000_000_000, max: Number.POSITIVE_INFINITY },
];

function getBudget(row: BidRow): number {
  return parseInt(row.assign_bdgt_amt || row.presmpt_prce || "0") || 0;
}

function classifyAgency(rawName: string | null): string {
  if (!rawName) return "기타";
  const n = rawName.trim();
  if (["특별시", "광역시", "특별자치", "도청", "시청", "구청", "군청", "교육청"].some((s) => n.includes(s))) return "지자체";
  const parts = n.split(/\s+/);
  if (parts.length >= 2 && /[도시]$/.test(parts[0]) && /[시군구동읍면청]$/.test(parts[1])) return "지자체";
  if (/[도시군구]$/.test(n) && n.length <= 5) return "지자체";
  if (["대학교", "대학원", "과학기술원", "대학", "교대", "교육원", "연구원", "연구소", "과학원", "기술원"].some((s) => n.includes(s)))
    return "대학/연구기관";
  if (["KAIST", "KIST", "GIST", "POSTECH", "UNIST", "DGIST", "ETRI"].some((s) => n.toUpperCase().includes(s)))
    return "대학/연구기관";
  if (["부", "처", "청", "위원회", "본부", "국", "실"].some((s) => n.endsWith(s))) return "중앙부처";
  if (["공사", "공단", "공항", "재단", "진흥원", "관리원", "지사", "관리공단"].some((s) => n.endsWith(s))) return "공공기관";
  if (["공사 ", "공단 ", "진흥원 ", "재단 ", "관리원 "].some((s) => n.includes(s))) return "공공기관";
  if (["센터", "기금", "병원", "보건소", "문화원", "복지관", "도서관", "박물관"].some((s) => n.includes(s))) return "공공기관";
  if (["재단법인", "사단법인", "주식회사", "협동조합", "농협", "수협", "협회", "중앙회", "노동조합", "상공회의소"].some((s) => n.includes(s)))
    return "민간위탁";
  return "기타";
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const sixMoAgo = new Date(Date.now() - SIX_MONTH_DAYS * 86400000).toISOString().slice(0, 10);

    const rawRows: BidRow[] = [];
    const PAGE = 1000;
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from("bids")
        .select("ai_category, ntce_instt_nm, dmnd_instt_nm, bid_ntce_nm, bsns_div_nm, bid_ntce_date, bid_clse_date, assign_bdgt_amt, presmpt_prce")
        .gte("bid_ntce_date", sixMoAgo)
        .range(offset, offset + PAGE - 1);
      if (error) throw error;
      const page = data ?? [];
      rawRows.push(...(page as BidRow[]));
      if (page.length < PAGE) break;
      offset += PAGE;
    }
    const rows = rawRows.filter((r) => !isUnitContract(r));

    // 카테고리 × 기관유형 매트릭스
    const agencyMatrix: Record<string, Record<string, number>> = {};
    for (const c of CATEGORIES) {
      agencyMatrix[c] = Object.fromEntries(AGENCY_TYPES.map((t) => [t, 0]));
    }
    for (const r of rows) {
      const c = r.ai_category && r.ai_category !== "무관" ? r.ai_category : null;
      if (!c || !agencyMatrix[c]) continue;
      const t = classifyAgency(r.dmnd_instt_nm || r.ntce_instt_nm);
      agencyMatrix[c][t] = (agencyMatrix[c][t] ?? 0) + 1;
    }

    // 카테고리 × 사업구분 매트릭스
    const bizMatrix: Record<string, Record<string, number>> = {};
    for (const c of CATEGORIES) {
      bizMatrix[c] = Object.fromEntries(BIZ_DIVS.map((d) => [d, 0]));
    }
    for (const r of rows) {
      const c = r.ai_category && r.ai_category !== "무관" ? r.ai_category : null;
      if (!c || !bizMatrix[c]) continue;
      const d = r.bsns_div_nm || "용역";
      if (BIZ_DIVS.includes(d)) {
        bizMatrix[c][d] = (bizMatrix[c][d] ?? 0) + 1;
      }
    }

    // 카테고리 × 예산대 매트릭스
    const budgetMatrix: Record<string, Record<string, number>> = {};
    for (const c of CATEGORIES) {
      budgetMatrix[c] = Object.fromEntries(BUDGET_RANGES.map((b) => [b.label, 0]));
    }
    for (const r of rows) {
      const c = r.ai_category && r.ai_category !== "무관" ? r.ai_category : null;
      if (!c || !budgetMatrix[c]) continue;
      const n = getBudget(r);
      if (n === 0) continue;
      const range = BUDGET_RANGES.find((b) => n >= b.min && n < b.max);
      if (range) budgetMatrix[c][range.label] = (budgetMatrix[c][range.label] ?? 0) + 1;
    }

    const totalRows = rows.filter((r) => r.ai_category && r.ai_category !== "무관").length;

    // 컬럼별(카테고리별) 합계 + 한 줄 헤드라인 + prose 요약
    function buildInsights(
      matrix: Record<string, Record<string, number>>,
      categoryAxis: string[],
      seriesAxis: string[]
    ): { headline: string; summary: string; categoryTotals: Record<string, number>; seriesTotal: Record<string, number> } {
      const seriesTotal: Record<string, number> = Object.fromEntries(seriesAxis.map((s) => [s, 0]));
      const categoryTotals: Record<string, number> = Object.fromEntries(categoryAxis.map((c) => [c, 0]));
      let grand = 0;
      for (const c of categoryAxis) {
        for (const s of seriesAxis) {
          const v = matrix[c]?.[s] ?? 0;
          seriesTotal[s] += v;
          categoryTotals[c] += v;
          grand += v;
        }
      }

      const sortedSeries = Object.entries(seriesTotal).sort((a, b) => b[1] - a[1]);
      const topSeries = sortedSeries[0];
      const secondSeries = sortedSeries[1];

      const headline =
        topSeries && grand > 0
          ? `${topSeries[0]}이 AI 발주의 ${Math.round((topSeries[1] / grand) * 100)}% 차지`
          : "발주 분포";

      // dominant 패턴 1개 (한 분야가 한 series에 강하게 쏠린 케이스)
      const dominants = categoryAxis
        .map((c) => {
          const total = categoryTotals[c];
          if (total === 0) return null;
          const top = seriesAxis
            .map((s) => ({ series: s, count: matrix[c]?.[s] ?? 0 }))
            .sort((a, b) => b.count - a.count)[0];
          return { category: c, top, pct: Math.round((top.count / total) * 100), total };
        })
        .filter((x): x is { category: string; top: { series: string; count: number }; pct: number; total: number } => Boolean(x));

      const standout = dominants
        .filter((d) => d.total >= 15 && d.pct >= 50)
        .sort((a, b) => b.pct - a.pct)[0];

      // 1~2문장 prose
      const parts: string[] = [];
      if (standout) {
        parts.push(`${standout.category} 분야는 ${standout.top.series} 비중이 ${standout.pct}%로 가장 쏠려 있습니다.`);
      }
      if (secondSeries && grand > 0) {
        const secPct = Math.round((secondSeries[1] / grand) * 100);
        parts.push(`전체로는 ${secondSeries[0]}이 그 뒤를 잇습니다 (${secPct}%).`);
      }
      const summary = parts.join(" ");

      return { headline, summary, categoryTotals, seriesTotal };
    }

    const agencyInsights = buildInsights(agencyMatrix, CATEGORIES, AGENCY_TYPES);
    const bizInsights = buildInsights(bizMatrix, CATEGORIES, BIZ_DIVS);
    const budgetInsights = buildInsights(budgetMatrix, CATEGORIES, BUDGET_RANGES.map((b) => b.label));

    return NextResponse.json({
      total: totalRows,
      categories: CATEGORIES,
      agencyTypes: AGENCY_TYPES,
      bizDivs: BIZ_DIVS,
      budgetRanges: BUDGET_RANGES.map((b) => b.label),
      agencyMatrix,
      bizMatrix,
      budgetMatrix,
      agencyInsights,
      bizInsights,
      budgetInsights,
    });
  } catch (e) {
    console.error("[proc/analysis]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
