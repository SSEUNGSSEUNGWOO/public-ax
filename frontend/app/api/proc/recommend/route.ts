import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const EMBED_MODEL = "text-embedding-3-small";

interface RequestBody {
  categories?: string[];
  budgetMin?: number;
  budgetMax?: number;
  description?: string;
}

interface MatchedRow {
  id: string;
  bid_ntce_no: string;
  bid_ntce_ord: string;
  bid_ntce_nm: string;
  bid_ntce_sttus: string;
  bid_ntce_date: string;
  bsns_div_nm: string;
  ntce_instt_nm: string;
  assign_bdgt_amt: string;
  presmpt_prce: string;
  bid_clse_date: string;
  bid_clse_tm: string;
  bid_ntce_url: string;
  ai_category: string | null;
  similarity: number;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const categories = (body.categories ?? []).filter((c) => c && c !== "무관");
    const budgetMin = body.budgetMin ?? 0;
    const budgetMax = body.budgetMax ?? 100_000_000_000;
    const description = (body.description ?? "").trim();

    // 임베딩 텍스트 구성: 회사 소개 + 관심 카테고리
    const embedText = [
      description,
      categories.length > 0 ? `관심 분야: ${categories.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!embedText) {
      return NextResponse.json({ matches: [] });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const embedRes = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: embedText,
    });
    const queryEmbedding = embedRes.data[0].embedding;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 후보를 넉넉히 받아서 KST 기준 마감 필터 + dedupe 후 상위만 노출
    const { data, error } = await supabase.rpc("match_bids", {
      query_embedding: queryEmbedding,
      categories: categories.length ? categories : null,
      budget_min: budgetMin,
      budget_max: budgetMax,
      match_count: 60,
      active_only: false,
    });

    if (error) {
      console.error("[proc/recommend] supabase rpc error:", error);
      return NextResponse.json({ matches: [], error: error.message }, { status: 500 });
    }

    // KST 기준 오늘 (Supabase UTC current_date와 KST 사이 9시간 갭 보정)
    const todayKst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const rows = (data ?? []) as MatchedRow[];
    const filtered = rows.filter((r) => r.bid_clse_date >= todayKst);

    // dedupe: 같은 (공고명·발주기관·마감일) 사업은 가장 최신 차수만, similarity는 max 유지
    const seen = new Map<string, MatchedRow>();
    for (const r of filtered) {
      const key = `${r.bid_ntce_nm}|${r.ntce_instt_nm}|${r.bid_clse_date}`;
      const existing = seen.get(key);
      if (
        !existing ||
        r.bid_ntce_no > existing.bid_ntce_no ||
        (r.bid_ntce_no === existing.bid_ntce_no && r.bid_ntce_ord > existing.bid_ntce_ord)
      ) {
        seen.set(key, { ...r, similarity: Math.max(r.similarity, existing?.similarity ?? 0) });
      } else if (existing) {
        existing.similarity = Math.max(existing.similarity, r.similarity);
      }
    }

    const deduped = Array.from(seen.values()).sort((a, b) => b.similarity - a.similarity).slice(0, 20);

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
      similarity: r.similarity,
    }));

    return NextResponse.json({ matches });
  } catch (e) {
    console.error("[proc/recommend]", e);
    return NextResponse.json({ matches: [], error: String(e) }, { status: 500 });
  }
}
