import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SUBSCRIBERS_PATH = join(
  process.cwd(),
  "../ai-service/insights/data/subscribers.json"
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "유효하지 않은 이메일입니다." }, { status: 400 });
  }

  try {
    const data = JSON.parse(readFileSync(SUBSCRIBERS_PATH, "utf-8"));
    if (data.subscribers.includes(email)) {
      return NextResponse.json({ message: "이미 구독 중입니다." });
    }
    data.subscribers.push(email);
    writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ message: "구독 완료" });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
