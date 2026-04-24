const G2B_KEY = process.env.G2B_API_KEY ?? "3393eec4c01364de879d496e848da7a9a067555abbff33f38f6293502956fc71";
const BASE = "https://apis.data.go.kr/1230000/ao/PubDataOpnStdService";

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
  label: string; // "2026-04"
  count: number;
  totalBudget: number;
}

function getMonthRange(year: number, month: number) {
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return {
    bgn: `${year}${mm}010000`,
    end: `${year}${mm}${lastDay}2359`,
    label: `${year}-${mm}`,
  };
}

function isAIBid(name: string) {
  return AI_KEYWORDS.some((kw) => name?.includes(kw));
}

async function fetchMonthBids(year: number, month: number, maxPages = 10): Promise<BidItem[]> {
  const { bgn, end } = getMonthRange(year, month);
  const allItems: BidItem[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = `${BASE}/getDataSetOpnStdBidPblancInfo?serviceKey=${G2B_KEY}&pageNo=${page}&numOfRows=100&type=json&bidNtceBgnDt=${bgn}&bidNtceEndDt=${end}`;
    try {
      const res = await fetch(url, { next: { revalidate: 21600 } }); // 6시간 캐시
      const text = await res.text();
      if (!text.startsWith("{")) break;
      const data = JSON.parse(text);
      const items: BidItem[] = data?.response?.body?.items ?? [];
      allItems.push(...items);
      if (items.length < 100) break;
    } catch {
      break;
    }
  }

  return allItems.filter((item) => isAIBid(item.bidNtceNm));
}

// 이번달 공고 (현재 페이지 메인 데이터)
export async function fetchAIBids(): Promise<BidItem[]> {
  const now = new Date();
  return fetchMonthBids(now.getFullYear(), now.getMonth() + 1, 10);
}

// 최근 N개월 통계 (트렌드 비교용)
export async function fetchMonthlyStats(months = 6): Promise<MonthStat[]> {
  const now = new Date();
  const results: MonthStat[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const { label } = getMonthRange(year, month);

    // 통계용은 5페이지만 (500건 샘플)
    const bids = await fetchMonthBids(year, month, 2);
    const totalBudget = bids.reduce((sum, b) => sum + parseInt(b.asignBdgtAmt || b.presmptPrce || "0"), 0);

    results.push({ label, count: bids.length, totalBudget });
  }

  return results;
}
