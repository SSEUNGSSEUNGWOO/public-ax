import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const content_type = searchParams.get("content_type");
  const content_id = searchParams.get("content_id");

  if (!content_type || !content_id) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("content_type", content_type)
    .eq("content_id", content_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

  return NextResponse.json({ comments: data });
}

export async function POST(req: NextRequest) {
  const { content_type, content_id, author_name, body } = await req.json();

  if (!content_type || !content_id || !body?.trim()) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const name = author_name?.trim() || "익명";

  const { data, error } = await supabase
    .from("comments")
    .insert({ content_type, content_id, author_name: name, body: body.trim() })
    .select("id, author_name, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

  return NextResponse.json({ comment: data });
}
