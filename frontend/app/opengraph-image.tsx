import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PUBLIC-AX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0A0B",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 오브젝트 */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(220,130,60,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "40%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(220,130,60,0.08) 0%, transparent 70%)",
          }}
        />

        {/* 심볼 (꺽쇠 두 개) */}
        <div style={{ position: "absolute", top: "64px", left: "80px", display: "flex", gap: "6px" }}>
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
            <polyline points="20,20 50,50 20,80" stroke="#e8e8e8" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="50,20 80,50 50,80" stroke="#DC823C" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* 로고 워드마크 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "0px", marginBottom: "24px" }}>
          <span style={{ fontSize: "88px", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-3px", lineHeight: 1 }}>
            PUBLIC
          </span>
          <span style={{ fontSize: "88px", fontWeight: 400, color: "rgba(245,245,245,0.35)", letterSpacing: "-1px", lineHeight: 1, margin: "0 10px" }}>
            –
          </span>
          <span style={{ fontSize: "88px", fontWeight: 500, color: "#DC823C", letterSpacing: "-2px", lineHeight: 1 }}>
            AX
          </span>
        </div>

        {/* 설명 */}
        <p style={{ fontSize: "28px", color: "rgba(245,245,245,0.5)", margin: 0, lineHeight: 1.4, fontWeight: 400 }}>
          공공 AI 전환 플랫폼 · 케이브레인 AI퍼블릭센터
        </p>
      </div>
    ),
    { ...size }
  );
}
