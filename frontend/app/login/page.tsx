import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-primary mb-3">PUBLIC-AI</p>
        <h1 className="text-2xl font-bold mb-4">로그인</h1>
        <div className="rounded-2xl border bg-card p-8">
          <p className="text-muted-foreground text-sm mb-6">
            로그인 기능 준비 중입니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-sm font-medium border hover:bg-muted/50 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
