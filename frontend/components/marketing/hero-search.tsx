"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const suggestions = ["RAG 기반 민원 챗봇", "의료 AI 판독 시스템", "나라장터 AI 공고"];

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const submit = (q: string) => {
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="w-full max-w-sm md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto">
      <p className="text-white/70 text-xs text-center mb-3 tracking-wide">
        AI 챔피언, 포트폴리오, 조달 공고를 검색하세요
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(query); }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 서울시 AI 민원 챗봇, 의료 AI 판독..."
          autoComplete="off"
          className="w-full rounded-full px-6 py-4 pr-14 text-sm outline-none placeholder-white/40"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)",
            border: "2px solid rgba(255,255,255,0.7)",
            color: "#fff",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: "oklch(0.68 0.18 50)" }}
        >
          <span className="text-white text-sm font-bold">→</span>
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
