import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { type, slug } = await req.json();

  if (!type || !slug || !["guide", "insight"].includes(type)) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const table = type === "guide" ? "guides" : "insights";

  const { data: row } = await supabase
    .from(table)
    .select("views")
    .eq("slug", slug)
    .single();

  const newViews = (row?.views ?? 0) + 1;

  await supabase
    .from(table)
    .update({ views: newViews })
    .eq("slug", slug);

  return NextResponse.json({ views: newViews });
}
