import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.redirect(new URL("/unsubscribe?error=1", req.url));

  const { error } = await supabase
    .from("subscribers")
    .delete()
    .eq("email", email);

  if (error) return NextResponse.redirect(new URL("/unsubscribe?error=1", req.url));

  return NextResponse.redirect(new URL("/unsubscribe?done=1", req.url));
}
