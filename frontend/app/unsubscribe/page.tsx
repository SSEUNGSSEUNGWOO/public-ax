import Link from "next/link";

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { done?: string; error?: string };
}) {
  const done = searchParams.done === "1";
  const error = searchParams.error === "1";

  return (
    <div className="container mx-auto px-4 py-32 max-w-md text-center">
      {done ? (
        <>
          <p className="text-4xl mb-4">👋</p>
          <h1 className="text-2xl font-bold mb-3">구독이 취소됐습니다</h1>
          <p className="text-muted-foreground mb-8">
            더 이상 PUBLIC-AX 뉴스레터를 받지 않습니다.<br />
            언제든 다시 구독하실 수 있어요.
          </p>
          <Link href="/" className="text-sm text-primary hover:underline">홈으로 돌아가기</Link>
        </>
      ) : error ? (
        <>
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-2xl font-bold mb-3">오류가 발생했습니다</h1>
          <p className="text-muted-foreground mb-8">
            구독 취소 중 문제가 생겼습니다.<br />
            <a href="mailto:sseung@kbrainc.com" className="text-primary hover:underline">sseung@kbrainc.com</a>으로 문의해 주세요.
          </p>
          <Link href="/" className="text-sm text-primary hover:underline">홈으로 돌아가기</Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-3">구독 취소</h1>
          <p className="text-muted-foreground">잘못된 접근입니다.</p>
        </>
      )}
    </div>
  );
}
