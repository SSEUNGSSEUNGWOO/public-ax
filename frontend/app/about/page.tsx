import Image from "next/image";
import { PageHeader } from "@/components/shared/page-header";

const navItems = [
  { href: "#overview", label: "PUBLIC-AI 소개" },
  { href: "#greeting", label: "인사말" },
  { href: "#mv", label: "미션 · 비전" },
  { href: "#services", label: "주요 서비스" },
  { href: "#contact", label: "오시는 길" },
];

const services = [
  { icon: "1", label: "DAILY BRIEFING", name: "Daily Insight", ko: "데일리 인사이트", desc: "담당 직무와 현안에 맞춘 정책 브리프를 매일 아침 이메일로 전달합니다.", href: "/insights" },
  { icon: "2", label: "GUIDE", name: "AI Guide", ko: "AI 도입 가이드", desc: "RAG·Agent·LLM 같은 핵심 주제를 공공기관 도입 관점에서 단계별로 정리한 실무 가이드.", href: "/guide" },
  { icon: "3", label: "PROCUREMENT", name: "K-AI Proc", ko: "정부 AI 공고", desc: "나라장터 AI 발주를 자동 분류·집계하고 실시간 모니터링·맞춤 추천을 제공합니다.", href: "/proc" },
  { icon: "4", label: "COMMUNITY", name: "Community", ko: "커뮤니티", desc: "공공 AI 실무자가 사례·노하우·고민을 나누는 폐쇄형 커뮤니티. 인증 가입 후 참여.", href: "/join" },
];

