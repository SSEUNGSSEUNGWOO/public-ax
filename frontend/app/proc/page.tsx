import { PageHeader } from "@/components/shared/page-header";

export default function ProcPage() {
  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <PageHeader
            eyebrow="Coming Soon"
            title="정부 AI 공고"
            description="공공 AI·데이터·디지털 전환 관련 정부 사업 공고를 한곳에 모아 실무자가 놓치지 않도록 모니터링합니다."
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">

      {/* 준비 중 카드 */}
      <div className="rounded-2xl border bg-card p-12 text-center mb-8">
        <div className="text-5xl mb-6">📢</div>
        <h2 className="text-2xl font-bold mb-3">서비스 준비 중입니다</h2>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
          행정안전부, 과학기술정보통신부, 디지털플랫폼정부위원회 등<br />
          주요 기관의 AI 관련 사업 공고를 자동으로 수집·분류해<br />
          곧 서비스할 예정입니다.
        </p>
        <a
          href="/join"
          className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          오픈 알림 받기
        </a>
      </div>

      {/* 예정 기능 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "🔍", title: "자동 수집", desc: "주요 공공기관 공고를 매일 자동으로 수집합니다" },
          { icon: "🏷️", title: "AI 분류", desc: "AI·데이터·디지털 전환 관련 공고만 자동으로 분류합니다" },
          { icon: "🔔", title: "알림", desc: "관심 키워드 공고가 등록되면 바로 알려드립니다" },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border bg-muted/20 p-6 text-center">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-bold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
