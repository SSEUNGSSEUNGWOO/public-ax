"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SearchBar } from "./search-bar";

interface Source {
  title: string;
  url: string;
  type: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setAnswer("");
    setSources([]);
    setLoading(true);

    const es = new EventSource(`/api/search-stream?q=${encodeURIComponent(query)}`);

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        es.close();
        setLoading(false);
        return;
      }
      try {
        const json = JSON.parse(e.data);
        if (json.sources) setSources(json.sources);
        if (json.text) setAnswer((prev) => prev + json.text);
      } catch {}
    };

    es.onerror = () => {
      es.close();
      setLoading(false);
    };

    return () => es.close();
  }, [query]);

  const insightSources = sources.filter((s) => s.type === "insight");
  const externalSources = sources.filter((s) => s.type === "raw");

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <SearchBar initialQuery={query} />

      {query && (
        <>
          <div className="mt-8 rounded-2xl border bg-primary/5 px-6 py-5 min-h-[100px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-4">AI 답변</p>
            {answer ? (
              <div className="prose prose-base prose-neutral dark:prose-invert max-w-none
                [&_strong]:text-foreground [&_strong]:font-semibold
                [&_p]:leading-7 [&_p]:mb-3 [&_p:last-child]:mb-0
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
                [&_ul]:my-2 [&_ul]:pl-4 [&_li]:my-0.5
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {answer}
                </ReactMarkdown>
                {loading && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />}
              </div>
            ) : (
              <div className="flex gap-1 items-center mt-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>

          {insightSources.length > 0 && (
            <div className="mt-8">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">관련 인사이트</p>
              <div className="flex flex-col gap-3">
                {insightSources.map((s, i) => (
                  <Link
                    key={i}
                    href={s.url}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-4 hover:shadow-md hover:bg-primary/5 transition-all duration-200"
                  >
                    <span className="text-primary text-base">↗</span>
                    <span className="text-base font-medium group-hover:text-primary transition-colors line-clamp-1">{s.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {externalSources.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">관련 외부 자료</p>
              <div className="flex flex-col gap-2">
                {externalSources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-muted-foreground/50">↗</span>
                    <span className="line-clamp-1 hover:underline underline-offset-2">{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
