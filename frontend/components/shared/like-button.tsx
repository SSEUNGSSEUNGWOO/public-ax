"use client";

import { useEffect, useRef, useState } from "react";

interface LikeButtonProps {
  contentType: "insight" | "guide";
  contentId: string;
}

interface FloatingHeart {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export function LikeButton({ contentType, contentId }: LikeButtonProps) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const counter = useRef(0);
  const sessionKey = `liked_${contentType}_${contentId}`;

  useEffect(() => {
    fetch(`/api/likes?content_type=${contentType}&content_id=${contentId}`)
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0));
    setLiked(!!sessionStorage.getItem(sessionKey));
  }, [contentType, contentId, sessionKey]);

  async function press() {
    setCount((c) => c + 1);
    setLiked(true);
    sessionStorage.setItem(sessionKey, "1");

    const newHearts: FloatingHeart[] = Array.from({ length: 5 }, () => ({
      id: counter.current++,
      x: Math.random() * 70 - 35,
      size: 10 + Math.random() * 10,
      duration: 700 + Math.random() * 500,
      delay: Math.random() * 200,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.find((n) => n.id === h.id)));
    }, 1200);

    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: contentType, content_id: contentId }),
    });
    const data = await res.json();
    if (!data.error) setCount(data.count);
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <style>{`
          @keyframes floatHeart {
            0%   { opacity: 1; transform: translateY(0) scale(1); }
            80%  { opacity: 0.6; }
            100% { opacity: 0; transform: translateY(-60px) scale(0.5); }
          }
        `}</style>

        {hearts.map((h) => (
          <span
            key={h.id}
            className="pointer-events-none absolute bottom-full"
            style={{
              left: `calc(50% + ${h.x}px)`,
              animation: `floatHeart ${h.duration}ms ease-out ${h.delay}ms forwards`,
              opacity: 0,
            }}
          >
            <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill="#ef4444">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
        ))}

        <button
          onClick={press}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors duration-200 ${
            liked
              ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/15"
              : "bg-muted/50 border-border hover:bg-red-500/10 hover:border-red-500/30"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? "#ef4444" : "none"}
            stroke={liked ? "#ef4444" : "currentColor"}
            strokeWidth="2"
            className="transition-colors duration-150 flex-shrink-0"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className={`text-sm font-medium transition-colors duration-150 ${liked ? "text-red-500" : "text-muted-foreground"}`}>
            좋아요
          </span>
        </button>
      </div>

      {count > 0 && (
        <span className="text-xs text-muted-foreground/70">{count}개의 관심을 받았습니다</span>
      )}
    </div>
  );
}
