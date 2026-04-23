import { LinkButton } from "@/components/shared/link-button";

export function JoinCta() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/join-bg.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              공공 AI 생태계에 참여하세요
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto text-lg">
              챔피언들과 실무자, 기업이 함께 만들어가는 커뮤니티
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/join"
                className="inline-flex items-center gap-2 justify-center h-11 px-8 rounded-md text-sm font-semibold bg-[#FEE500] text-[#3C1E1E] hover:bg-[#F5DC00] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.52 5.09 3.84 6.56L4.8 21l4.32-2.16c.92.24 1.89.36 2.88.36 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
                </svg>
                카카오톡 오픈채팅 참여
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
