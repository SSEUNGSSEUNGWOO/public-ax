import { getAllInsights } from "@/lib/insights";
import { getCountsForType } from "@/lib/counts";
import { PageHeader } from "@/components/shared/page-header";
import { InsightList } from "@/components/insights/insight-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "인사이트 | PUBLIC-AX",
  description: "자는 사이 쌓인 AI 뉴스·기술·법안, 매일 아침 한 장으로. 공공기관 실무자를 위한 AI 동향 데일리 리포트",
  openGraph: {
    title: "AI 인사이트 데일리 리포트 | PUBLIC-AX",
    description: "자는 사이 쌓인 AI 뉴스·기술·법안, 매일 아침 한 장으로",
    url: "https://public-ax.kr/insights",
  },
};

export default async function InsightsPage() {
  const [insights, counts] = await Promise.all([
    getAllInsights(),
    getCountsForType("insight"),
  ]);

  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <PageHeader
            eyebrow="Daily Report"
            title="인사이트"
            description="자는 사이 쌓인 AI 뉴스·기술·법안, 매일 아침 한 장으로"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">아직 리포트가 없습니다.</p>
        ) : (
          <InsightList insights={insights} counts={counts} />
        )}
      </div>
    </div>
  );
}
