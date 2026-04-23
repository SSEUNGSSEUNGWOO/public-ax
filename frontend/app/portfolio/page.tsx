import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { fetchUnsplashPhotos } from "@/lib/unsplash";
import { PageHeader } from "@/components/shared/page-header";

const portfolios = [
  {
    slug: "seoul-120-chatbot",
    title: "서울시 120 AI 민원 챗봇",
    summary: "RAG 기반 민원 상담 챗봇으로 월 50만 건 처리",
    techStack: ["RAG", "LLM", "FastAPI"],
    championName: "이지혜",
    agency: "서울디지털재단",
    domain: "행정",
  },
  {
    slug: "medi-ai-xray",
    title: "공공병원 X-Ray AI 판독",
    summary: "흉부 X-Ray 이상 소견 자동 판독 시스템",
    techStack: ["Computer Vision", "PyTorch", "DICOM"],
    championName: "박준혁",
    agency: "메디AI",
    domain: "의료",
  },
  {
    slug: "moleg-doc-ai",
    title: "법제처 법령 문서 AI 분석",
    summary: "법령 개정안 자동 비교 및 영향 분석 시스템",
    techStack: ["NLP", "문서AI", "Python"],
    championName: "김민수",
    agency: "법제처",
    domain: "법무",
  },
  {
    slug: "education-tutor",
    title: "교육부 AI 튜터 시범사업",
    summary: "초등 수학 개인화 학습 AI 튜터",
    techStack: ["LLM", "Adaptive Learning"],
    championName: "정수연",
    agency: "교육부",
    domain: "교육",
  },
  {
    slug: "env-satellite-ai",
    title: "환경부 위성영상 AI 모니터링",
    summary: "불법 폐기물 투기 실시간 탐지",
    techStack: ["Satellite", "Object Detection"],
    championName: "최영호",
    agency: "환경부",
    domain: "환경",
  },
  {
    slug: "welfare-fraud-detect",
    title: "복지부 부정수급 AI 탐지",
    summary: "이상거래 패턴 분석으로 부정수급 예방",
    techStack: ["Anomaly Detection", "ML"],
    championName: "한소영",
    agency: "보건복지부",
    domain: "복지",
  },
];

const domains = ["전체", ...new Set(portfolios.map((p) => p.domain))];

const queries = portfolios.map((p) => p.title);

export default async function PortfolioPage() {
  const images = await fetchUnsplashPhotos(queries);

  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <PageHeader
            eyebrow="Portfolio"
            title="공공 AX 포트폴리오"
            description="실제 공공기관에 배포된 AI 시스템의 기술 스택, 성과, 교훈을 기록합니다."
            action={<span className="text-sm text-muted-foreground">{portfolios.length}개 사례</span>}
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-6xl">

      {/* 도메인 필터 */}
      <div className="flex flex-wrap gap-2 mb-10">
        {domains.map((d) => (
          <span
            key={d}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
              d === "전체"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio, i) => (
          <PortfolioCard
            key={portfolio.slug}
            {...portfolio}
            coverImage={images[i] ?? undefined}
          />
        ))}
      </div>

      {/* 하단 CTA */}
      <div className="mt-16 rounded-2xl border bg-muted/30 p-10 text-center">
        <h3 className="text-xl font-bold mb-2">사례를 등록하고 싶으신가요?</h3>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          공공기관 AI 도입 사례를 보유하고 계신가요?<br />
          커뮤니티에 공유하고 더 많은 실무자에게 알려주세요.
        </p>
        <a
          href="/join"
          className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          사례 등록하기
        </a>
      </div>
      </div>
    </div>
  );
}
