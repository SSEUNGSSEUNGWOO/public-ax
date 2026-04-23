"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function loginWithKakao() {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-primary mb-3">PUBLIC-AX</p>
          <h1 className="text-2xl font-bold mb-2">로그인</h1>
          <p className="text-sm text-muted-foreground">공공 AI 전환 커뮤니티에 참여하세요</p>
        </div>

        <div className="rounded-2xl border bg-card p-8 flex flex-col gap-3">
          <button
            onClick={loginWithKakao}
            className="flex items-center justify-center gap-3 w-full h-11 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "#FEE500", color: "#3C1E1E" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.52 5.09 3.84 6.56L4.8 21l4.32-2.16c.92.24 1.89.36 2.88.36 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
            </svg>
            카카오로 계속하기
          </button>
          <button
            onClick={loginWithGoogle}
            className="flex items-center justify-center gap-3 w-full h-11 rounded-xl border bg-background text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
