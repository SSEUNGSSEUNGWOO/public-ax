import { Hero } from "@/components/marketing/hero";
import { ChampionCard } from "@/components/champion/champion-card";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { InsightCard } from "@/components/insights/insight-card";
import { ProcWidget } from "@/components/marketing/proc-widget";
import { JoinCta } from "@/components/marketing/join-cta";
import { LinkButton } from "@/components/shared/link-button";
import { NavCards } from "@/components/marketing/nav-cards";
import { fetchUnsplashPhotos } from "@/lib/unsplash";

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

const insightQueries = [
  "government AI technology trends",
  "smart city digital transformation",
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

const insights = [
  {
    slug: "2025-q1-public-ai-trends",
    title: "2025년 1분기 공공 AI 조달 트렌드 분석",
    summary:
      "RAG와 문서 AI가 전체 공고의 45%를 차지하며, 평균 예산 규모가 전년 대비 30% 증가했습니다.",
    publishedAt: "2025-04-15",
    sourceType: "original" as const,
  },
  {
    slug: "local-gov-ai-case-studies",
    title: "지자체 AI 도입 성공 사례 5선",
    summary:
      "서울, 부산, 대전, 세종, 제주의 AI 전환 사례를 분석합니다.",
    publishedAt: "2025-04-10",
    sourceType: "curated" as const,
  },
];

export default async function Home() {
  const [portfolioImages, insightImages] = await Promise.all([
    fetchUnsplashPhotos(portfolioQueries),
    fetchUnsplashPhotos(insightQueries),
  ]);

  return (
    <>
      <Hero bgImage="/hero-bg.jpg" />
      <NavCards />

      <section className="py-16 mt-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">최근 포트폴리오</h2>
            <LinkButton href="/portfolio" variant="ghost" size="sm">
              전체 보기 &rarr;
            </LinkButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio, i) => (
              <PortfolioCard
                key={portfolio.slug}
                {...portfolio}
                coverImage={portfolioImages[i] ?? undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">이번 주 인사이트</h2>
            <LinkButton href="/insights" variant="ghost" size="sm">
              전체 보기 &rarr;
            </LinkButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, i) => (
              <InsightCard
                key={insight.slug}
                {...insight}
                coverImage={insightImages[i] ?? undefined}
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
