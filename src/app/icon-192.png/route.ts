import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #9B72CF 0%, #6B4FA0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
        },
      },
      React.createElement(
        "span",
        { style: { fontSize: 110, color: "white", fontWeight: 700, lineHeight: 1 } },
        "B"
      )
    ),
    { width: 192, height: 192 }
  );
}
