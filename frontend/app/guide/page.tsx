import Link from "next/link";
import { getAllGuides } from "@/lib/guides";
import { PageHeader } from "@/components/shared/page-header";

const CATEGORY_COLORS: Record<string, string> = {
  "AI 기초": "text-blue-600 dark:text-blue-400",
  "실무 활용": "text-emerald-600 dark:text-emerald-400",
  "기술 심화": "text-violet-600 dark:text-violet-400",
};

export const metadata = {
  title: "가이드 | PUBLIC-AX",
  description: "공공기관 실무자를 위한 AI 개념 및 활용 가이드",
};

export default function GuidePage() {
  const guides = getAllGuides();

  const categories = Array.from(new Set(guides.map((g) => g.category)));

  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <PageHeader
            eyebrow="Guide"
            title="가이드"
            description="공공기관 실무자를 위한 AI 개념 및 활용법"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
      {guides.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">
          준비 중입니다.
        </p>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryGuides = guides.filter((g) => g.category === category);
            const colorClass = CATEGORY_COLORS[category] ?? "text-primary";
            return (
              <section key={category}>
                <h2
                  className={`text-xs font-semibold uppercase tracking-widest mb-4 ${colorClass}`}
                >
                  {category}
                </h2>
                <div className="flex flex-col gap-3">
                  {categoryGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/guide/${guide.slug}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border bg-card p-5 hover:shadow-md hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors mb-1">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {guide.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {guide.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
