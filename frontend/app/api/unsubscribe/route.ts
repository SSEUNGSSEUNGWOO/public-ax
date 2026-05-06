import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.redirect(new URL("/unsubscribe?error=1", req.url));

  try {
    await db.delete(subscribers).where(eq(subscribers.email, email));
  } catch {
    return NextResponse.redirect(new URL("/unsubscribe?error=1", req.url));
  }

  return NextResponse.redirect(new URL("/unsubscribe?done=1", req.url));
}
