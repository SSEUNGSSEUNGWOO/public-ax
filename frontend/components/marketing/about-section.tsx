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
  guideCount: number;
  procCount: number;
}

export function AboutSection({ insightCount, guideCount, procCount }: PillarStats) {
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
      tag: "GUIDE · 가이드",
      title: "AI 도입 가이드",
      sub: "주제별 단계 가이드 · 실무 체크리스트",
      desc: "RAG·Agent·LLM 같은 핵심 주제를 공공기관 도입 관점에서 단계별로 정리. 실무 의사결정에 바로 쓸 수 있는 1차 자료.",
      kpi: { n: guideCount.toLocaleString(), l: "발행된 가이드" },
      cta: "가이드 보기",
      href: "/guide",
    },
    {
      no: "03",
      tag: "PROC · 발주",
      title: "정부 AI 공고",
      sub: "나라장터 · 실시간 모니터링",
      desc: "AI·디지털전환·빅데이터 관련 공공 입찰을 자동 분류·집계. 마감 임박순 정렬과 카테고리·예산 필터로 입찰 참여를 가속화.",
      kpi: { n: procCount.toLocaleString(), l: "활성 공고" },
      cta: "공고 보기",
      href: "/proc",
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
      <div className="px-4 md:px-8 lg:px-14 pt-12 pb-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <div className="text-[11px] font-mono tracking-[0.22em] uppercase text-primary mb-6">
              Public-AX · Manifesto
            </div>
            <h2 className="font-bold leading-[0.95] tracking-[-0.03em] text-foreground"
                style={{ fontSize: "clamp(1.75rem, 7vw, 6.25rem)", lineHeight: 1.15 }}>
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
