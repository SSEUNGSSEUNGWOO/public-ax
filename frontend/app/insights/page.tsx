import Link from "next/link";
import Image from "next/image";
import { getAllInsights } from "@/lib/insights";
import { LinkButton } from "@/components/shared/link-button";

export default function InsightsPage() {
  const insights = getAllInsights();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-1">Insights</h1>
          <p className="text-muted-foreground text-sm">공공 AI 동향 일일 리포트</p>
        </div>
        <LinkButton href="/insights/subscribe" variant="outline" size="sm">
          뉴스레터 구독
        </LinkButton>
      </div>

      {insights.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">아직 리포트가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {insights.map((insight) => (
            <Link
              key={insight.slug}
              href={`/insights/${insight.slug}`}
              className="group flex gap-5 rounded-2xl border bg-card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              {insight.image_url && (
                <div className="relative w-36 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={insight.image_url}
                    alt={insight.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="144px"
                  />
                </div>
              )}
              <div className="flex flex-col justify-between min-w-0">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1.5 block">
                    Daily Report
                  </span>
                  <h2 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {insight.title}
                  </h2>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <time className="text-xs text-muted-foreground">{insight.published_at}</time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
