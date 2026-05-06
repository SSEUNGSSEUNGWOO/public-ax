import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bids } from "@/lib/db/schema";
import { and, gte, ilike, or, sql } from "drizzle-orm";

interface RequestBody {
  categories?: string[];
  budgetMin?: number;
  budgetMax?: number;
  description?: string;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const categories = (body.categories ?? []).filter((c) => c && c !== "무관");
    const budgetMin = body.budgetMin ?? 0;
    const budgetMax = body.budgetMax ?? 100_000_000_000;
    const description = (body.description ?? "").trim();

    if (!description && categories.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // KST 기준 오늘
    const todayKst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // 조건 조합
    const conditions = [gte(bids.bidClseDate, todayKst)];

    // 카테고리 필터
    if (categories.length > 0) {
      conditions.push(
        or(...categories.map((c) => sql`${bids.aiCategory} = ${c}`))!
      );
    }

    // 예산 필터 (assign_bdgt_amt 또는 presmpt_prce 사용)
    if (budgetMin > 0 || budgetMax < 100_000_000_000) {
      conditions.push(
        sql`COALESCE(NULLIF(${bids.assignBdgtAmt}, ''), ${bids.presmptPrce})::bigint BETWEEN ${budgetMin} AND ${budgetMax}`
      );
    }

    // 텍스트 검색: description에서 키워드 추출 후 ILIKE
    if (description) {
      const keywords = description
        .split(/[\s,;.·]+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 2);

      if (keywords.length > 0) {
        const likeConditions = keywords.map((kw) => ilike(bids.bidNtceNm, `%${kw}%`));
        conditions.push(or(...likeConditions)!);
      }
    }

    const rows = await db
      .select({
        bid_ntce_no: bids.bidNtceNo,
        bid_ntce_ord: bids.bidNtceOrd,
        bid_ntce_nm: bids.bidNtceNm,
        bid_ntce_sttus: bids.bidNtceSttus,
        bid_ntce_date: bids.bidNtceDate,
        bsns_div_nm: bids.bsnsDivNm,
        ntce_instt_nm: bids.ntceInsttNm,
        assign_bdgt_amt: bids.assignBdgtAmt,
        presmpt_prce: bids.presmptPrce,
        bid_clse_date: bids.bidClseDate,
        bid_clse_tm: bids.bidClseTm,
        bid_ntce_url: bids.bidNtceUrl,
        ai_category: bids.aiCategory,
      })
      .from(bids)
      .where(and(...conditions))
      .orderBy(sql`${bids.bidClseDate} ASC`)
      .limit(60);

    // dedupe: 같은 (공고명·발주기관·마감일) 사업은 가장 최신 차수만
    const seen = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      const key = `${r.bid_ntce_nm}|${r.ntce_instt_nm}|${r.bid_clse_date}`;
      const existing = seen.get(key);
      if (
        !existing ||
        (r.bid_ntce_no ?? "") > (existing.bid_ntce_no ?? "") ||
        ((r.bid_ntce_no ?? "") === (existing.bid_ntce_no ?? "") && (r.bid_ntce_ord ?? "") > (existing.bid_ntce_ord ?? ""))
      ) {
        seen.set(key, r);
      }
    }

    const deduped = Array.from(seen.values()).slice(0, 20);

    const matches = deduped.map((r) => ({
      bidNtceNo: r.bid_ntce_no,
      bidNtceOrd: r.bid_ntce_ord,
      bidNtceNm: r.bid_ntce_nm,
      bidNtceSttusNm: r.bid_ntce_sttus,
      bidNtceDate: r.bid_ntce_date,
      bidNtceBgn: "",
      bsnsDivNm: r.bsns_div_nm,
      ntceInsttNm: r.ntce_instt_nm,
      asignBdgtAmt: r.assign_bdgt_amt,
      presmptPrce: r.presmpt_prce,
      bidClseDate: r.bid_clse_date,
      bidClseTm: r.bid_clse_tm,
      bidNtceUrl: r.bid_ntce_url,
      aiCategory: r.ai_category,
      similarity: 0,
    }));

    return NextResponse.json({ matches });
  } catch (e) {
    console.error("[proc/recommend]", e);
    return NextResponse.json({ matches: [], error: String(e) }, { status: 500 });
  }
}
