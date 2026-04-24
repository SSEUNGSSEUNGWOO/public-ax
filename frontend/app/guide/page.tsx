import Link from "next/link";
import { getAllGuides, GuideImage } from "@/lib/guides";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, string> = {
  "AI 기초": "text-blue-600 dark:text-blue-400",
  "실무 활용": "text-emerald-600 dark:text-emerald-400",
  "기술 심화": "text-violet-600 dark:text-violet-400",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  "입문": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "기초": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "심화": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export const metadata = {
  title: "가이드 | PUBLIC-AX",
  description: "공공기관 실무자를 위한 AI 개념 및 활용 가이드",
};

export default async function GuidePage() {
  const guides = await getAllGuides();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => {
              const cover = (guide.images ?? []).find((img: GuideImage) => img.type === "cover");
              const colorClass = CATEGORY_COLORS[guide.category] ?? "text-primary";
              const difficulty = guide.difficulty;
              return (
                <Link
                  key={guide.slug}
                  href={`/guide/${guide.slug}`}
                  className="group flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-video bg-muted overflow-hidden">
                    {cover?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover.url}
                        alt={guide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className={`text-xs font-semibold uppercase tracking-widest ${colorClass} opacity-40`}>
                          {guide.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-widest ${colorClass}`}>
                        {guide.category}
                      </span>
                      {difficulty && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[difficulty] ?? "bg-muted text-muted-foreground"}`}>
                          {difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                      {guide.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {guide.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
