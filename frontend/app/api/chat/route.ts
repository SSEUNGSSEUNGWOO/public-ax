import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embedQuery(query: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  return res.data[0].embedding;
}

async function searchDocuments(embedding: number[]) {
  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: 10,
  });
  return (data ?? []) as { content: string; type: string; metadata: Record<string, string>; similarity: number }[];
}

function buildContext(docs: { content: string; type: string; metadata: Record<string, string>; similarity: number }[]) {
  const priority = ["site_info", "insight", "guide", "raw"];
  const sorted = [...docs].sort(
    (a, b) => priority.indexOf(a.type) - priority.indexOf(b.type)
  );

  const parts = sorted.map((d) => {
    const source = d.metadata?.slug
      ? `[출처: /insights/${d.metadata.slug}]`
      : d.metadata?.url
      ? `[출처: ${d.metadata.url}]`
      : "";
    return `${d.content}\n${source}`;
  });

  return parts.join("\n\n---\n\n");
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "메시지가 없습니다." }, { status: 400 });
  }

  const embedding = await embedQuery(message);
  const docs = await searchDocuments(embedding);
  const context = buildContext(docs);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `당신은 PUBLIC-AX의 공공 AI 전환 어시스턴트입니다.
아래 컨텍스트를 바탕으로 질문에 답하세요. 컨텍스트에 없는 내용은 모른다고 하세요.
출처가 있으면 답변 마지막에 관련 링크를 제시하세요.
한국어로 간결하게 답변하세요.

<context>
${context}
</context>`,
    messages: [{ role: "user", content: message }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  const sources = docs
    .filter((d) => d.metadata?.slug || d.metadata?.url)
    .slice(0, 3)
    .map((d) => ({
      title: d.metadata?.title || d.metadata?.slug || d.metadata?.url,
      url: d.metadata?.slug ? `/insights/${d.metadata.slug}` : d.metadata?.url,
      type: d.type,
    }));

  return NextResponse.json({ answer: text, sources });
}
