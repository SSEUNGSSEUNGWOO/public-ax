import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getGuideBySlug, getAllGuides, GuideVideo } from "@/lib/guides";
import { ContentCta } from "@/components/shared/content-cta";

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://public-ax.kr";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};

  const url = `${SITE_URL}/guide/${guide.slug}`;
  return {
    title: `${guide.title} | PUBLIC-AX 가이드`,
    description: guide.summary,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: guide.title, description: guide.summary, siteName: "PUBLIC-AX", locale: "ko_KR" },
    twitter: { card: "summary", title: guide.title, description: guide.summary },
  };
}

function slugify(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w가-힣-]/g, "");
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const allGuides = await getAllGuides();
  const related = allGuides.filter((g) => g.slug !== guide.slug && g.category === guide.category).slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      {guide.image_cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={guide.image_cover} alt={guide.title} className="w-full h-64 object-cover rounded-2xl mb-8" />
      )}

      <div className="mb-8">
        <Link href="/guide" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-6">
          ← 가이드 목록
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">{guide.category}</span>
        </div>

        <h1 className="text-3xl font-bold leading-tight mb-3">{guide.title}</h1>
        <p className="text-muted-foreground">{guide.summary}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {guide.tags.map((tag) => (
            <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <hr className="border-border mb-10" />

      <article className="prose prose-neutral dark:prose-invert max-w-none [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-3 [&_h2]:text-2xl [&_h3]:text-lg [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-muted [&_pre]:rounded-xl [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:border [&_table]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 [&_td]:border-t [&_td]:border-border">
        {(() => {
          // ## 기준으로 섹션 분리
          const sections = guide.body.split(/(?=^## )/m);
          const mdProps = {
            remarkPlugins: [remarkGfm] as [typeof remarkGfm],
            components: {
              h2: ({ children }: { children: React.ReactNode }) => <h2 id={slugify(String(children))} className="scroll-mt-24">{children}</h2>,
              h3: ({ children }: { children: React.ReactNode }) => <h3 id={slugify(String(children))} className="scroll-mt-24">{children}</h3>,
            },
          };

          // 활용 관련 섹션 인덱스 찾기
          const exampleIdx = sections.findIndex(s => /활용|예시|사례|적용/.test(s));
          const diagramAt = Math.min(2, sections.length - 1);
          const exampleAt = exampleIdx > 0 ? exampleIdx : Math.min(4, sections.length - 1);

          return sections.map((section, i) => (
            <div key={i}>
              <ReactMarkdown {...mdProps}>{section}</ReactMarkdown>
              {i === diagramAt && guide.image_diagram && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={guide.image_diagram} alt="개념 다이어그램" className="w-full rounded-xl my-6 not-prose" />
              )}
              {i === exampleAt && i !== diagramAt && guide.image_example && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={guide.image_example} alt="활용 예시" className="w-full rounded-xl my-6 not-prose" />
              )}
            </div>
          ));
        })()}
      </article>

      {guide.videos && guide.videos.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">참고 영상</h2>
          <div className="flex flex-col gap-3">
            {guide.videos.map((v: GuideVideo) => (
              <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border bg-card p-4 hover:shadow-md hover:bg-primary/5 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{v.channel}</p>
                </div>
                <span className="text-muted-foreground/40 text-xs ml-auto flex-shrink-0 mt-1">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <ContentCta />

      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">관련 가이드</h2>
          <div className="flex flex-col gap-3">
            {related.map((g) => (
              <Link key={g.slug} href={`/guide/${g.slug}`}
                className="group flex flex-col rounded-2xl border bg-card p-4 hover:shadow-md hover:bg-primary/5 transition-all duration-200"
              >
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{g.title}</span>
                <span className="text-xs text-muted-foreground mt-1 line-clamp-1">{g.summary}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
