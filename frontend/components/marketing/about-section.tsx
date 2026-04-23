"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const statements = [
  { ko: "어제와 다릅니다.", en: "Different from yesterday." },
  { ko: "오늘도 다릅니다.", en: "Different today." },
  { ko: "변화가 시작됩니다.", en: "Change begins here." },
];

const marqueeWords = [
  "중앙부처", "지자체", "공공기관", "arXiv", "GitHub", "NIA",
  "정책", "기술", "현장", "AX", "AI 전환", "실무자", "아카이브",
  "커뮤니티", "RAG", "LLM", "프롬프트", "Hall of Fame",
];

interface PillarStats {
  insightCount: number;
  championCount: number;
  portfolioCount: number;
}

export function AboutSection({ insightCount, championCount, portfolioCount }: PillarStats) {
  const pillars = [
    {
      no: "01",
      tag: "ARCHIVE · 아카이브",
      title: "일일 인사이트",
      sub: "arXiv · GitHub · 국내외 AI 뉴스",
      desc: "공공 AI 맥락의 핵심만 간추려 매일 아침 발행. 실무자가 하루 10분으로 따라잡을 수 있도록.",
      kpi: { n: insightCount.toLocaleString(), l: "오늘 수집 항목" },
      cta: "오늘자 리포트",
      href: "/insights",
    },
    {
      no: "02",
      tag: "PEOPLE · 사람",
      title: "AX 챔피언",
      sub: "Hall of Fame · 실무자 인증",
      desc: "공공기관 AI 전환을 이끈 사람을 기록합니다. 추상이 아니라 이름과 얼굴로 남기는 아카이브.",
      kpi: { n: championCount.toLocaleString(), l: "인증된 챔피언" },
      cta: "명예의 전당",
      href: "/champions",
    },
    {
      no: "03",
      tag: "CASES · 사례",
      title: "도입 사례",
      sub: "AX 포트폴리오 · 현장 기반",
      desc: "실제 배포된 시스템을 기술 스택·성과·실패·교훈까지 정직하게 정리. 공공 도입 담당자의 1차 참고자료.",
      kpi: { n: portfolioCount.toLocaleString(), l: "아카이브 사례" },
      cta: "포트폴리오",
      href: "/portfolio",
    },
  ];

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((x) => (x + 1) % statements.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-y overflow-hidden">

      {/* Marquee ribbon */}
      <div className="bg-foreground border-b py-2.5 overflow-hidden">
        <div
          className="flex whitespace-nowrap font-mono text-[11px] tracking-[0.2em] uppercase text-background/80"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {[...Array(2)].map((_, k) => (
            <span key={k} className="flex items-center flex-shrink-0">
              {marqueeWords.map((w, i) => (
                <span key={i} className="flex items-center">
                  <span className="mx-6">{w}</span>
                  <span className="text-primary">◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>


{/* Manifesto */}
      <div className="px-8 lg:px-14 pt-12 pb-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <div className="text-[11px] font-mono tracking-[0.22em] uppercase text-primary mb-6">
              Public-AX · Manifesto
            </div>
            <h2 className="font-bold leading-[0.95] tracking-[-0.03em] text-foreground"
                style={{ fontSize: "clamp(52px, 8vw, 100px)", lineHeight: 1.15 }}>
              AI는 <span className="text-primary italic">매일</span>,<br />
              <span
                className="inline-block transition-all duration-300"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
              >
                {statements[idx].ko}
              </span>
            </h2>
          </div>

          <div className="lg:col-span-4 pb-1">
            <p className="text-sm leading-[1.8] text-muted-foreground mb-5">
              케이브레인 AI퍼블릭센터는 대한민국 공공기관의 AI 전환(AX)을 지원합니다.
              정책 · 기술 · 현장 사례를 분석해, 실무자가 바로 쓸 수 있는 인사이트로 재구성합니다.
            </p>
            <div className="border-t pt-4 font-mono text-[10.5px] tracking-[0.14em] uppercase flex items-center justify-between text-muted-foreground">
              <span
                className="text-foreground transition-all duration-300"
                style={{ opacity: visible ? 1 : 0 }}
              >
                {statements[idx].en}
              </span>
              <span className="tabular-nums">{String(idx + 1).padStart(2, "0")}/{String(statements.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillar cards */}
      <div className="border-t grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
        {pillars.map((p, i) => (
          <div
            key={i}
            className={`p-8 lg:p-10 flex flex-col ${i === 1 ? "bg-muted/40" : ""}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                {p.tag}
              </div>
              <div className="text-[48px] font-bold leading-none text-primary/20 tabular-nums italic">
                {p.no}
              </div>
            </div>

            <h3 className="text-[28px] font-bold leading-[1.05] tracking-tight mb-1">
              {p.title}
            </h3>
            <div className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground mb-4">
              {p.sub}
            </div>

            <p className="text-sm leading-[1.75] text-muted-foreground mb-8">
              {p.desc}
            </p>

            <div className="mt-auto pt-5 border-t flex items-end justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
                  {p.kpi.l}
                </div>
                <div className="text-[28px] font-bold leading-none tabular-nums">
                  {p.kpi.n}
                </div>
              </div>
              <Link
                href={p.href}
                className="font-mono text-[11px] tracking-[0.14em] uppercase text-primary flex items-center gap-1.5 hover:gap-2.5 transition-all"
              >
                {p.cta} <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

<style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
