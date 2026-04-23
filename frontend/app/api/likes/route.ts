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

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("content_type", content_type)
    .eq("content_id", content_id);

  return NextResponse.json({ count: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const { content_type, content_id } = await req.json();

  if (!content_type || !content_id) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const { error } = await supabase
    .from("likes")
    .insert({ content_type, content_id, user_fingerprint: crypto.randomUUID() });

  if (error) {
    console.error("likes insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("content_type", content_type)
    .eq("content_id", content_id);

  return NextResponse.json({ count: count ?? 0 });
}
