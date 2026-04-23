"use client";

import { useState } from "react";

export function ContentCta() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="mt-16 pt-10 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 오픈채팅 */}
      <a
        href="https://open.kakao.com/o/grNa0Iri"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-3 rounded-2xl border bg-card p-6 hover:shadow-md hover:bg-muted/40 transition-all duration-200"
      >
        <div className="w-10 h-10 rounded-xl bg-[#FEE500] flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E">
            <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.52 5.09 3.84 6.56L4.8 21l4.32-2.16c.92.24 1.89.36 2.88.36 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm mb-1">소통하고 싶다면</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            매일 AI 동향을 함께 나누는 오픈채팅 커뮤니티에 참여하세요.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#3C1E1E] bg-[#FEE500] rounded-lg px-3 py-1.5 self-start group-hover:bg-[#F5DC00] transition-colors">
          카카오톡 오픈채팅 →
        </span>
      </a>

      {/* 뉴스레터 */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm mb-1">매일 메일로 받고 싶다면</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            매일 아침 공공 AI 인사이트를 이메일로 받아보세요.
          </p>
        </div>
        {submitted ? (
          <div className="rounded-xl bg-primary/10 text-primary text-xs font-medium px-4 py-2.5 text-center">
            구독 신청 완료! 곧 첫 리포트를 보내드릴게요.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              required
              className="flex-1 h-9 px-3 rounded-xl border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex-shrink-0"
            >
              {loading ? "..." : "구독"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
