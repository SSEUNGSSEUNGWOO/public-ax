import { notFound } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getInsightBySlug, getAllInsights } from "@/lib/insights";
import { TableOfContents } from "@/components/insights/toc";

export async function generateStaticParams() {
  return getAllInsights().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) return {};
  return {
    title: insight.title,
    description: insight.body.slice(0, 150).replace(/[#*\n]/g, " ").trim(),
  };
}

function slugify(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w가-힣-]/g, "");
}

function extractToc(body: string) {
  const items: { id: string; text: string; level: number }[] = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^(#{2,3})\s+(.+)/);
    if (m) {
      const text = m[2].trim();
      items.push({ id: slugify(text), text, level: m[1].length });
    }
  }
  return items;
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) notFound();

  const cleanBody = insight.body
    .replace(/^#[^\n]*\n+/, "")
    .replace(/^\*\*리포트 날짜:[^\n]*\*\*\n*/m, "")
    .replace(/^\*\*[^\n]*인사이트[^\n]*\*\*\n*/m, "")
    .replace(/\n*---\n+\*?본 리포트는[^\n]*\*?\n*/g, "")
    .replace(/\n*>\s*\*\*오늘의 한 줄 요약[^\n]*\n*/g, "")
    .replace(/^---\n+/, "");

  const tocItems = [
    ...extractToc(cleanBody),
    ...(insight.sources.length > 0 ? [{ id: "sources", text: "참고 출처", level: 2 }] : []),
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-16">
        {/* 본문 */}
        <div className="min-w-0">
          {insight.image_url && (
            <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-8">
              <Image
                src={insight.image_url}
                alt={insight.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                unoptimized
              />
            </div>
          )}

          <div className="mb-8">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-3 block">
              Daily Report
            </span>
            <h1 className="text-3xl font-bold leading-tight mb-4">{insight.title}</h1>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                AI 동향 일일 리포트 — {insight.published_at}
              </p>
              <p className="text-sm text-muted-foreground/70">
                케이브레인 AI퍼블릭센터 · 장승우
              </p>
            </div>
          </div>

          <article className="prose prose-neutral dark:prose-invert max-w-none [&_p>strong:only-child]:text-lg [&_p>strong:only-child]:block">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const text = String(children);
                  return <h2 id={slugify(text)} className="scroll-mt-24">{children}</h2>;
                },
                h3: ({ children }) => {
                  const text = String(children);
                  return <h3 id={slugify(text)} className="scroll-mt-24">{children}</h3>;
                },
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={alt ?? ""}
                    className="rounded-xl w-full object-cover max-h-64 my-4"
                  />
                ),
                hr: () => (
                  <hr className="my-8 border-t border-border" />
                ),
              }}
            >
              {cleanBody}
            </ReactMarkdown>
          </article>

          {insight.sources.length > 0 && (
            <div id="sources" className="mt-12 pt-8 border-t scroll-mt-24">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                참고 출처
              </h2>
              <ul className="space-y-2">
                {insight.sources.map((source) => (
                  <li key={source.url} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">↗</span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-primary line-clamp-1"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              본 리포트는 {insight.published_at} 수집 데이터 기준이며, 에디터 코멘트는 공공 AI 전환 맥락에서의 해석을 포함합니다.
            </p>
          </div>
        </div>

        {/* TOC 사이드바 */}
        <aside className="hidden lg:block">
          <TableOfContents items={tocItems} />
        </aside>
      </div>
    </div>
  );
}
