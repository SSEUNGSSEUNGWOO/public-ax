import { getAllGuides } from "@/lib/guides";
import { PageHeader } from "@/components/shared/page-header";
import { getCountsForType } from "@/lib/counts";
import { GuideList } from "@/components/guide/guide-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "가이드 | PUBLIC-AX",
  description: "공공기관 실무자를 위한 AI 개념·도구·활용법 정리. AI 기초부터 실무 활용, 기술 심화까지",
  openGraph: {
    title: "공공기관 AI 활용 가이드 | PUBLIC-AX",
    description: "AI 기초부터 실무 활용, 기술 심화까지 공공기관 실무자를 위한 AI 가이드",
    url: "https://public-ax.kr/guide",
  },
};

export default async function GuidePage() {
  const [guides, counts] = await Promise.all([getAllGuides(), getCountsForType("guide")]);

  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <PageHeader
            eyebrow="Guide"
            title="가이드"
            description="공공기관 AI 전환을 위한 개념·도구·활용법 정리"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {guides.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">준비 중입니다.</p>
        ) : (
          <GuideList guides={guides} counts={counts} />
        )}
      </div>
    </div>
  );
}
