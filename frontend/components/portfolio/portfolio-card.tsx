import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PortfolioCardProps {
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  techStack?: string[];
  championName?: string;
}

export function PortfolioCard({
  slug,
  title,
  summary,
  coverImage,
  techStack,
  championName,
}: PortfolioCardProps) {
  return (
    <Link href={`/portfolio/${slug}`} className="group">
      <Card className="overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-primary/60"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {techStack?.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs font-normal rounded-full px-2.5">
                {tech}
              </Badge>
            ))}
          </div>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          {summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
              {summary}
            </p>
          )}
          {championName && (
            <p className="text-xs text-muted-foreground/70">by {championName}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
