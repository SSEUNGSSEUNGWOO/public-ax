import { PageHeader } from "@/components/shared/page-header";
import { ProcTabs } from "@/components/proc/proc-tabs";
import { ReportTab } from "@/components/proc/report-tab";
import { fetchAIBids } from "@/lib/g2b";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "K-AI PROC | PUBLIC-AI",
  description: "나라장터 AI·디지털전환·빅데이터 관련 공공 입찰공고 실시간 모니터링. D-day 마감 임박순 정렬 및 키워드 필터 제공",
  openGraph: {
    title: "공공 AI 조달 모니터링 K-AI PROC | PUBLIC-AI",
    description: "나라장터 AI·디지털전환·빅데이터 관련 공공 입찰공고 실시간 모니터링",
    url: "https://public-ax.kr/proc",
  },
};

export default async function ProcPage() {
  const bids = await fetchAIBids();

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
        <ProcTabs bids={bids} reportSlot={<ReportTab />} />
      </div>
    </div>
  );
}
