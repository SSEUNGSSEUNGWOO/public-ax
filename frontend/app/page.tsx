import { Hero } from "@/components/marketing/hero";
import { ChampionCard } from "@/components/champion/champion-card";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { InsightCard } from "@/components/insights/insight-card";
import { ProcWidget } from "@/components/marketing/proc-widget";
import { JoinCta } from "@/components/marketing/join-cta";
import { AboutSection } from "@/components/marketing/about-section";
import { LinkButton } from "@/components/shared/link-button";
import { NavCards } from "@/components/marketing/nav-cards";
import { fetchUnsplashPhotos } from "@/lib/unsplash";
import { getAllInsights } from "@/lib/insights";
import { getCountsForType } from "@/lib/counts";

const champions = [
  {
    slug: "kim-minsoo",
    name: "김민수",
    title: "AI정책관",
    affiliation: "행정안전부",
    bio: "정부 AI 도입 가이드라인을 설계하고 10개 부처 AX 전환을 총괄",
    yearAwarded: 2025,
    domain: ["행정", "정책"],
  },
  {
    slug: "lee-jihye",
    name: "이지혜",
    title: "데이터사이언스팀장",
    affiliation: "서울디지털재단",
    bio: "서울시 120 민원 AI 챗봇을 설계하여 응답 시간 70% 단축",
    yearAwarded: 2025,
    domain: ["행정", "AI챗봇"],
  },
  {
    slug: "park-junhyeok",
    name: "박준혁",
    title: "CTO",
    affiliation: "메디AI",
    bio: "공공병원 의료영상 AI 판독 시스템을 구축하여 진단 정확도 95% 달성",
    yearAwarded: 2024,
    domain: ["의료", "영상AI"],
  },
];

const portfolioQueries = [
  "chatbot artificial intelligence",
  "medical AI xray hospital",
  "legal document analysis",
  "education technology learning",
  "satellite remote sensing",
  "data analytics fraud detection",
];


const portfolios = [
  {
    slug: "seoul-120-chatbot",
    title: "서울시 120 AI 민원 챗봇",
    summary: "RAG 기반 민원 상담 챗봇으로 월 50만 건 처리",
    techStack: ["RAG", "LLM", "FastAPI"],
    championName: "이지혜",
  },
  {
    slug: "medi-ai-xray",
    title: "공공병원 X-Ray AI 판독",
    summary: "흉부 X-Ray 이상 소견 자동 판독 시스템",
    techStack: ["Computer Vision", "PyTorch", "DICOM"],
    championName: "박준혁",
  },
  {
    slug: "moleg-doc-ai",
    title: "법제처 법령 문서 AI 분석",
    summary: "법령 개정안 자동 비교 및 영향 분석 시스템",
    techStack: ["NLP", "문서AI", "Python"],
    championName: "김민수",
  },
  {
    slug: "education-tutor",
    title: "교육부 AI 튜터 시범사업",
    summary: "초등 수학 개인화 학습 AI 튜터",
    techStack: ["LLM", "Adaptive Learning"],
    championName: "정수연",
  },
  {
    slug: "env-satellite-ai",
    title: "환경부 위성영상 AI 모니터링",
    summary: "불법 폐기물 투기 실시간 탐지",
    techStack: ["Satellite", "Object Detection"],
    championName: "최영호",
  },
  {
    slug: "welfare-fraud-detect",
    title: "복지부 부정수급 AI 탐지",
    summary: "이상거래 패턴 분석으로 부정수급 예방",
    techStack: ["Anomaly Detection", "ML"],
    championName: "한소영",
  },
];

export default async function Home() {
  const [portfolioImages, allInsights, insightCounts] = await Promise.all([
    fetchUnsplashPhotos(portfolioQueries),
    getAllInsights(),
    getCountsForType("insight"),
  ]);
  const recentInsights = allInsights.slice(0, 2);

  return (
    <>
      <Hero bgImage="/hero-bg.jpg" />
      <NavCards />

      <div className="mt-16" />
      <AboutSection
        insightCount={allInsights[0]?.crawled_count ?? 0}
        championCount={champions.length}
        portfolioCount={portfolios.length}
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">최근 인사이트</h2>
            <LinkButton href="/insights" variant="ghost" size="sm">
              전체 보기 &rarr;
            </LinkButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentInsights.map((insight) => (
              <InsightCard
                key={insight.slug}
                slug={insight.slug}
                title={insight.title}
                publishedAt={insight.published_at}
                coverImage={insight.image_url ?? undefined}
                likeCount={insightCounts[insight.slug]?.likes ?? 0}
                commentCount={insightCounts[insight.slug]?.comments ?? 0}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">공공 AX 포트폴리오</h2>
            <LinkButton href="/portfolio" variant="ghost" size="sm">
              전체 보기 &rarr;
            </LinkButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.slice(0, 3).map((portfolio, i) => (
              <PortfolioCard
                key={portfolio.slug}
                {...portfolio}
                coverImage={portfolioImages[i] ?? undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <ProcWidget
        totalTenders={47}
        totalBudget={283}
        topAgency="행정안전부"
      />

      <JoinCta />
    </>
  );
}
