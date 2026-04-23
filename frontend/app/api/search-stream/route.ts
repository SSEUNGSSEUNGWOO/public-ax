import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q") ?? "";
  if (!query.trim()) return new Response("no query", { status: 400 });

  const embRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  const { data: docs } = await supabase.rpc("hybrid_search", {
    query_text: query,
    query_embedding: embRes.data[0].embedding,
    match_count: 8,
  });

  const priority = ["site_info", "insight", "guide", "raw"];
  const sorted = [...(docs ?? [])].sort(
    (a: { type: string }, b: { type: string }) => priority.indexOf(a.type) - priority.indexOf(b.type)
  );

  const context = sorted.map((d: { content: string }) => d.content).join("\n\n---\n\n");

  const seen = new Set<string>();
  const sources = sorted
    .filter((d: { metadata: Record<string, string>; type: string }) => d.metadata?.slug || d.metadata?.url)
    .filter((d: { metadata: Record<string, string> }) => {
      const key = d.metadata?.slug || d.metadata?.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((d: { metadata: Record<string, string>; type: string }) => ({
      title: d.metadata?.title || d.metadata?.slug || d.metadata?.url || "",
      url: d.metadata?.slug ? `/insights/${d.metadata.slug}` : d.metadata?.url ?? "",
      type: d.type,
    }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 소스 먼저 전송
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`));

      const response = await anthropic.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        system: `당신은 PUBLIC-AX의 공공 AI 전환 검색 어시스턴트입니다.
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
