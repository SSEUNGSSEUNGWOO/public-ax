import Link from "next/link";
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
        <p className="text-sm text-muted-foreground text-center">
          &copy; 2026 공공 AX 커뮤니티. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
