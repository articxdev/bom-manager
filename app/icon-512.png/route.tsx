import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 280,
          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: 100,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, sans-serif",
          border: "20px solid white",
        }}
      >
        B
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
