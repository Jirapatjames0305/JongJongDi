import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "JongJongDi — จองง่าย ครบ จบที่เดียว";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          color: "#2563eb",
          width: 160,
          height: 160,
          borderRadius: 32,
          fontSize: 100,
          fontWeight: 800,
          marginBottom: 32,
          position: "relative",
        }}>
          J
          <div style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 48,
            height: 48,
            borderRadius: 24,
            background: "#f59e0b",
            border: "4px solid white",
          }} />
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 12 }}>JongJongDi</div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>จองง่าย ครบ จบที่เดียว</div>
        <div style={{ fontSize: 24, opacity: 0.75, marginTop: 24 }}>ที่พัก · ทัวร์ดำน้ำ · บริการท่องเที่ยว</div>
      </div>
    ),
    { ...size },
  );
}
