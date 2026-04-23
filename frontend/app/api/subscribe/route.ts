import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "유효하지 않은 이메일입니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("subscribers")
    .insert({ email })
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "이미 구독 중입니다." });
    }
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }

  return NextResponse.json({ message: "구독 완료" });
}
