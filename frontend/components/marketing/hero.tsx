"use client";

import Image from "next/image";
import { LinkButton } from "@/components/shared/link-button";
import { BorderBeam } from "@/components/ui/border-beam";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { HeroSearch } from "@/components/marketing/hero-search";

interface HeroProps {
  bgImage?: string | null;
}

export function Hero({ bgImage }: HeroProps) {
  return (
    <section className="relative flex flex-col overflow-hidden" style={{ height: "100svh", minHeight: "600px" }}>
      {bgImage && (
        <>
          <Image
            src={bgImage}
            alt="hero background"
            fill
            className="object-cover object-center -z-20"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </>
      )}
      {!bgImage && (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.68_0.18_50_/_0.15),transparent)]" />
      )}

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "200px", background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))" }} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative flex-1 flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <div className="w-full text-center">
          <div style={{ opacity: 0, animation: "fadeUp 0.7s ease 0.1s forwards" }}>
            <span
              className="mb-6 inline-flex px-5 py-2 rounded-full text-2xl font-bold text-white"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              대한민국 공공기관 AI 아카이브 & 커뮤니티 플랫폼
            </span>
          </div>

          <h1 className="font-bold text-white drop-shadow-lg mb-4" style={{ fontSize: "clamp(5rem, 15vw, 11rem)", letterSpacing: "-0.03em", lineHeight: 0.95, fontFamily: "var(--font-display)", whiteSpace: "nowrap", opacity: 0, animation: "fadeUp 0.7s ease 0.3s forwards" }}>
            PUBLIC-AX
          </h1>
          <div className="w-full px-4 mb-8 max-w-sm md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto mt-16" style={{ opacity: 0, animation: "fadeUp 0.7s ease 0.75s forwards" }}>
            <HeroSearch />
          </div>

        </div>
      </div>
    </section>
  );
}
