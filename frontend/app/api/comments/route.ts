import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const content_type = searchParams.get("content_type");
  const content_id = searchParams.get("content_id");

  if (!content_type || !content_id) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  try {
    const data = await db
      .select({
        id: comments.id,
        author_name: comments.authorName,
        body: comments.body,
        created_at: comments.createdAt,
      })
      .from(comments)
      .where(
        and(
          eq(comments.contentType, content_type),
          eq(comments.contentId, content_id)
        )
      )
      .orderBy(asc(comments.createdAt));

    return NextResponse.json({ comments: data });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { content_type, content_id, author_name, body } = await req.json();

  if (!content_type || !content_id || !body?.trim()) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const name = author_name?.trim() || "익명";

  try {
    const [inserted] = await db
      .insert(comments)
      .values({
        contentType: content_type,
        contentId: content_id,
        authorName: name,
        body: body.trim(),
      })
      .returning({
        id: comments.id,
        author_name: comments.authorName,
        body: comments.body,
        created_at: comments.createdAt,
      });

    return NextResponse.json({ comment: inserted });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
