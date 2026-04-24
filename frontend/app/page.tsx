import { Hero } from "@/components/marketing/hero";
import { ProcWidget } from "@/components/marketing/proc-widget";
import { JoinCta } from "@/components/marketing/join-cta";
import { AboutSection } from "@/components/marketing/about-section";
import { LinkButton } from "@/components/shared/link-button";
import { NavCards } from "@/components/marketing/nav-cards";
import { getAllInsights } from "@/lib/insights";
import { getAllGuides, GuideImage } from "@/lib/guides";
import { getCountsForType } from "@/lib/counts";
import { fetchAIBids } from "@/lib/g2b";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  "AI 기초": "text-blue-600 dark:text-blue-400",
  "실무 활용": "text-emerald-600 dark:text-emerald-400",
  "기술 심화": "text-violet-600 dark:text-violet-400",
};


export const dynamic = "force-dynamic";

export const metadata = {
  title: "PUBLIC-AX | 공공 AI 전환 플랫폼",
  description: "매일 AI 동향을 분석해 공공기관 실무자에게 인사이트를 제공하는 케이브레인 AI퍼블릭센터의 커뮤니티 포털",
  openGraph: {
    title: "PUBLIC-AX | 공공 AI 전환 플랫폼",
    description: "매일 AI 동향을 분석해 공공기관 실무자에게 인사이트를 제공하는 커뮤니티 포털",
    url: "https://public-ax.kr",
  },
};

export default async function Home() {
  const [allInsights, allGuides, insightCounts, guideCounts, aiBids] = await Promise.all([
    getAllInsights(),
    getAllGuides(),
    getCountsForType("insight"),
    getCountsForType("guide"),
    fetchAIBids(),
  ]);

  const procTotalBudget = Math.round(
    aiBids.reduce((sum, b) => sum + parseInt(b.asignBdgtAmt || b.presmptPrce || "0"), 0) / 100_000_000
  );
  const agencyCount: Record<string, number> = {};
  for (const b of aiBids) {
    if (b.ntceInsttNm) agencyCount[b.ntceInsttNm] = (agencyCount[b.ntceInsttNm] ?? 0) + 1;
  }
  const topAgency = Object.entries(agencyCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const todayInsight = allInsights[0] ?? null;
  const recentGuides = allGuides.slice(0, 3);

  return (
    <>
      <Hero bgImage="/hero-bg.jpg" />
      <NavCards />

      <div className="mt-16" />
      <AboutSection
        insightCount={allInsights[0]?.crawled_count ?? 0}
        championCount={3}
        portfolioCount={allGuides.length}
      />

      {todayInsight && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">오늘의 인사이트</h2>
              <LinkButton href="/insights" variant="ghost" size="sm">
                전체 보기 &rarr;
              </LinkButton>
            </div>
            <Link
              href={`/insights/${todayInsight.slug}`}
              className="group grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* 왼쪽: 커버 이미지 + 기본 정보 */}
              <div className="relative overflow-hidden">
                {todayInsight.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={todayInsight.image_url}
                    alt={todayInsight.title}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-64 md:h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground/30 text-sm">Daily Report</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70 block mb-1">Daily Report</span>
                  <h3 className="text-white font-bold text-lg leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                    {todayInsight.title}
                  </h3>
                </div>
              </div>

              {/* 오른쪽: 핵심 인사이트 제목 목록 */}
              <div className="p-6 flex flex-col group-hover:bg-primary/5 transition-colors duration-200">
                <div className="flex flex-col justify-center flex-1 py-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-4">이번 리포트 핵심 주제</p>
                  <ul className="flex flex-col gap-3">
                    {todayInsight.body
                      .split("\n")
                      .flatMap((line) => {
                        const h = line.match(/^#{2,3}\s+(.+)/);
                        if (h) return [h[1].trim()];
                        const numbered = line.match(/^\d+\.\s+#{2,3}\s+(.+)/);
                        if (numbered) return [numbered[1].trim()];
                        return [];
                      })
                      .filter((t: string) => !["핵심인사이트", "핵심 인사이트", "공공 AI 시사점", "공공AI 시사점", "오늘의 인사이트"].some((kw) => t.includes(kw)))
                      .slice(0, 7)
                      .map((title: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-foreground/80 leading-snug text-base">{title}</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/60">케이브레인 AI퍼블릭센터 · 장승우</span>
                    <span className="text-xs text-muted-foreground/50">조회 {todayInsight.views ?? 0}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {insightCounts[todayInsight.slug]?.likes ?? 0}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-primary group-hover:underline">전체 읽기 →</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">가이드</h2>
            <LinkButton href="/guide" variant="ghost" size="sm">
              전체 보기 &rarr;
            </LinkButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentGuides.map((guide) => {
              const cover = (guide.images ?? []).find((img: GuideImage) => img.type === "cover");
              const colorClass = CATEGORY_COLORS[guide.category] ?? "text-primary";
              return (
                <Link
                  key={guide.slug}
                  href={`/guide/${guide.slug}`}
                  className="group flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:bg-primary/10 transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-video bg-muted overflow-hidden">
                    {cover?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.url} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className={`text-xs font-semibold uppercase tracking-widest ${colorClass} opacity-40`}>{guide.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${colorClass}`}>{guide.category}</span>
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{guide.summary}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-[10px] text-muted-foreground/50">조회 {guide.views ?? 0}</span>
                      <span className="text-[10px] text-muted-foreground/30">·</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/50">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {guideCounts[guide.slug]?.likes ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <ProcWidget
        totalTenders={aiBids.length}
        totalBudget={procTotalBudget}
        topAgency={topAgency}
        recentBids={aiBids}
      />

      <JoinCta />
    </>
  );
}
