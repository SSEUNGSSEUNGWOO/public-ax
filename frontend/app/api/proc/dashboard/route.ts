import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SIX_MONTH_DAYS = 180;

interface BidRow {
  ai_category: string | null;
  ntce_instt_nm: string | null;
  dmnd_instt_nm: string | null;
  bid_ntce_nm: string | null;
  bid_ntce_date: string | null;
  bid_clse_date: string | null;
  assign_bdgt_amt: string | null;
  presmpt_prce: string | null;
}

// 조달청 제3자단가·각수요기관 같은 표준 단가계약은 잠재 사용한도라 통계 왜곡 → 제외
function isUnitContract(r: BidRow): boolean {
  const name = r.bid_ntce_nm || "";
  const dmnd = r.dmnd_instt_nm || "";
  if (name.includes("_제3자단가") || name.includes("단가계약") || name.includes("단가입찰")) return true;
  if (dmnd === "각 수요기관") return true;
  return false;
}

const KNOWN_CATEGORIES = [
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

function getBudget(row: BidRow): number {
  return parseInt(row.assign_bdgt_amt || row.presmpt_prce || "0") || 0;
}

function classifyAgency(rawName: string | null): string {
  if (!rawName) return "기타";
  const n = rawName.trim();
  // 지자체
  if (["특별시", "광역시", "특별자치", "도청", "시청", "구청", "군청", "교육청"].some((s) => n.includes(s))) return "지자체";
  const parts = n.split(/\s+/);
  if (parts.length >= 2 && /[도시]$/.test(parts[0]) && /[시군구동읍면청]$/.test(parts[1])) return "지자체";
  if (/[도시군구]$/.test(n) && n.length <= 5) return "지자체";
  // 대학/연구
  if (["대학교", "대학원", "과학기술원", "대학", "교대", "교육원", "연구원", "연구소", "과학원", "기술원"].some((s) => n.includes(s)))
    return "대학/연구기관";
  if (["KAIST", "KIST", "GIST", "POSTECH", "UNIST", "DGIST", "ETRI"].some((s) => n.toUpperCase().includes(s)))
    return "대학/연구기관";
  // 중앙부처
  if (["부", "처", "청", "위원회", "본부", "국", "실"].some((s) => n.endsWith(s))) return "중앙부처";
  // 공공기관
  if (["공사", "공단", "공항", "재단", "진흥원", "관리원", "지사", "관리공단"].some((s) => n.endsWith(s))) return "공공기관";
  if (["공사 ", "공단 ", "진흥원 ", "재단 ", "관리원 "].some((s) => n.includes(s))) return "공공기관";
  if (["센터", "기금", "병원", "보건소", "문화원", "복지관", "도서관", "박물관"].some((s) => n.includes(s))) return "공공기관";
  // 민간위탁
  if (["재단법인", "사단법인", "주식회사", "협동조합", "농협", "수협", "협회", "중앙회", "노동조합", "상공회의소"].some((s) => n.includes(s)))
    return "민간위탁";
  return "기타";
}

function ymOf(dateStr: string | null): string {
  if (!dateStr || dateStr.length < 7) return "";
  return dateStr.slice(0, 7);
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const sixMoAgo = new Date(Date.now() - SIX_MONTH_DAYS * 86400000).toISOString().slice(0, 10);
    const todayKst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // 6개월 누적 데이터 페이지네이션 fetch
    const rawRows: BidRow[] = [];
    const PAGE = 1000;
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from("bids")
        .select("ai_category, ntce_instt_nm, dmnd_instt_nm, bid_ntce_nm, bid_ntce_date, bid_clse_date, assign_bdgt_amt, presmpt_prce")
        .gte("bid_ntce_date", sixMoAgo)
        .range(offset, offset + PAGE - 1);
      if (error) throw error;
      const page = data ?? [];
      rawRows.push(...(page as BidRow[]));
      if (page.length < PAGE) break;
      offset += PAGE;
    }
    // 단가계약 사업 제외
    const rows = rawRows.filter((r) => !isUnitContract(r));

    // KPI
    const active = rows.filter((r) => r.bid_clse_date && r.bid_clse_date >= todayKst);
    const urgentCutoff = new Date(Date.now() + 7 * 86400000 + 9 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);
    const urgent = active.filter((r) => r.bid_clse_date! <= urgentCutoff);

    const thisMonth = todayKst.slice(0, 7);
    const lastMonth = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().slice(0, 7);
    })();

    const thisMonthRows = rows.filter((r) => ymOf(r.bid_ntce_date) === thisMonth);
    const lastMonthRows = rows.filter((r) => ymOf(r.bid_ntce_date) === lastMonth);

    const kpi = {
      active: active.length,
      thisMonthCount: thisMonthRows.length,
      lastMonthCount: lastMonthRows.length,
      urgent: urgent.length,
      activeBudget: active.reduce((s, r) => s + getBudget(r), 0),
      thisMonthBudget: thisMonthRows.reduce((s, r) => s + getBudget(r), 0),
      lastMonthBudget: lastMonthRows.reduce((s, r) => s + getBudget(r), 0),
    };

    // 카테고리 분포 (active 기준 — 사용자가 지금 참여 가능한 분야 분포)
    const categoryDistMap: Record<string, number> = {};
    for (const r of active) {
      const c = r.ai_category || "미분류";
      if (c === "무관") continue;
      categoryDistMap[c] = (categoryDistMap[c] ?? 0) + 1;
    }
    const categoryDistribution = Object.entries(categoryDistMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // 월별 등록 추이 (6개월) — total + 예산 + 카테고리별
    const monthlyMap = new Map<string, { total: number; totalBudget: number; byCategory: Record<string, number> }>();
    for (const r of rows) {
      const ym = ymOf(r.bid_ntce_date);
      if (!ym) continue;
      let entry = monthlyMap.get(ym);
      if (!entry) {
        entry = { total: 0, totalBudget: 0, byCategory: {} };
        monthlyMap.set(ym, entry);
      }
      entry.total += 1;
      entry.totalBudget += getBudget(r);
      const c = r.ai_category && r.ai_category !== "무관" ? r.ai_category : "미분류";
      entry.byCategory[c] = (entry.byCategory[c] ?? 0) + 1;
    }
    // 최근 6개월만 (부분 적재된 가장 오래된 월 자동 제외)
    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, entry]) => ({
        month,
        total: entry.total,
        totalBudget: entry.totalBudget,
        ...Object.fromEntries(
          KNOWN_CATEGORIES.map((c) => [c, entry.byCategory[c] ?? 0])
        ),
      }));

    // 카테고리별 변화율 (이번달 vs 지난달)
    const thisMonthByCat: Record<string, number> = {};
    const lastMonthByCat: Record<string, number> = {};
    for (const r of thisMonthRows) {
      const c = r.ai_category && r.ai_category !== "무관" ? r.ai_category : "미분류";
      thisMonthByCat[c] = (thisMonthByCat[c] ?? 0) + 1;
    }
    for (const r of lastMonthRows) {
      const c = r.ai_category && r.ai_category !== "무관" ? r.ai_category : "미분류";
      lastMonthByCat[c] = (lastMonthByCat[c] ?? 0) + 1;
    }
    const categoryChange = KNOWN_CATEGORIES.map((category) => {
      const cur = thisMonthByCat[category] ?? 0;
      const prev = lastMonthByCat[category] ?? 0;
      const diff = cur - prev;
      const changePct = prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);
      return { category, thisMonth: cur, lastMonth: prev, diff, changePct };
    }).filter((c) => c.thisMonth + c.lastMonth > 0);

    // Top 10 발주기관 (active 기준, 조달청·지방조달청은 위탁 거점이라 제외)
    const agencyMap: Record<string, { count: number; totalBudget: number }> = {};
    for (const r of active) {
      const name = (r.ntce_instt_nm || "").trim();
      if (!name || name.startsWith("조달청")) continue;
      const a = agencyMap[name] ?? { count: 0, totalBudget: 0 };
      a.count += 1;
      a.totalBudget += getBudget(r);
      agencyMap[name] = a;
    }
    const topAgencies = Object.entries(agencyMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 마감 D-day 분포 (active 기준)
    const nowMs = Date.now();
    const ddayBuckets = [
      { label: "D-0~3", min: 0, max: 3 },
      { label: "D-4~7", min: 4, max: 7 },
      { label: "D-8~14", min: 8, max: 14 },
      { label: "D-15~30", min: 15, max: 30 },
      { label: "D-31+", min: 31, max: 9999 },
    ];
    const ddayDistribution = ddayBuckets.map((b) => {
      const count = active.filter((r) => {
        if (!r.bid_clse_date) return false;
        const close = new Date(`${r.bid_clse_date}T23:59:00`).getTime();
        const dday = Math.ceil((close - nowMs) / (1000 * 60 * 60 * 24));
        return dday >= b.min && dday <= b.max;
      }).length;
      return { range: b.label, count };
    });

    // 카테고리별 평균 예산 (active 기준, 예산 > 0)
    const catBudgetMap: Record<string, { count: number; sum: number }> = {};
    for (const r of active) {
      const c = r.ai_category && r.ai_category !== "무관" ? r.ai_category : "미분류";
      const b = getBudget(r);
      if (b === 0) continue;
      const e = catBudgetMap[c] ?? { count: 0, sum: 0 };
      e.count += 1;
      e.sum += b;
      catBudgetMap[c] = e;
    }
    const categoryAvgBudget = Object.entries(catBudgetMap)
      .map(([category, v]) => ({ category, count: v.count, avgBudget: Math.round(v.sum / v.count) }))
      .sort((a, b) => b.avgBudget - a.avgBudget);

    // 예산대 분포 (active)
    const budgetBuckets = [
      { label: "1억 미만", min: 0, max: 100_000_000 },
      { label: "1~10억", min: 100_000_000, max: 1_000_000_000 },
      { label: "10~100억", min: 1_000_000_000, max: 10_000_000_000 },
      { label: "100억 이상", min: 10_000_000_000, max: Number.POSITIVE_INFINITY },
    ];
    const budgetDistribution = budgetBuckets.map((b) => {
      const items = active.filter((r) => {
        const n = getBudget(r);
        return n >= b.min && n < b.max;
      });
      return {
        range: b.label,
        count: items.length,
        totalBudget: items.reduce((s, r) => s + getBudget(r), 0),
      };
    });

    // 기관 유형별 분포 (active 기준)
    const agencyTypeMap: Record<string, number> = {};
    for (const r of active) {
      const t = classifyAgency(r.ntce_instt_nm);
      agencyTypeMap[t] = (agencyTypeMap[t] ?? 0) + 1;
    }
    const agencyTypeDistribution = Object.entries(agencyTypeMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      kpi,
      categoryDistribution,
      monthlyTrend,
      categoryChange,
      topAgencies,
      budgetDistribution,
      ddayDistribution,
      categoryAvgBudget,
      agencyTypeDistribution,
    });
  } catch (e) {
    console.error("[proc/dashboard]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
