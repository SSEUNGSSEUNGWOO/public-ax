import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { likes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const content_type = searchParams.get("content_type");
  const content_id = searchParams.get("content_id");

  if (!content_type || !content_id) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(likes)
    .where(
      and(
        eq(likes.contentType, content_type),
        eq(likes.contentId, content_id)
      )
    );

  return NextResponse.json({ count: result?.count ?? 0 });
}

export async function POST(req: NextRequest) {
  const { content_type, content_id } = await req.json();

  if (!content_type || !content_id) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  try {
    await db.insert(likes).values({
      contentType: content_type,
      contentId: content_id,
      userFingerprint: crypto.randomUUID(),
    });
  } catch (error) {
    console.error("likes insert error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(likes)
    .where(
      and(
        eq(likes.contentType, content_type),
        eq(likes.contentId, content_id)
      )
    );

  return NextResponse.json({ count: result?.count ?? 0 });
}
