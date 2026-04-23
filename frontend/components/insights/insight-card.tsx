import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface InsightCardProps {
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  publishedAt?: string;
  sourceCount?: number;
  likeCount?: number;
  commentCount?: number;
}

export function InsightCard({
  slug,
  title,
  summary,
  coverImage,
  publishedAt,
  sourceCount,
  likeCount,
  commentCount,
}: InsightCardProps) {
  return (
    <Link href={`/insights/${slug}`} className="group">
      <Card className="overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-muted-foreground/40"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2 block">
            Daily Report
          </span>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          {summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
              {summary}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            {publishedAt && <time>{publishedAt}</time>}
            {sourceCount !== undefined && sourceCount > 0 && (
              <>
                <span>·</span>
                <span>{sourceCount}개 데이터 분석</span>
              </>
            )}
            {(likeCount !== undefined && likeCount > 0) && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {likeCount}
                </span>
              </>
            )}
            {(commentCount !== undefined && commentCount > 0) && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {commentCount}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
