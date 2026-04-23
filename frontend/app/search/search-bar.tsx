"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const submit = (q: string) => {
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(query); }} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="공공 AI에 대해 무엇이든 검색하세요"
        className="w-full h-12 pl-5 pr-14 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
        autoFocus
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
      >
        검색
      </button>
    </form>
  );
}
