import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ThunderFix — เรื่องช่าง ใกล้แค่นี้",
    short_name: "ThunderFix",
    description: "หาช่างใกล้บ้าน เรียกช่างด่วน คุยและติดตามงานในที่เดียว",
    lang: "th",
    start_url: "/launch",
    scope: "/",
    display: "standalone",
    background_color: "#f7f7f2",
    theme_color: "#f7f7f2",
    prefer_related_applications: false,
    categories: ["lifestyle", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "งานด่วนใกล้คุณ",
        short_name: "งานด่วน",
        url: "/launch?action=urgent",
      },
      { name: "งานของฉัน", url: "/launch?action=jobs" },
      { name: "ข้อความ", url: "/launch?action=chat" },
    ],
  };
}
