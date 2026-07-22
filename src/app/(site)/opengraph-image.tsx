import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Toro Movers — Family-owned movers across Central Florida · 4.9★ on Google";

export default function OpenGraph() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          color: "#0A0A0A",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: "#C8442A",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            T
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 6,
              color: "#0A0A0A",
            }}
          >
            TORO · MOVERS
          </div>
        </div>

        {/* Star rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 3,
            color: "#C8442A",
            marginBottom: 36,
          }}
        >
          {/* Inline SVG stars — Satori has no ★ glyph in its default font and
              its dynamic-font fetch for it 400s, leaving blank stars on the
              shared card. Drawing them as SVG renders crisp and needs no font. */}
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg
                key={i}
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="#C8442A"
              >
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.169L12 18.896l-7.335 3.857 1.401-8.169L.132 9.21l8.2-1.192z" />
              </svg>
            ))}
          </div>
          <span>4.9 ON GOOGLE</span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 600,
            lineHeight: 1.0,
            letterSpacing: -3,
            color: "#0A0A0A",
            marginBottom: 28,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Central Florida</span>
          <span style={{ color: "#C8442A" }}>movers.</span>
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: 26,
            color: "#4A4A4A",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Family-owned · Up-front pricing · Bilingual crew
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 72,
            right: 72,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 24,
            borderTop: "2px solid #E0DCD4",
            fontSize: 22,
            color: "#0A0A0A",
            fontWeight: 600,
          }}
        >
          <span>toromovers.net</span>
          <span style={{ color: "#C8442A" }}>(689) 600-2720</span>
        </div>
      </div>
    ),
    size,
  );
}
