import Link from "next/link";
import { getAllInsights } from "@/lib/insights";
import { LinkButton } from "@/components/shared/link-button";
import { PageHeader } from "@/components/shared/page-header";

export default function InsightsPage() {
  const insights = getAllInsights();
  const [latest, ...rest] = insights;

  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <PageHeader
            eyebrow="Daily Report"
            title="인사이트"
            description="자는 사이 쌓인 AI 뉴스·기술·법안, 매일 아침 한 장으로"
            action={
              <LinkButton href="/insights/subscribe" variant="outline" size="sm">
                뉴스레터 구독
              </LinkButton>
            }
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">

      {insights.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">아직 리포트가 없습니다.</p>
      ) : (
        <>
          {/* 최신 리포트 히어로 */}
          <Link
            href={`/insights/${latest.slug}`}
            className="group block rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:bg-primary/10 transition-all duration-200 mb-12"
          >
            {latest.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={latest.image_url}
                alt={latest.title}
                className="w-full h-72 object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            )}
            <div className="p-7">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2 block">
                Latest · Daily Report
              </span>
              <h2 className="text-2xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors">
                {latest.title}
              </h2>
              <div className="flex items-center gap-3">
                <time className="text-sm text-muted-foreground">{latest.published_at}</time>
                <span className="text-sm text-muted-foreground/60">케이브레인 AI퍼블릭센터 · 장승우</span>
              </div>
            </div>
          </Link>

          {/* 이전 리포트 목록 */}
          {rest.length > 0 && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                이전 리포트
              </h3>
              <div className="flex flex-col gap-4">
                {rest.map((insight) => (
                  <Link
                    key={insight.slug}
                    href={`/insights/${insight.slug}`}
                    className="group flex gap-5 rounded-2xl border bg-card p-5 hover:shadow-md hover:bg-primary/10 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {insight.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={insight.image_url}
                        alt={insight.title}
                        className="w-36 h-24 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-500"
                      />
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
                        <span className="text-xs text-muted-foreground/60">케이브레인 AI퍼블릭센터 · 장승우</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
      </div>
    </div>
  );
}
