"use client";

import { useEffect, useState } from "react";
import { LikeButton } from "@/components/shared/like-button";

interface TocItem {
  id: string;
  text: string;
  level: number;
  index?: number;
}

export function TableOfContents({ items, likeContentType, likeContentId }: {
  items: TocItem[];
  likeContentType?: "insight" | "guide";
  likeContentId?: string;
}) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0% -70% 0%" }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-24 space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        목차
      </p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            if (item.id === "top") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className={`block text-sm leading-snug py-0.5 border-l-2 transition-colors ${
            item.level === 3
              ? "pl-6 text-xs"
              : "pl-3"
          } ${
            active === item.id
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.level === 3 && item.index !== undefined
            ? `${item.index}. ${item.text}`
            : item.text}
        </a>
      ))}
      {likeContentType && likeContentId && (
        <div className="pt-6 flex justify-center">
          <LikeButton contentType={likeContentType} contentId={likeContentId} />
        </div>
      )}
    </div>
  );
}
