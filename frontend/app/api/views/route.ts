import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guides, insights } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { type, slug } = await req.json();

  if (!type || !slug || !["guide", "insight"].includes(type)) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const table = type === "guide" ? guides : insights;

  const rows = await db
    .select({ views: table.views })
    .from(table)
    .where(eq(table.slug, slug))
    .limit(1);

  const newViews = (rows[0]?.views ?? 0) + 1;

  await db
    .update(table)
    .set({ views: newViews })
    .where(eq(table.slug, slug));

  return NextResponse.json({ views: newViews });
}
