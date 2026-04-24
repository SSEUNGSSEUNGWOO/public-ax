import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getInsightBySlug, getAllInsights } from "@/lib/insights";
import { TableOfContents } from "@/components/insights/toc";
import { ContentCta } from "@/components/shared/content-cta";
import { LikeButton } from "@/components/shared/like-button";
import { ViewTracker } from "@/components/shared/view-tracker";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://public-ax.kr";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);
  if (!insight) return {};

  const description = insight.body
    .replace(/[#*`>\[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 160);

  const url = `${SITE_URL}/insights/${insight.slug}`;

  return {
    title: insight.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: insight.title,
      description,
      publishedTime: insight.published_at,
      siteName: "PUBLIC-AX",
      locale: "ko_KR",
      images: [{ url: insight.image_url || `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: insight.title,
      description,
      images: [insight.image_url || `${SITE_URL}/og-image.png`],
    },
  };
}

function slugify(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w가-힣-]/g, "");
}

function extractToc(body: string) {
  const items: { id: string; text: string; level: number; index?: number }[] = [];
  let sectionIndex = 0;
  for (const line of body.split("\n")) {
    const h = line.match(/^(#{2,3})\s+(.+)/);
    if (h) {
      items.push({ id: slugify(h[2].trim()), text: h[2].trim(), level: h[1].length });
    }
    const listH3 = line.match(/^(\d+)\.\s+###\s+(.+)/);
    if (listH3) {
      sectionIndex++;
      items.push({ id: slugify(listH3[2].trim()), text: listH3[2].trim(), level: 3, index: sectionIndex });
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
  const insight = await getInsightBySlug(slug);
  if (!insight) notFound();

  const cleanBody = insight.body
    .replace(/^#[^\n]*\n+/, "")
    .replace(/^\*\*\d{4}-\d{2}-\d{2}\*\*\n*/m, "")
    .replace(/^\*\*리포트 날짜:[^\n]*\*\*\n*/m, "")
    .replace(/^\*\*[^\n]*인사이트[^\n]*\*\*\n*/m, "")
    .replace(/\n*---\n+\*?본 리포트는[^\n]*\*?\n*/g, "")
    .replace(/\n*>\s*\*\*오늘의 한 줄 요약[^\n]*\n*/g, "")
    .replace(/^---\n+/, "");

  const tocItems = [
    { id: "top", text: "제목", level: 2 },
    ...extractToc(cleanBody),
    ...(insight.sources.length > 0 ? [{ id: "sources", text: "참고 출처", level: 2 }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.body.replace(/[#*`>\[\]]/g, "").replace(/\n+/g, " ").trim().slice(0, 160),
    datePublished: insight.published_at,
    dateModified: insight.published_at,
    author: { "@type": "Organization", name: "케이브레인 AI퍼블릭센터" },
    publisher: { "@type": "Organization", name: "PUBLIC-AX", url: `${SITE_URL}` },
    url: `${SITE_URL}/insights/${insight.slug}`,
    ...(insight.image_url ? { image: insight.image_url } : {}),
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <ViewTracker type="insight" slug={insight.slug} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-16">
        <div className="min-w-0">
          {insight.image_url && <img src={insight.image_url} alt={insight.title} className="rounded-2xl w-full h-auto mb-8" />}

          <div className="mb-8">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-3 block">Daily Report</span>
            <h1 className="text-3xl font-bold leading-tight mb-4">{insight.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-6">
              <p className="text-sm text-muted-foreground">AI 동향 일일 리포트 — {insight.published_at}</p>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground/70">케이브레인 AI퍼블릭센터 · 장승우</p>
                <span className="text-xs text-muted-foreground/60">조회 {insight.views ?? 0}회</span>
              </div>
            </div>
          </div>

          <article className="prose prose-neutral dark:prose-invert max-w-none [&_p>strong:only-child]:text-lg [&_p>strong:only-child]:block [&_li>p:first-child]:mt-0 [&_li>p:first-child]:mb-0 [&_li>p:not(:first-child)]:mt-4 [&_li>p]:leading-7 [&_ol>li>h3]:text-primary [&_ol>li>h3]:text-xl [&_ol>li>h3]:font-bold [&_ol>li>h3]:mt-0 [&_ol>li>h3]:mb-2 [&_ol>li>h3]:tracking-tight [&_ol>li::marker]:text-primary [&_ol>li::marker]:text-xl [&_ol>li::marker]:font-bold [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-3 [&_h2]:text-2xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => <h2 id={slugify(String(children))} className="scroll-mt-24">{children}</h2>,
                h3: ({ children }) => <h3 id={slugify(String(children))} className="scroll-mt-24">{children}</h3>,
                img: ({ src, alt }) => <img src={src} alt={alt ?? ""} className="rounded-xl w-full h-auto my-4" />,
                hr: () => <hr className="my-8 border-t border-border" />,
              }}
            >
              {cleanBody}
            </ReactMarkdown>
          </article>

          {insight.sources.length > 0 && (
            <div id="sources" className="mt-12 pt-8 border-t scroll-mt-24">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">참고 출처</h2>
              <ul className="space-y-2">
                {insight.sources.map((source) => (
                  <li key={source.url} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">↗</span>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-primary line-clamp-1">
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

          <div className="lg:hidden flex justify-center mt-8">
            <LikeButton contentType="insight" contentId={insight.slug} />
          </div>

          <ContentCta />
        </div>

        <aside className="hidden lg:block">
          <TableOfContents items={tocItems} likeContentType="insight" likeContentId={insight.slug} />
        </aside>
      </div>
    </div>
    </>
  );
}
