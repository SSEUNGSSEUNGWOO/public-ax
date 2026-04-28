import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PUBLIC-AI";
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
          padding: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 오브젝트 */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            right: "-100px",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,145,46,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "30%",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,145,46,0.10) 0%, transparent 70%)",
          }}
        />

        {/* 심볼 (대괄호 + 점 3단) */}
        <div style={{ position: "absolute", top: "72px", left: "80px", display: "flex" }}>
          <svg width="120" height="120" viewBox="0 0 80 80" fill="none">
            <path d="M22 8 L12 8 L12 56 L22 56" stroke="#fbfaf7" strokeWidth="6" strokeLinecap="square" />
            <path d="M42 8 L52 8 L52 56 L42 56" stroke="#fbfaf7" strokeWidth="6" strokeLinecap="square" />
            <rect x="29" y="20" width="6" height="6" fill="#fbfaf7" />
            <rect x="29" y="29" width="6" height="6" fill="#fbfaf7" />
            <rect x="29" y="38" width="6" height="6" fill="#f5912e" />
          </svg>
        </div>

        {/* 로고 워드마크 */}
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: "28px" }}>
          <span style={{ fontSize: "112px", fontWeight: 700, color: "#fbfaf7", letterSpacing: "-3px", lineHeight: 1 }}>
            PUBLIC
          </span>
          <span style={{ fontSize: "112px", fontWeight: 500, color: "rgba(251,250,247,0.35)", lineHeight: 1, margin: "0 6px" }}>
            -
          </span>
          <span style={{ fontSize: "112px", fontWeight: 700, color: "#f5912e", letterSpacing: "-2px", lineHeight: 1 }}>
            AI
          </span>
        </div>

        {/* 부제 */}
        <p style={{ fontSize: "32px", color: "rgba(251,250,247,0.6)", margin: 0, lineHeight: 1.35, fontWeight: 400 }}>
          공공 AI 전환의 모든 신호를 한 곳에서
        </p>
        <p style={{ fontSize: "20px", color: "rgba(251,250,247,0.35)", margin: "16px 0 0", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Kbrain AI Public Center
        </p>
      </div>
    ),
    { ...size }
  );
}