function SectionHead({ num, title, meta }: { num: string; title: string; meta: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-6 pb-4 border-b-2 border-foreground">
      <h2 className="text-xl font-bold flex items-baseline gap-2">
        <span className="font-mono text-xs text-primary font-semibold tracking-wider">{num}</span>
        {title}
      </h2>
      <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">{meta}</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <PageHeader
            eyebrow="About"
            title="PUBLIC-AI 소개"
            description="대한민국 공공 AI 전환을 위한 통합 플랫폼, PUBLIC-AI를 소개합니다."
          />
        </div>
      </div>
      {/* BODY */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        {/* Identity hero */}
        <section className="rounded-3xl border bg-card overflow-hidden mb-14">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
            <div className="bg-muted/40 p-10 md:p-12 flex items-center justify-center border-b md:border-b-0 md:border-r">
              <Image
                src="/logo-color.svg"
                alt="PUBLIC-AI"
                width={240}
                height={69}
                priority
              />
            </div>
            <div className="p-10 md:p-12">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-primary mb-4">
                Brand · Identity
              </div>
              <p className="text-[15px] leading-[1.9] text-muted-foreground">
                PUBLIC-AI의 마크는 관보·공시의 <strong className="text-foreground font-semibold">대괄호 [ ]</strong> 안에 정렬된 <strong className="text-foreground font-semibold">점</strong>입니다.
                공공의 <strong className="text-foreground font-semibold">&lsquo;틀&rsquo;</strong>이 그 자체로 신호를 담는 그릇이 됩니다.
              </p>
              <p className="text-[15px] leading-[1.9] text-muted-foreground mt-1.5">
                가운데 <strong className="text-foreground font-semibold">점 세 개</strong>는 쌓이는 신호,
                마지막 한 점의 <span className="text-primary font-semibold">오렌지</span>는 <span className="text-primary font-semibold">전환(AI)</span>의 신호입니다.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[200px_1fr] gap-14 items-start">

          {/* SIDE NAV */}
          <aside className="sticky top-20">
            <div className="rounded-2xl border overflow-hidden">
              <div className="bg-foreground text-background px-5 py-4">
                <div className="font-bold text-sm">소개</div>
                <div className="font-mono text-[10px] text-background/60 tracking-widest mt-0.5">ABOUT</div>
              </div>
              <nav>
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-5 py-3 text-sm text-muted-foreground border-t hover:bg-muted/50 hover:text-foreground transition-colors"
                  >
                    {item.label}
                    <span className="text-muted-foreground/50 text-xs">›</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="min-w-0 space-y-16">

            {/* 01 OVERVIEW */}
            <section className="scroll-mt-24" id="overview">
              <SectionHead num="01" title="PUBLIC-AI 소개" meta="Overview" />
              <div className="grid grid-cols-[1fr_240px] gap-10 items-start">
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">PUBLIC-AI</strong>는 대한민국 공공부문의 AI 전환을 지원하기 위해{" "}
                    <strong className="text-foreground">Kbrain AI Public Center</strong>가 운영하는 공공 전문 AI 플랫폼입니다.
                  </p>
                  <p>
                    공공 실무자가 매일 마주하는 방대한 정책 문서·법령·보고서를 한 곳에 모으고,{" "}
                    <mark className="bg-primary/15 text-foreground font-medium px-0.5 rounded">도메인 특화 AI가 실무자의 언어로 정리해 전달</mark>합니다.
                    정보 탐색에 쓰이던 시간을 줄이고, 본질적인 정책 설계와 의사결정에 집중할 수 있도록 돕는 것이 PUBLIC-AI의 역할입니다.
                  </p>
                  <p>
                    PUBLIC-AI는 <strong className="text-foreground">데일리 인사이트 · AI 도입 가이드 · 정부 AI 공고 · 커뮤니티</strong>의 네 축으로 구성된 통합 플랫폼입니다.
                  </p>
                </div>
                <div className="rounded-xl border overflow-hidden text-sm">
                  {[
                    { k: "브랜드", v: "PUBLIC-AI" },
                    { k: "법인명", v: "(주)케이브레인컴퍼니" },
                    { k: "운영 주체", v: "케이브레인 AI퍼블릭센터" },
                    { k: "설립", v: "2010년 8월 20일" },
                    { k: "소재지", v: "서울 동작구 보라매로5길 51" },
                  ].map((f, i) => (
                    <div key={f.k} className={`flex flex-col gap-0.5 px-4 py-3 ${i > 0 ? "border-t" : ""} bg-muted/20`}>
                      <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">{f.k}</span>
                      <span className="font-medium text-foreground">{f.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 02 GREETING */}
            <section className="scroll-mt-24" id="greeting">
              <SectionHead num="02" title="인사말" meta="Greeting" />
              <div className="max-w-2xl space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p className="font-mono text-xs text-primary tracking-widest uppercase mb-3">Letter from the Director</p>
                <h3 className="text-xl font-bold text-foreground leading-snug">
                  기술은 수단이고, <span className="text-primary">행정은 본질</span>입니다.
                </h3>
                <p>PUBLIC-AI는 민간의 AI 도구를 공공에 단순 이식하는 프로젝트가 아닙니다. 공공의 언어, 절차, 그리고 책임의 무게를 먼저 이해한 위에 AI를 얹는 일입니다.</p>
                <p>저희는 중앙부처 · 지자체 · 국책연구원에서 정책을 만들어 온 전문가들과, 민간에서 AI 제품을 만들어 온 엔지니어들이 함께 모여 일합니다. 서로 다른 언어를 쓰는 두 세계를 이어, 신뢰할 수 있는 공공 AI 인프라를 구축하는 것이 우리의 역할입니다.</p>
                <p>공공 AI 전환은 한 번의 프로젝트가 아니라 10년의 여정입니다. PUBLIC-AI가 그 여정의 든든한 동반자가 되도록 노력하겠습니다.</p>
              </div>
            </section>

            {/* 03 WHY */}
            <section className="scroll-mt-24" id="why">
              <SectionHead num="03" title="왜 PUBLIC-AI인가" meta="Background" />
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-muted/20 p-6">
                  <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-3">● 공공 현장의 문제</div>
                  <h4 className="font-bold text-base mb-3 leading-snug">정보는 넘치고, 시간은 부족합니다.</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">공공 실무자 1인이 하루에 마주하는 문서는 평균 72건. 검토할 자료는 매년 늘어나지만 실무 시간은 오히려 줄고 있습니다.</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "일일 정보 탐색 시간 평균 3.4시간",
                      "\"필요 자료를 못 찾는다\" 응답 68%",
                      "민간 대비 공공 AI 도입 속도 2.7배 격차",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">·</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
                  <div className="font-mono text-[10px] text-primary tracking-widest uppercase mb-3">▲ PUBLIC-AI의 해법</div>
                  <h4 className="font-bold text-base mb-3 leading-snug">읽고, 이해하고, 실무 언어로 되돌려드립니다.</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">공공 도메인에 특화된 LLM과 검증된 공공 데이터 코퍼스를 결합해, 담당자 맥락에 맞춘 실무용 인사이트를 제공합니다.</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "공공행정 용어와 법령 구조를 학습한 전용 LLM",
                      "국회·부처·지자체 원문을 매일 수집·정제",
                      "모든 출력에 원문 출처와 생성 로그 보존",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 04 MISSION / VISION */}
            <section className="scroll-mt-24" id="mv">
              <SectionHead num="04" title="미션 · 비전" meta="Mission · Vision" />
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border p-6">
                  <div className="font-mono text-[10px] text-primary tracking-widest uppercase mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary inline-block" />
                    MISSION · 사명
                  </div>
                  <h4 className="text-lg font-bold leading-snug mb-3">공공 실무의 <span className="text-primary">&lsquo;막힘&rsquo;</span>을 없앱니다.</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">AI 기술을 공공의 언어로 번역합니다. 민간이 먼저 누린 생산성의 도약을 28만 공공 종사자와, 그들이 매일 응답해야 할 5천만 국민에게 돌려드리는 것이 우리의 사명입니다.</p>
                </div>
                <div className="rounded-2xl bg-foreground text-background p-6">
                  <div className="font-mono text-[10px] text-background/60 tracking-widest uppercase mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary inline-block" />
                    VISION · 비전
                  </div>
                  <h4 className="text-lg font-bold leading-snug mb-3">2030년, <span className="text-primary">모든</span> 공공 의사결정에 AI가 함께합니다.</h4>
                  <p className="text-sm text-background/75 leading-relaxed">정책의 설계부터 집행·평가까지 AI가 보조 파일럿으로 상주하는 정부. PUBLIC-AI는 더 빠르고 더 공정한 행정을 위한 디지털 인프라를 지향합니다.</p>
                </div>
              </div>
            </section>

            {/* 05 SERVICES */}
            <section className="scroll-mt-24" id="services">
              <SectionHead num="05" title="주요 서비스" meta="4 Services" />
              <div className="rounded-2xl border overflow-hidden">
                {services.map((s, i) => (
                  <a
                    key={s.name}
                    href={s.href}
                    className={`grid grid-cols-[48px_180px_1fr_auto] gap-6 items-center px-6 py-5 hover:bg-muted/40 transition-colors group ${i > 0 ? "border-t" : ""}`}
                  >
                    <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono text-lg font-bold">
                      {s.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.ko}</div>
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">바로가기 →</span>
                  </a>
                ))}
              </div>
            </section>

            {/* 06 LOCATION */}
            <section className="scroll-mt-24" id="contact">
              <SectionHead num="06" title="오시는 길" meta="Location" />
              <div className="rounded-2xl border p-6">
                {[
                  { k: "영업소재지", v: "서울 동작구 보라매로5길 51 롯데타워 301~309호" },
                  { k: "공개교육장", v: "서울 마포구 성암로 189 중소기업DMC타워 701호" },
                  { k: "대표", v: "민상일" },
                  { k: "사업자번호", v: "129-86-50144" },
                ].map((r) => (
                  <div key={r.k} className="grid grid-cols-[90px_1fr] gap-3 py-2 text-sm">
                    <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase pt-0.5">{r.k}</span>
                    <span className="text-foreground">{r.v}</span>
                  </div>
                ))}
                <a
                  href="https://map.kakao.com/link/search/서울 동작구 보라매로5길 51 롯데타워"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-between rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors px-5 py-4 group"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">동작구 보라매로5길 51 롯데타워 301~309호</p>
                    <p className="text-[11px] text-muted-foreground">카카오맵에서 길찾기</p>
                  </div>
                  <svg className="text-muted-foreground group-hover:text-primary transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
                <p className="mt-2 text-[11px] text-muted-foreground/60 font-mono tracking-widest">통신판매업신고번호: 제2026-서울동작-0124호</p>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
