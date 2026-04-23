import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChampionCardProps {
  slug: string;
  name: string;
  title?: string;
  affiliation?: string;
  bio?: string;
  photoUrl?: string;
  yearAwarded?: number;
  domain?: string[];
}

export function ChampionCard({
  slug,
  name,
  title,
  affiliation,
  bio,
  photoUrl,
  yearAwarded,
  domain,
}: ChampionCardProps) {
  return (
    <Link href={`/champions/${slug}`} className="group">
      <Card className="relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <CardContent className="relative p-6 pt-8 text-center">
          <Avatar className="w-16 h-16 mx-auto mb-4 ring-2 ring-background shadow-md">
            <AvatarImage src={photoUrl} alt={name} />
            <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
              {name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg mb-0.5 group-hover:text-primary transition-colors">
            {name}
          </h3>
          {(title || affiliation) && (
            <p className="text-sm text-muted-foreground mb-3">
              {title}
              {title && affiliation && " · "}
              {affiliation}
            </p>
          )}
          {bio && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-4 leading-relaxed">
              {bio}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {domain?.map((d) => (
              <Badge key={d} variant="secondary" className="text-xs font-normal rounded-full px-2.5">
                {d}
              </Badge>
            ))}
            {yearAwarded && (
              <Badge variant="outline" className="text-xs font-normal rounded-full px-2.5">
                {yearAwarded}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
