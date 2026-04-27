"use client";

import { useEffect, useState } from "react";
import { AI_CATEGORIES, AiCategory, BidItem } from "@/lib/g2b";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "proc_company_profile_v1";

interface CompanyProfile {
  categories: AiCategory[];
  budgetMin: number;
  budgetMax: number;
  description: string;
}

interface MatchedBid extends BidItem {
  similarity: number;
}

const DEFAULT_PROFILE: CompanyProfile = {
  categories: [],
  budgetMin: 0,
  budgetMax: 100_000_000_000,
  description: "",
};

const BUDGET_PRESETS = [
  { label: "전체", min: 0, max: 100_000_000_000 },
  { label: "1억 미만", min: 0, max: 100_000_000 },
  { label: "1~10억", min: 100_000_000, max: 1_000_000_000 },
  { label: "10~100억", min: 1_000_000_000, max: 10_000_000_000 },
  { label: "100억 이상", min: 10_000_000_000, max: 100_000_000_000 },
];

const CATEGORY_COLORS: Record<string, string> = {
  "LLM/생성형 AI": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "RAG/지식 검색": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "컴퓨터 비전": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "음성/STT": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "빅데이터 분석": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "AI 인프라/MLOps": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "AI 정책/연구용역": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "AI 교육/컨설팅": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "디지털 전환": "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  "기타 AI": "bg-muted text-muted-foreground",
};

function formatBudget(amt: string | number): string {
  const n = typeof amt === "number" ? amt : parseInt(amt ?? "0");
  if (!n) return "-";
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return `${n.toLocaleString()}원`;
}

function getDday(dateStr: string, timeStr?: string): number {
  if (!dateStr) return 999;
  const close = new Date(`${dateStr}T${timeStr ?? "23:59"}:00`);
  return Math.ceil((close.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function RecommendTab() {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [bids, setBids] = useState<MatchedBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // localStorage 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CompanyProfile;
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
        setSubmitted(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // 프로필이 있으면 자동 추천 fetch
  useEffect(() => {
    if (!submitted) return;
    fetchMatches(profile);
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchMatches(p: CompanyProfile) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proc/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      setBids(data.matches ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch 실패");
      setBids([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.description.trim() && profile.categories.length === 0) {
      setError("관심 카테고리 또는 회사 소개 중 하나는 입력해주세요.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSubmitted(true);
    fetchMatches(profile);
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE);
    setBids([]);
    setSubmitted(false);
    setError(null);
  }

  function toggleCategory(cat: AiCategory) {
    setProfile((p) => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter((c) => c !== cat)
        : [...p.categories, cat],
    }));
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 mb-8">
        <h2 className="text-base font-semibold mb-1">내 회사 정보</h2>
        <p className="text-xs text-muted-foreground mb-5">
          입력하신 정보는 브라우저에만 저장되며 서버에 전송되지 않습니다.
          (단, 매칭 시 회사 소개 텍스트는 임베딩을 위해 전송됩니다)
        </p>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              관심 카테고리 (다중 선택 가능)
            </label>
            <div className="flex flex-wrap gap-2">
              {AI_CATEGORIES.map((cat) => {
                const active = profile.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                      active
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              희망 사업 예산대
            </label>
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((preset) => {
                const active = profile.budgetMin === preset.min && profile.budgetMax === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, budgetMin: preset.min, budgetMax: preset.max }))}
                    className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150",
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              회사 소개 / 주력 분야 (자연어)
            </label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
              placeholder="예: 저희는 RAG·LLM 기반 사내 지식관리 시스템 SI 기업이며, 공공기관 디지털 전환 사업 경험이 풍부합니다."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/40 resize-none"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-4">{error}</p>}

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="text-sm font-medium px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            {submitted ? "다시 추천받기" : "맞춤 공고 추천받기"}
          </button>
          {submitted && (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-medium px-4 py-2 rounded-xl border bg-background text-muted-foreground hover:text-foreground transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground mt-3">맞춤 공고 매칭 중...</p>
        </div>
      )}

      {!loading && submitted && bids.length === 0 && !error && (
        <p className="text-center text-muted-foreground py-12 text-sm">
          매칭되는 공고가 없습니다. 카테고리·예산 조건을 완화해보세요.
        </p>
      )}

      {!loading && bids.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            매칭 점수 높은 순 {bids.length}건
          </p>
          <div className="flex flex-col gap-3">
            {bids.map((bid, idx) => {
              const dday = getDday(bid.bidClseDate, bid.bidClseTm);
              const budget = formatBudget(bid.asignBdgtAmt || bid.presmptPrce);
              const matchPct = Math.round(bid.similarity * 100);
              return (
                <a
                  key={`${bid.bidNtceNo}-${bid.bidNtceOrd}-${idx}`}
                  href={bid.bidNtceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border bg-card p-5 hover:shadow-md hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        매칭 {matchPct}%
                      </span>
                      {bid.aiCategory && bid.aiCategory !== "분류실패" && (
                        <span className={cn(
                          "text-[10px] font-medium px-2 py-0.5 rounded-full",
                          CATEGORY_COLORS[bid.aiCategory] ?? "bg-muted text-muted-foreground"
                        )}>
                          {bid.aiCategory}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground/60">{bid.ntceInsttNm}</span>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">
                      {bid.bidNtceNm}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-muted-foreground">공고 {bid.bidNtceDate}</span>
                      {bid.bidClseDate && (
                        <span className="text-xs text-muted-foreground">
                          마감 {bid.bidClseDate} {bid.bidClseTm}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 flex-shrink-0">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      dday < 0 ? "bg-muted text-muted-foreground"
                        : dday === 0 ? "bg-red-500 text-white animate-pulse"
                        : dday <= 3 ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : dday <= 7 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {dday < 0 ? "마감" : dday === 0 ? "D-day" : `D-${dday}`}
                    </span>
                    <span className="text-sm font-bold text-foreground">{budget}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
