import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function makeOgImage(title: string, subtitle: string) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "76px 90px",
        color: "#e8ecf7",
        background: "radial-gradient(circle at 20% 20%, #254c48 0, #0b1023 48%, #080b18 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#7cf0b0", fontSize: 30 }}>
        <span style={{ display: "flex", width: 18, height: 18, borderRadius: 99, background: "#7cf0b0", boxShadow: "0 0 22px #7cf0b0" }} />
        <span>FireflyIv</span>
      </div>
      <div style={{ display: "flex", marginTop: 44, maxWidth: 1020, fontSize: 62, lineHeight: 1.22, fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ display: "flex", marginTop: 30, color: "#aeb8d2", fontSize: 28 }}>{subtitle}</div>
    </div>,
    ogSize,
  );
}
