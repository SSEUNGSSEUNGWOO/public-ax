import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "PUBLIC-AX <onboarding@resend.dev>",
    to: email,
    subject: "PUBLIC-AX 뉴스레터 구독을 환영합니다 🎉",
    html: `
      <div style="max-width:560px;margin:0 auto;font-family:-apple-system,sans-serif;color:#111;">
        <div style="padding:40px 0 24px;">
          <p style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#6b7280;margin:0 0 16px;">PUBLIC-AX</p>
          <h1 style="font-size:24px;font-weight:700;margin:0 0 12px;line-height:1.3;">구독해 주셔서 감사합니다</h1>
          <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
            매일 아침, 공공 AI 전환에 꼭 필요한 인사이트를 이메일로 보내드릴게요.<br/>
            하루가 다르게 바뀌는 AI 동향을 공공 맥락에서 해석한 리포트입니다.
          </p>
          <a href="https://public-ax.vercel.app/insights" style="display:inline-block;background:#111;color:#fff;font-size:13px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
            최근 인사이트 보기 →
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 24px;"/>
        <p style="font-size:12px;color:#9ca3af;margin:0;">
          케이브레인 AI퍼블릭센터 · PUBLIC-AX<br/>
          <a href="https://public-ax.vercel.app/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#9ca3af;">구독 취소</a>
        </p>
      </div>
    `,
  });

  return NextResponse.json({ message: "구독 완료" });
}
