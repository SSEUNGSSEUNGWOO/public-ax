import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  about: [
    { label: "사이트 소개", href: "/about" },
    { label: "운영 주체", href: "/about" },
  ],
  resources: [
    { label: "공공데이터포털", href: "https://www.data.go.kr", external: true },
    { label: "나라장터", href: "https://www.g2b.go.kr", external: true },
  ],
  legal: [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold mb-3">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/join"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  카카오 오픈채팅
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@public-ax.kr"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  이메일 문의
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image src="/logo-color.svg" alt="PUBLIC-AX" width={100} height={27} />
          <p className="text-sm text-muted-foreground">
            &copy; 2026 PUBLIC-AX · 케이브레인 AI퍼블릭센터
          </p>
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-shrink-0">
            <Image src="/kbrain-logo.png" alt="K-BRAIN" width={140} height={40} className="object-contain" />
          </div>
          <div className="text-xs text-muted-foreground space-y-1 leading-relaxed">
            <p>상호명: (주)케이브레인컴퍼니 | 브랜드: DAEASY(데이지)</p>
            <p>대표: 민상일 (사업자등록번호: 129-86-50144)</p>
            <p>통신판매업신고번호: 제2026-서울동작-0124호</p>
            <p>영업소재지: 서울특별시 동작구 보라매로5길 51 롯데타워 301~309호</p>
            <p>공개교육장: 서울시 마포구 성암로 189 중소기업DMC타워 701호</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
