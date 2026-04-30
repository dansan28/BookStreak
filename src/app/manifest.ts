import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BookStreak",
    short_name: "BookStreak",
    description: "Tu hábito de lectura diaria",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0F0F18",
    theme_color: "#9B72CF",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
