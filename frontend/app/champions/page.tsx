import { ChampionCard } from "@/components/champion/champion-card";
import { PageHeader } from "@/components/shared/page-header";

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

const years = [...new Set(champions.map((c) => c.yearAwarded).filter(Boolean))].sort((a, b) => b! - a!);

export default function ChampionsPage() {
  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <PageHeader
            eyebrow="Hall of Fame"
            title="AI 챔피언"
            description="공공 AI 전환을 현장에서 실제로 이끈 사람들을 기록합니다. 그들의 도전과 성과가 다음 변화를 만드는 디딤돌이 됩니다."
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-5xl">

      {/* 등급 안내 */}
      <div className="mb-16">
        <h2 className="text-xl font-bold mb-5">인증 등급</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-6 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <div>
              <div className="font-bold mb-0.5">그린 <span className="text-xs font-normal text-muted-foreground ml-1">Green</span></div>
              <div className="text-xs text-primary font-medium mb-2">실무자 등급</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                초급~중급 수준의 실무자 대상. AI 기본 활용 능력을 갖춘 공무원을 양성합니다.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border p-6 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <div>
              <div className="font-bold mb-0.5">블루 <span className="text-xs font-normal text-muted-foreground ml-1">Blue</span></div>
              <div className="text-xs text-primary font-medium mb-2">심화·고급 등급</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Python·머신러닝·데이터 분석 등 고급 실무 능력 보유자. 실제 행정 개선 과제를 수행합니다.
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-right">2030년까지 AI 챔피언 2만 명 양성 목표 (행정안전부)</p>
      </div>

      {/* 연도별 섹션 */}
      {years.map((year) => (
        <section key={year} className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg">🏆</span>
              <h2 className="text-xl font-bold">{year}년 챔피언</h2>
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {champions
              .filter((c) => c.yearAwarded === year)
              .map((champion) => (
                <ChampionCard key={champion.slug} {...champion} />
              ))}
          </div>
        </section>
      ))}

      {/* 인증 안내 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-3 block">행정안전부 인증</span>
          <h3 className="text-lg font-bold mb-3">공공부문 AI 챔피언 인증</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            공무원을 대상으로 AI 기술 적용 역량을 평가하는 공식 인증 과정입니다.
            심화 교육 → 프로젝트 실습 → 평가의 3단계를 통과하면 자격이 부여됩니다.
          </p>
          <ol className="flex flex-col gap-2 text-sm">
            {["심화 교육 이수", "프로젝트 실습", "평가 통과 → 인증 부여"].map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border bg-card p-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-3 block">과학기술정보통신부</span>
          <h3 className="text-lg font-bold mb-3">AI 자격인증제 <span className="text-sm font-normal text-muted-foreground">2026년 하반기 시행</span></h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            정부 공신력을 갖춘 AI 실무능력 자격 체계로, TOPCIT과 유사한 구조입니다.
            공무원·공공기관 직원을 포함한 개인 대상으로 본격 시행 예정입니다.
          </p>
          <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            🔔 시행 일정 및 접수 정보는 커뮤니티에서 공유됩니다.
          </div>
          <a
            href="/join"
            className="mt-4 inline-flex items-center justify-center h-9 px-5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            커뮤니티 참여하기
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
