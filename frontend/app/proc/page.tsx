import { PageHeader } from "@/components/shared/page-header";
import { ProcList } from "@/components/proc/proc-list";
import { fetchAIBids, fetchThisMonthCount } from "@/lib/g2b";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "K-AI PROC | PUBLIC-AX",
  description: "나라장터 AI·디지털전환·빅데이터 관련 공공 입찰공고 실시간 모니터링. D-day 마감 임박순 정렬 및 키워드 필터 제공",
  openGraph: {
    title: "공공 AI 조달 모니터링 K-AI PROC | PUBLIC-AX",
    description: "나라장터 AI·디지털전환·빅데이터 관련 공공 입찰공고 실시간 모니터링",
    url: "https://public-ax.kr/proc",
  },
};

export default async function ProcPage() {
  const [bids, thisMonthCount] = await Promise.all([
    fetchAIBids(),
    fetchThisMonthCount(),
  ]);

  const now = new Date();
  const urgentCount = bids.filter((b) => {
    if (!b.bidClseDate) return false;
    const close = new Date(b.bidClseDate);
    const diff = Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;

  const totalBudget = bids.reduce((sum, b) => sum + parseInt(b.asignBdgtAmt || b.presmptPrce || "0"), 0);

  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <PageHeader
            eyebrow="G2B 나라장터"
            title="정부 AI 공고"
            description="AI·빅데이터·디지털전환 관련 입찰공고를 실시간으로 모니터링합니다"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <ProcList
          bids={bids}
          stats={{
            active: bids.length,
            thisMonth: thisMonthCount,
            totalBudget,
            urgent: urgentCount,
          }}
        />
      </div>
    </div>
  );
}
