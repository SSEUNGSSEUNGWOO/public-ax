import Link from "next/link";
import Image from "next/image";

const cards = [
  {
    href: "/insights",
    title: "Insights",
    desc: "하루가 다른 AI 현장 소식을 받아보세요",
    badge: "최신 인사이트",
    image: "/card-insights.jpg",
  },
  {
    href: "/champions",
    title: "AI Champion",
    desc: "공공 AI를 이끄는 사람들",
    badge: "127명+",
    image: "/card-champions.jpg",
  },
  {
    href: "/portfolio",
    title: "Portfolio",
    desc: "현장에서 만들어진 AI 작품들",
    badge: "340개+",
    image: "/card-portfolio.jpg",
  },
];

export function NavCards() {
  return (
    <div className="relative z-10 px-4" style={{ marginTop: "-110px" }}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group block relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
            style={{
              height: "220px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)",
              }}
            />
            <div className="absolute top-4 left-4">
              <span
                className="text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full text-white"
                style={{ background: "oklch(0.68 0.18 50)" }}
              >
                {card.badge}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 p-5">
              <div className="text-white text-xl font-bold mb-1.5 leading-tight">
                {card.title}
              </div>
              <p className="text-white/65 text-xs leading-relaxed">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
