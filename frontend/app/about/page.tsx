import { PageHeader } from "@/components/shared/page-header";

const navItems = [
  { href: "#overview", label: "PUBLIC-AX 소개" },
  { href: "#greeting", label: "인사말" },
  { href: "#mv", label: "미션 · 비전" },
  { href: "#services", label: "주요 서비스" },
  { href: "#history", label: "연혁" },
  { href: "#contact", label: "연락처" },
];

const services = [
  { icon: "DI", label: "DAILY BRIEFING", name: "Daily Insight", ko: "데일리 인사이트", desc: "담당 직무와 현안에 맞춘 정책 브리프를 매일 아침 이메일로 전달합니다.", href: "/insights" },
  { icon: "AC", label: "LEARNING", name: "AI Champion", ko: "AI 챔피언", desc: "기관 내 AX 전환을 주도할 핵심 인재를 발굴·육성하는 6주 집중 프로그램.", href: "/champions" },
  { icon: "AX", label: "CASE LIBRARY", name: "AX Portfolio", ko: "AX 포트폴리오", desc: "국내외 공공 AI 도입 사례 320여 건을 구조화해 제공하는 레퍼런스 라이브러리.", href: "/portfolio" },
  { icon: "GP", label: "PROCUREMENT", name: "Gov AI Procurement", ko: "조달 가이드", desc: "과업지시서 템플릿과 예가 산정 기준, 검증 벤더 리스트를 제공하는 AI 조달 내비게이터.", href: "/proc" },
];

