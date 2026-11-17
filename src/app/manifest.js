import { SITE } from "@/config/site";

export default function manifest() {
  return {
    name: "CampusCart – Student Second-Hand Marketplace",
    short_name: "CampusCart",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f0",
    theme_color: "#173d32",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
