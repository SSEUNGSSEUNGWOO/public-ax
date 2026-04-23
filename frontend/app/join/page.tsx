"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";

export default function JoinPage() {
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
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <PageHeader
            eyebrow="Community"
            title="공공 AI 생태계에 참여하세요"
            description="챔피언들과 실무자, 기업이 함께 만들어가는 커뮤니티입니다. 최신 AI 동향을 나누고, 현장의 경험을 공유하세요."
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-3xl">

      {/* 카카오톡 오픈채팅 */}
      <div className="rounded-2xl border bg-card p-8 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEE500] flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.52 5.09 3.84 6.56L4.8 21l4.32-2.16c.92.24 1.89.36 2.88.36 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">카카오톡 오픈채팅</h2>
            <p className="text-sm text-muted-foreground">실시간으로 소통하는 공공 AI 커뮤니티</p>
          </div>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground mb-6 ml-1">
          {[
            "매일 AI 동향 리포트 공유",
            "공공 AI 실무 Q&A",
            "정부 사업 공고 알림",
            "챔피언·실무자 네트워킹",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#"
          className="inline-flex items-center gap-2 justify-center w-full h-12 rounded-xl text-sm font-semibold bg-[#FEE500] text-[#3C1E1E] hover:bg-[#F5DC00] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.52 5.09 3.84 6.56L4.8 21l4.32-2.16c.92.24 1.89.36 2.88.36 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
          </svg>
          카카오톡 오픈채팅 참여하기
        </a>
      </div>

      {/* 뉴스레터 */}
      <div className="rounded-2xl border bg-card p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">뉴스레터 구독</h2>
            <p className="text-sm text-muted-foreground">매일 아침 공공 AI 인사이트를 이메일로</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          하루가 다르게 바뀌는 AI 동향을 매일 아침 이메일로 받아보세요.
          공공 AI 맥락에서 꼭 알아야 할 핵심 인사이트만 추려 전달합니다.
        </p>
        {submitted ? (
          <div className="rounded-xl bg-primary/10 text-primary text-sm font-medium px-5 py-4 text-center">
            구독 신청이 완료됐습니다. 곧 첫 번째 리포트를 보내드릴게요!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
              className="flex-1 h-11 px-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-60"
            >
              {loading ? "처리 중..." : "구독하기"}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