const history = [
  {
    year: "2026",
    events: [
      { month: "04월", desc: "AX Portfolio 국내외 사례 300건 돌파" },
      { month: "02월", desc: "조달 가이드(Gov AI Procurement) 정식 서비스 개시" },
    ],
  },
  {
    year: "2025",
    events: [
      { month: "11월", desc: "중앙부처·광역지자체 기관 파트너십 40개 확보" },
      { month: "07월", desc: "AI Champion 1기 수료 · 수료생 58명 배출" },
      { month: "03월", desc: "Daily Insight 정식 출시, 이용자 1만 명 돌파" },
    ],
  },
  {
    year: "2024",
    events: [
      { month: "09월", desc: "공공 도메인 특화 LLM 파이프라인 v1 완성" },
      { month: "06월", desc: "Daily Insight 베타 오픈" },
      { month: "03월", desc: "Kbrain AI Public Center 내 PUBLIC-AX 프로젝트 출범" },
    ],
  },
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
            title="PUBLIC-AX 소개"
            description="대한민국 공공 AI 전환(AX)을 위한 통합 플랫폼, PUBLIC-AX를 소개합니다."
          />
        </div>
      </div>
      {/* BODY */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
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
            <section id="overview">
              <SectionHead num="01" title="PUBLIC-AX 소개" meta="Overview" />
              <div className="grid grid-cols-[1fr_240px] gap-10 items-start">
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">PUBLIC-AX</strong>는 대한민국 공공부문의 AI 전환(AX)을 지원하기 위해{" "}
                    <strong className="text-foreground">Kbrain AI Public Center</strong>가 운영하는 공공 전문 AI 플랫폼입니다.
                  </p>
                  <p>
                    공공 실무자가 매일 마주하는 방대한 정책 문서·법령·보고서를 한 곳에 모으고,{" "}
                    <mark className="bg-primary/15 text-foreground font-medium px-0.5 rounded">도메인 특화 AI가 실무자의 언어로 정리해 전달</mark>합니다.
                    정보 탐색에 쓰이던 시간을 줄이고, 본질적인 정책 설계와 의사결정에 집중할 수 있도록 돕는 것이 PUBLIC-AX의 역할입니다.
                  </p>
                  <p>
                    PUBLIC-AX는 <strong className="text-foreground">데일리 인사이트 · AI 챔피언 · AX 포트폴리오 · 정부 AI 조달 가이드</strong>의 네 축으로 구성된 통합 플랫폼입니다.
                  </p>
                </div>
                <div className="rounded-xl border overflow-hidden text-sm">
                  {[
                    { k: "브랜드", v: "PUBLIC-AX" },
                    { k: "법인명", v: "(주)케이브레인컴퍼니" },
                    { k: "운영 주체", v: "케이브레인 AI퍼블릭센터" },
                    { k: "설립", v: "2024년 3월" },
                    { k: "소재지", v: "서울 동작구 보라매로5길 51" },
                    { k: "이용 대상", v: "중앙부처 · 지자체 · 공공기관" },
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
            <section id="greeting">
              <SectionHead num="02" title="인사말" meta="Greeting" />
              <div className="max-w-2xl space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p className="font-mono text-xs text-primary tracking-widest uppercase mb-3">Letter from the Director</p>
                <h3 className="text-xl font-bold text-foreground leading-snug">
                  기술은 수단이고, <span className="text-primary">행정은 본질</span>입니다.
                </h3>
                <p>PUBLIC-AX는 민간의 AI 도구를 공공에 단순 이식하는 프로젝트가 아닙니다. 공공의 언어, 절차, 그리고 책임의 무게를 먼저 이해한 위에 AI를 얹는 일입니다.</p>
                <p>저희는 중앙부처 · 지자체 · 국책연구원에서 정책을 만들어 온 전문가들과, 민간에서 AI 제품을 만들어 온 엔지니어들이 함께 모여 일합니다. 서로 다른 언어를 쓰는 두 세계를 이어, 신뢰할 수 있는 공공 AI 인프라를 구축하는 것이 우리의 역할입니다.</p>
                <p>공공 AX는 한 번의 프로젝트가 아니라 10년의 여정입니다. PUBLIC-AX가 그 여정의 든든한 동반자가 되도록 노력하겠습니다.</p>
              </div>
            </section>

            {/* 03 WHY */}
            <section id="why">
              <SectionHead num="03" title="왜 PUBLIC-AX인가" meta="Background" />
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
                  <div className="font-mono text-[10px] text-primary tracking-widest uppercase mb-3">▲ PUBLIC-AX의 해법</div>
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
            <section id="mv">
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
                  <p className="text-sm text-background/75 leading-relaxed">정책의 설계부터 집행·평가까지 AI가 보조 파일럿으로 상주하는 정부. PUBLIC-AX는 더 빠르고 더 공정한 행정을 위한 디지털 인프라를 지향합니다.</p>
                </div>
              </div>
            </section>

            {/* 05 SERVICES */}
            <section id="services">
              <SectionHead num="05" title="주요 서비스" meta="4 Services" />
              <div className="rounded-2xl border overflow-hidden">
                {services.map((s, i) => (
                  <a
                    key={s.name}
                    href={s.href}
                    className={`grid grid-cols-[48px_180px_1fr_auto] gap-6 items-center px-6 py-5 hover:bg-muted/40 transition-colors group ${i > 0 ? "border-t" : ""}`}
                  >
                    <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold">
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

            {/* 06 HISTORY */}
            <section id="history">
              <SectionHead num="06" title="연혁" meta="History" />
              <div className="space-y-0">
                {history.map((h, i) => (
                  <div key={h.year} className={`grid grid-cols-[80px_1fr] gap-6 py-4 ${i < history.length - 1 ? "border-b" : ""}`}>
                    <div className="font-mono text-sm font-semibold text-primary pt-0.5">{h.year}</div>
                    <ul className="space-y-1.5">
                      {h.events.map((e) => (
                        <li key={e.month} className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground mr-2">{e.month}</span>{e.desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 07 CONTACT */}
            <section id="contact">
              <SectionHead num="07" title="연락처" meta="Contact" />
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border p-6">
                  <h4 className="text-sm font-bold mb-4 pb-3 border-b flex justify-between">
                    연락처 <span className="font-mono text-[10px] text-muted-foreground font-normal tracking-widest">CONTACT</span>
                  </h4>
                  {[
                    { k: "대표 이메일", v: "contact@public-ax.kr", href: "mailto:contact@public-ax.kr" },
                    { k: "업무 시간", v: "평일 10:00 – 18:00 (KST)" },
                  ].map((r) => (
                    <div key={r.k} className="grid grid-cols-[90px_1fr] gap-3 py-2 text-sm">
                      <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase pt-0.5">{r.k}</span>
                      {r.href
                        ? <a href={r.href} className="text-primary hover:underline font-medium">{r.v}</a>
                        : <span className="text-foreground">{r.v}</span>
                      }
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border p-6">
                  <h4 className="text-sm font-bold mb-4 pb-3 border-b flex justify-between">
                    오시는 길 <span className="font-mono text-[10px] text-muted-foreground font-normal tracking-widest">LOCATION</span>
                  </h4>
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
                  <div className="mt-4 rounded-xl overflow-hidden border aspect-video">
                    <iframe
                      src="https://maps.google.com/maps?q=서울특별시+동작구+보라매로5길+51+롯데타워&t=&z=16&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground/60 font-mono tracking-widest">통신판매업신고번호: 제2026-서울동작-0124호</p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
