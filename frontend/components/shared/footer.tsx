import Link from "next/link";
import Image from "next/image";

const links = [
  { label: "사이트 소개", href: "/about" },
  { label: "이용약관", href: "/terms" },
  { label: "개인정보", href: "/privacy" },
  { label: "문의", href: "mailto:contact@public-ax.kr", external: true },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-5 flex-wrap">
            <Image src="/kbrain-logo.png" alt="K-BRAIN" width={120} height={32} className="object-contain" />
            <nav className="flex items-center gap-4 text-sm">
              {links.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>
          <p className="text-xs text-muted-foreground/70 font-mono tracking-wider">© 2026 PUBLIC-AX</p>
        </div>

        <p className="text-[11px] text-muted-foreground/60 mt-4 leading-relaxed">
          (주)케이브레인컴퍼니 · 대표 민상일 · 사업자등록번호 129-86-50144 · 통신판매업신고번호 제2026-서울동작-0124호 · 영업소재지 서울 동작구 보라매로5길 51 롯데타워 301~309호
        </p>
      </div>
    </footer>
  );
}
