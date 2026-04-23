import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "공공 AX 커뮤니티",
    template: "%s | 공공 AX 커뮤니티",
  },
  description:
    "대한민국 공공 AI 전환(AX)을 이끄는 사람과 작품을 아카이빙하고, 조달 동향과 인사이트를 제공하는 커뮤니티 포털",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "공공 AX 커뮤니티",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
