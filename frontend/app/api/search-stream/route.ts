import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q") ?? "";
  if (!query.trim()) return new Response("no query", { status: 400 });

  const embRes = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  const embedding = embRes.data[0].embedding;
  const result = await db.execute(
    sql`SELECT content, type, metadata,
            1 - (embedding <=> ${JSON.stringify(embedding)}::vector) AS similarity,
            ts_rank(to_tsvector('simple', content), plainto_tsquery('simple', ${query})) AS text_rank
        FROM documents
        WHERE embedding IS NOT NULL
        ORDER BY (1 - (embedding <=> ${JSON.stringify(embedding)}::vector)) * 0.7
               + ts_rank(to_tsvector('simple', content), plainto_tsquery('simple', ${query})) * 0.3 DESC
        LIMIT 8`
  );
  interface DocRow {
    content: string;
    type: string;
    metadata: Record<string, string>;
    similarity: number;
    text_rank: number;
  }
  const docs = (result.rows ?? []) as unknown as DocRow[];

  const priority = ["site_info", "insight", "guide", "raw"];
  const sorted = [...docs].sort(
    (a, b) => priority.indexOf(a.type) - priority.indexOf(b.type)
  );

  const context = sorted.map((d) => d.content).join("\n\n---\n\n");

  const seen = new Set<string>();
  const sources = sorted
    .filter((d) => d.metadata?.slug || d.metadata?.url)
    .filter((d) => {
      const key = d.metadata?.slug || d.metadata?.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((d) => ({
      title: d.metadata?.title || d.metadata?.slug || d.metadata?.url || "",
      url: d.metadata?.slug ? `/insights/${d.metadata.slug}` : d.metadata?.url ?? "",
      type: d.type,
    }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 소스 먼저 전송
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`));

      const response = await getAnthropic().messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        system: `당신은 PUBLIC-AI의 공공 AI 전환 검색 어시스턴트입니다.
아래 컨텍스트를 바탕으로 질문에 3-4문장으로 간결하게 답하세요.
컨텍스트에 없는 내용은 모른다고 하세요. 한국어로 답하세요.

<context>
${context}
</context>`,
        messages: [{ role: "user", content: query }],
      });

      for await (const chunk of response) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
        }
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
