import { LinkButton } from "@/components/shared/link-button";

export function JoinCta() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              공공 AI 생태계에 참여하세요
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto text-lg">
              챔피언들과 실무자, 기업이 함께 만들어가는 커뮤니티
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <LinkButton
                href="/join"
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 border-white"
              >
                카카오 오픈채팅 참여
              </LinkButton>
              <LinkButton
                href="/join"
                size="lg"
                variant="outline"
                className="border-white/30 text-primary-foreground hover:bg-white/10 px-8"
              >
                챔피언 지원하기
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
